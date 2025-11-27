const request = require('supertest');
const app = require('../server');
const ReservationModel = require('../infrastructure/models/ReservationModel');
const BookModel = require('../infrastructure/models/BookModel');
const UserModel = require('../infrastructure/models/UserModel');
const jwt = require('jsonwebtoken');

describe('Reservation Controller', () => {
  let testUser;
  let testToken;
  let testBook;
  let testReservation;

  beforeEach(async () => {
    testUser = await UserModel.create({
      nombre: 'Usuario Test',
      correo: 'test@example.com',
      contraseña: 'password123'
    });

    testToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET || 'test-secret');

    testBook = await BookModel.create({
      nombre: 'Libro Test',
      autor: 'Autor Test',
      genero: 'Ficción',
      fechaPublicacion: new Date('2020-01-01'),
      casaEditorial: 'Editorial Test',
      disponible: true
    });

    testReservation = await ReservationModel.create({
      usuario: testUser._id,
      libro: testBook._id,
      fechaReserva: new Date(),
      activa: true
    });

    testBook.disponible = false;
    await testBook.save();
  });

  describe('POST /api/reservas', () => {
    test('Debería crear una reserva exitosamente', async () => {
      // Crear un nuevo libro disponible
      const nuevoLibro = await BookModel.create({
        nombre: 'Nuevo Libro',
        autor: 'Nuevo Autor',
        genero: 'Drama',
        fechaPublicacion: new Date('2021-01-01'),
        casaEditorial: 'Nueva Editorial',
        disponible: true
      });

      const response = await request(app)
        .post('/api/reservas')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          bookId: nuevoLibro._id.toString()
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Reserva creada exitosamente');
      expect(response.body.reservation).toHaveProperty('_id');
      expect(response.body.reservation).toHaveProperty('usuario');
      expect(response.body.reservation).toHaveProperty('libro');
    });

    test('Debería fallar sin token de autenticación', async () => {
      const response = await request(app)
        .post('/api/reservas')
        .send({
          bookId: testBook._id
        });

      expect(response.status).toBe(401);
    });

    test('Debería fallar si el libro no existe', async () => {
      const fakeId = new require('mongoose').Types.ObjectId();
      const response = await request(app)
        .post('/api/reservas')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          bookId: fakeId.toString()
        });

      expect(response.status).toBe(404);
    });

    test('Debería fallar si el libro no está disponible', async () => {
      const response = await request(app)
        .post('/api/reservas')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          bookId: testBook._id.toString()
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('El libro no está disponible');
    });

    test('Debería fallar si el usuario ya tiene una reserva activa del mismo libro', async () => {
      // Crear un libro disponible
      const libroDisponible = await BookModel.create({
        nombre: 'Libro Disponible',
        autor: 'Autor Disponible',
        genero: 'Ficción',
        fechaPublicacion: new Date('2020-01-01'),
        casaEditorial: 'Editorial Disponible',
        disponible: true
      });

      // Crear una reserva activa
      await ReservationModel.create({
        usuario: testUser._id,
        libro: libroDisponible._id,
        activa: true
      });

      const response = await request(app)
        .post('/api/reservas')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          bookId: libroDisponible._id.toString()
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Ya tiene una reserva activa de este libro');
    });
  });

  describe('GET /api/reservas/usuario/:userId', () => {
    test('Debería obtener historial de reservas del usuario', async () => {
      const response = await request(app)
        .get(`/api/reservas/usuario/${testUser._id}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('usuario');
      expect(response.body).toHaveProperty('historial');
      expect(Array.isArray(response.body.historial)).toBe(true);
    });

    test('Debería fallar sin token de autenticación', async () => {
      const response = await request(app)
        .get(`/api/reservas/usuario/${testUser._id}`);

      expect(response.status).toBe(401);
    });

    test('Debería fallar si otro usuario intenta ver el historial', async () => {
      const otroUsuario = await UserModel.create({
        nombre: 'Otro Usuario',
        correo: 'otro@example.com',
        contraseña: 'password123'
      });

      const otroToken = jwt.sign({ userId: otroUsuario._id }, process.env.JWT_SECRET || 'test-secret');

      const response = await request(app)
        .get(`/api/reservas/usuario/${testUser._id}`)
        .set('Authorization', `Bearer ${otroToken}`);

      expect(response.status).toBe(403);
    });

    test('Debería permitir ver historial si tiene permiso modificarUsuarios', async () => {
      const adminUser = await UserModel.create({
        nombre: 'Admin',
        correo: 'admin@example.com',
        contraseña: 'password123',
        permisos: { modificarUsuarios: true }
      });

      const adminToken = jwt.sign({ userId: adminUser._id }, process.env.JWT_SECRET || 'test-secret');

      const response = await request(app)
        .get(`/api/reservas/usuario/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    test('Debería fallar si el usuario no existe', async () => {
      const fakeId = new require('mongoose').Types.ObjectId();
      const response = await request(app)
        .get(`/api/reservas/usuario/${fakeId}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/reservas/:reservationId/entregar', () => {
    test('Debería entregar libro exitosamente', async () => {
      const response = await request(app)
        .put(`/api/reservas/${testReservation._id}/entregar`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Libro entregado exitosamente');
      expect(response.body.reservation.activa).toBe(false);
      expect(response.body.reservation.fechaEntrega).toBeDefined();

      // Verificar que el libro se marcó como disponible
      const book = await BookModel.findById(testBook._id);
      expect(book.disponible).toBe(true);
    });

    test('Debería fallar sin token de autenticación', async () => {
      const response = await request(app)
        .put(`/api/reservas/${testReservation._id}/entregar`);

      expect(response.status).toBe(401);
    });

    test('Debería fallar si otro usuario intenta entregar', async () => {
      const otroUsuario = await UserModel.create({
        nombre: 'Otro Usuario',
        correo: 'otro2@example.com',
        contraseña: 'password123'
      });

      const otroToken = jwt.sign({ userId: otroUsuario._id }, process.env.JWT_SECRET || 'test-secret');

      const response = await request(app)
        .put(`/api/reservas/${testReservation._id}/entregar`)
        .set('Authorization', `Bearer ${otroToken}`);

      expect(response.status).toBe(403);
    });

    test('Debería fallar si la reserva no existe', async () => {
      const fakeId = new require('mongoose').Types.ObjectId();
      const response = await request(app)
        .put(`/api/reservas/${fakeId}/entregar`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(404);
    });

    test('Debería fallar si la reserva ya fue entregada', async () => {
      testReservation.activa = false;
      testReservation.fechaEntrega = new Date();
      await testReservation.save();

      const response = await request(app)
        .put(`/api/reservas/${testReservation._id}/entregar`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Esta reserva ya fue entregada');
    });
  });
});
