const request = require('supertest');
const app = require('../server');
const BookModel = require('../infrastructure/models/BookModel');
const UserModel = require('../infrastructure/models/UserModel');
const ReservationModel = require('../infrastructure/models/ReservationModel');
const jwt = require('jsonwebtoken');

describe('Book Controller', () => {
  let testUser;
  let testToken;
  let testBook;

  beforeEach(async () => {
    // Crear usuario con permisos
    testUser = await UserModel.create({
      nombre: 'Admin Test',
      correo: 'admin@example.com',
      contraseña: 'password123',
      permisos: {
        crearLibros: true,
        modificarLibros: true,
        inhabilitarLibros: true
      }
    });

    testToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET || 'test-secret');

    // Crear libro de prueba
    testBook = await BookModel.create({
      nombre: 'Libro Test',
      autor: 'Autor Test',
      genero: 'Ficción',
      fechaPublicacion: new Date('2020-01-01'),
      casaEditorial: 'Editorial Test'
    });
  });

  describe('POST /api/libros', () => {
    test('Debería crear un libro exitosamente', async () => {
      const response = await request(app)
        .post('/api/libros')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          nombre: 'Nuevo Libro',
          autor: 'Nuevo Autor',
          genero: 'Drama',
          fechaPublicacion: '2021-01-01',
          casaEditorial: 'Nueva Editorial'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Libro creado exitosamente');
      expect(response.body.book).toHaveProperty('nombre', 'Nuevo Libro');
    });

    test('Debería fallar sin token de autenticación', async () => {
      const response = await request(app)
        .post('/api/libros')
        .send({
          nombre: 'Nuevo Libro',
          autor: 'Nuevo Autor',
          genero: 'Drama',
          fechaPublicacion: '2021-01-01',
          casaEditorial: 'Nueva Editorial'
        });

      expect(response.status).toBe(401);
    });

    test('Debería fallar sin permiso crearLibros', async () => {
      const userSinPermiso = await UserModel.create({
        nombre: 'Usuario Sin Permiso',
        correo: 'sinpermiso@example.com',
        contraseña: 'password123',
        permisos: {}
      });

      const tokenSinPermiso = jwt.sign({ userId: userSinPermiso._id }, process.env.JWT_SECRET || 'test-secret');

      const response = await request(app)
        .post('/api/libros')
        .set('Authorization', `Bearer ${tokenSinPermiso}`)
        .send({
          nombre: 'Nuevo Libro',
          autor: 'Nuevo Autor',
          genero: 'Drama',
          fechaPublicacion: '2021-01-01',
          casaEditorial: 'Nueva Editorial'
        });

      expect(response.status).toBe(403);
    });

    test('Debería fallar si falta el nombre', async () => {
      const response = await request(app)
        .post('/api/libros')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          autor: 'Nuevo Autor',
          genero: 'Drama',
          fechaPublicacion: '2021-01-01',
          casaEditorial: 'Nueva Editorial'
        });

      expect(response.status).toBe(400);
    });

    test('Debería fallar si el libro ya existe', async () => {
      const response = await request(app)
        .post('/api/libros')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          nombre: 'Libro Test',
          autor: 'Autor Test',
          genero: 'Ficción',
          fechaPublicacion: '2020-01-01',
          casaEditorial: 'Editorial Test'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Este libro ya existe en la biblioteca');
    });
  });

  describe('GET /api/libros/:bookId', () => {
    test('Debería obtener un libro exitosamente', async () => {
      const response = await request(app)
        .get(`/api/libros/${testBook._id}`);

      expect(response.status).toBe(200);
      expect(response.body.book).toHaveProperty('nombre', 'Libro Test');
      expect(response.body.book).toHaveProperty('autor', 'Autor Test');
    });

    test('Debería fallar si el libro no existe', async () => {
      const fakeId = new require('mongoose').Types.ObjectId();
      const response = await request(app)
        .get(`/api/libros/${fakeId}`);

      expect(response.status).toBe(404);
    });

    test('No debería retornar libros inhabilitados por defecto', async () => {
      testBook.habilitado = false;
      await testBook.save();

      const response = await request(app)
        .get(`/api/libros/${testBook._id}`);

      expect(response.status).toBe(404);
    });

    test('Debería retornar libros inhabilitados si se solicita explícitamente', async () => {
      testBook.habilitado = false;
      await testBook.save();

      const response = await request(app)
        .get(`/api/libros/${testBook._id}?includeDisabled=true`);

      expect(response.status).toBe(200);
      expect(response.body.book.habilitado).toBe(false);
    });
  });

  describe('GET /api/libros', () => {
    beforeEach(async () => {
      // Crear más libros para pruebas de paginación
      await BookModel.create([
        {
          nombre: 'Libro A',
          autor: 'Autor A',
          genero: 'Ficción',
          fechaPublicacion: new Date('2020-01-01'),
          casaEditorial: 'Editorial A'
        },
        {
          nombre: 'Libro B',
          autor: 'Autor B',
          genero: 'Drama',
          fechaPublicacion: new Date('2021-01-01'),
          casaEditorial: 'Editorial B'
        }
      ]);
    });

    test('Debería obtener libros con paginación', async () => {
      const response = await request(app)
        .get('/api/libros?page=1&limit=2');

      expect(response.status).toBe(200);
      expect(response.body.books).toHaveLength(2);
      expect(response.body.paginacion).toHaveProperty('paginaActual', 1);
      expect(response.body.paginacion).toHaveProperty('paginaMaxima');
      expect(response.body.paginacion).toHaveProperty('librosPorPagina', 2);
    });

    test('Debería filtrar por género', async () => {
      const response = await request(app)
        .get('/api/libros?genero=Ficción');

      expect(response.status).toBe(200);
      expect(response.body.books.length).toBeGreaterThan(0);
    });

    test('Debería filtrar por autor', async () => {
      const response = await request(app)
        .get('/api/libros?autor=Autor A');

      expect(response.status).toBe(200);
    });

    test('Debería filtrar por disponibilidad', async () => {
      const response = await request(app)
        .get('/api/libros?disponible=true');

      expect(response.status).toBe(200);
    });

    test('Debería filtrar por casa editorial', async () => {
      const response = await request(app)
        .get('/api/libros?casaEditorial=Editorial A');

      expect(response.status).toBe(200);
    });

    test('Debería retornar solo nombres de libros', async () => {
      const response = await request(app)
        .get('/api/libros');

      expect(response.status).toBe(200);
      response.body.books.forEach(book => {
        expect(book).toHaveProperty('nombre');
        expect(book).not.toHaveProperty('autor');
        expect(book).not.toHaveProperty('genero');
      });
    });
  });

  describe('PUT /api/libros/:bookId', () => {
    test('Debería actualizar libro exitosamente (con permiso)', async () => {
      const response = await request(app)
        .put(`/api/libros/${testBook._id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          nombre: 'Libro Actualizado'
        });

      expect(response.status).toBe(200);
      expect(response.body.book).toHaveProperty('nombre', 'Libro Actualizado');
    });

    test('Debería fallar al modificar información sin permiso modificarLibros', async () => {
      const userSinPermiso = await UserModel.create({
        nombre: 'Usuario Sin Permiso',
        correo: 'sinpermiso2@example.com',
        contraseña: 'password123',
        permisos: {}
      });

      const tokenSinPermiso = jwt.sign({ userId: userSinPermiso._id }, process.env.JWT_SECRET || 'test-secret');

      const response = await request(app)
        .put(`/api/libros/${testBook._id}`)
        .set('Authorization', `Bearer ${tokenSinPermiso}`)
        .send({
          nombre: 'Libro Modificado'
        });

      expect(response.status).toBe(403);
    });

    test('Debería permitir modificar disponibilidad sin permiso especial', async () => {
      const userNormal = await UserModel.create({
        nombre: 'Usuario Normal',
        correo: 'normal@example.com',
        contraseña: 'password123',
        permisos: {}
      });

      const tokenNormal = jwt.sign({ userId: userNormal._id }, process.env.JWT_SECRET || 'test-secret');

      const response = await request(app)
        .put(`/api/libros/${testBook._id}`)
        .set('Authorization', `Bearer ${tokenNormal}`)
        .send({
          disponible: false
        });

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/libros/:bookId', () => {
    test('Debería inhabilitar libro exitosamente', async () => {
      const response = await request(app)
        .delete(`/api/libros/${testBook._id}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Libro inhabilitado exitosamente');

      const book = await BookModel.findById(testBook._id);
      expect(book.habilitado).toBe(false);
      expect(book.disponible).toBe(false);
    });

    test('Debería fallar sin permiso inhabilitarLibros', async () => {
      const userSinPermiso = await UserModel.create({
        nombre: 'Usuario Sin Permiso',
        correo: 'sinpermiso3@example.com',
        contraseña: 'password123',
        permisos: {}
      });

      const tokenSinPermiso = jwt.sign({ userId: userSinPermiso._id }, process.env.JWT_SECRET || 'test-secret');

      const response = await request(app)
        .delete(`/api/libros/${testBook._id}`)
        .set('Authorization', `Bearer ${tokenSinPermiso}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/libros/:bookId/historial', () => {
    test('Debería obtener historial de reservas del libro', async () => {
      const usuario = await UserModel.create({
        nombre: 'Usuario Reserva',
        correo: 'reserva@example.com',
        contraseña: 'password123'
      });

      await ReservationModel.create({
        usuario: usuario._id,
        libro: testBook._id,
        fechaReserva: new Date(),
        activa: true
      });

      const response = await request(app)
        .get(`/api/libros/${testBook._id}/historial`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('historial');
      expect(response.body.historial.length).toBeGreaterThan(0);
    });
  });
});
