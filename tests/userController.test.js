const request = require('supertest');
const app = require('../server');
const UserModel = require('../infrastructure/models/UserModel');
const jwt = require('jsonwebtoken');

describe('User Controller', () => {
  let testUser;
  let testToken;

  beforeEach(async () => {
    // Crear usuario de prueba
    testUser = await UserModel.create({
      nombre: 'Usuario Test',
      correo: 'test@example.com',
      contraseña: 'password123',
      permisos: {
        crearLibros: true,
        modificarLibros: true
      }
    });

    testToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET || 'test-secret');
  });

  describe('POST /api/usuarios/register', () => {
    test('Debería crear un usuario exitosamente', async () => {
      const response = await request(app)
        .post('/api/usuarios/register')
        .send({
          nombre: 'Nuevo Usuario',
          correo: 'nuevo@example.com',
          contraseña: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Usuario creado exitosamente');
      expect(response.body.user).toHaveProperty('nombre', 'Nuevo Usuario');
      expect(response.body.user).toHaveProperty('correo', 'nuevo@example.com');
      expect(response.body.user).not.toHaveProperty('contraseña');
      expect(response.body).toHaveProperty('token');
    });

    test('Debería fallar si el correo ya existe', async () => {
      const response = await request(app)
        .post('/api/usuarios/register')
        .send({
          nombre: 'Otro Usuario',
          correo: 'test@example.com',
          contraseña: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('El correo ya está registrado');
    });

    test('Debería fallar si falta el nombre', async () => {
      const response = await request(app)
        .post('/api/usuarios/register')
        .send({
          correo: 'test2@example.com',
          contraseña: 'password123'
        });

      expect(response.status).toBe(400);
    });

    test('Debería fallar si falta el correo', async () => {
      const response = await request(app)
        .post('/api/usuarios/register')
        .send({
          nombre: 'Test User',
          contraseña: 'password123'
        });

      expect(response.status).toBe(400);
    });

    test('Debería fallar si la contraseña es muy corta', async () => {
      const response = await request(app)
        .post('/api/usuarios/register')
        .send({
          nombre: 'Test User',
          correo: 'test2@example.com',
          contraseña: '12345'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/usuarios/login', () => {
    test('Debería hacer login exitosamente', async () => {
      const response = await request(app)
        .post('/api/usuarios/login')
        .send({
          correo: 'test@example.com',
          contraseña: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login exitoso');
      expect(response.body.user).toHaveProperty('correo', 'test@example.com');
      expect(response.body).toHaveProperty('token');
    });

    test('Debería fallar con credenciales incorrectas', async () => {
      const response = await request(app)
        .post('/api/usuarios/login')
        .send({
          correo: 'test@example.com',
          contraseña: 'passwordIncorrecta'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Credenciales inválidas');
    });

    test('Debería fallar si el usuario no existe', async () => {
      const response = await request(app)
        .post('/api/usuarios/login')
        .send({
          correo: 'noexiste@example.com',
          contraseña: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Credenciales inválidas');
    });

    test('Debería fallar si falta el correo', async () => {
      const response = await request(app)
        .post('/api/usuarios/login')
        .send({
          contraseña: 'password123'
        });

      expect(response.status).toBe(400);
    });

    test('Debería fallar si el usuario está inhabilitado', async () => {
      testUser.habilitado = false;
      await testUser.save();

      const response = await request(app)
        .post('/api/usuarios/login')
        .send({
          correo: 'test@example.com',
          contraseña: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Usuario inhabilitado');
    });
  });

  describe('GET /api/usuarios/:userId', () => {
    test('Debería obtener información del usuario sin autenticación', async () => {
      const response = await request(app)
        .get(`/api/usuarios/${testUser._id}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('nombre', 'Usuario Test');
      expect(response.body.user).toHaveProperty('correo', 'test@example.com');
      expect(response.body.user).not.toHaveProperty('contraseña');
    });

    test('Debería fallar si el usuario no existe', async () => {
      const fakeId = new require('mongoose').Types.ObjectId();
      const response = await request(app)
        .get(`/api/usuarios/${fakeId}`);

      expect(response.status).toBe(404);
    });

    test('No debería retornar usuarios inhabilitados por defecto', async () => {
      testUser.habilitado = false;
      await testUser.save();

      const response = await request(app)
        .get(`/api/usuarios/${testUser._id}`);

      expect(response.status).toBe(404);
    });

    test('Debería retornar usuarios inhabilitados si se solicita explícitamente', async () => {
      testUser.habilitado = false;
      await testUser.save();

      const response = await request(app)
        .get(`/api/usuarios/${testUser._id}?includeDisabled=true`);

      expect(response.status).toBe(200);
      expect(response.body.user.habilitado).toBe(false);
    });
  });

  describe('PUT /api/usuarios/:userId', () => {
    test('Debería actualizar usuario exitosamente (mismo usuario)', async () => {
      const response = await request(app)
        .put(`/api/usuarios/${testUser._id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          nombre: 'Usuario Actualizado'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Usuario actualizado exitosamente');
      expect(response.body.user).toHaveProperty('nombre', 'Usuario Actualizado');
    });

    test('Debería fallar si otro usuario intenta modificar', async () => {
      const otroUsuario = await UserModel.create({
        nombre: 'Otro Usuario',
        correo: 'otro@example.com',
        contraseña: 'password123'
      });

      const otroToken = jwt.sign({ userId: otroUsuario._id }, process.env.JWT_SECRET || 'test-secret');

      const response = await request(app)
        .put(`/api/usuarios/${testUser._id}`)
        .set('Authorization', `Bearer ${otroToken}`)
        .send({
          nombre: 'Usuario Modificado'
        });

      expect(response.status).toBe(403);
    });

    test('Debería permitir modificar si tiene permiso modificarUsuarios', async () => {
      const adminUser = await UserModel.create({
        nombre: 'Admin',
        correo: 'admin@example.com',
        contraseña: 'password123',
        permisos: { modificarUsuarios: true }
      });

      const adminToken = jwt.sign({ userId: adminUser._id }, process.env.JWT_SECRET || 'test-secret');

      const response = await request(app)
        .put(`/api/usuarios/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Usuario Modificado por Admin'
        });

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/usuarios/:userId', () => {
    test('Debería inhabilitar usuario exitosamente (mismo usuario)', async () => {
      const response = await request(app)
        .delete(`/api/usuarios/${testUser._id}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Usuario inhabilitado exitosamente');

      const user = await UserModel.findById(testUser._id);
      expect(user.habilitado).toBe(false);
    });

    test('Debería fallar si otro usuario intenta inhabilitar', async () => {
      const otroUsuario = await UserModel.create({
        nombre: 'Otro Usuario',
        correo: 'otro2@example.com',
        contraseña: 'password123'
      });

      const otroToken = jwt.sign({ userId: otroUsuario._id }, process.env.JWT_SECRET || 'test-secret');

      const response = await request(app)
        .delete(`/api/usuarios/${testUser._id}`)
        .set('Authorization', `Bearer ${otroToken}`);

      expect(response.status).toBe(403);
    });

    test('Debería permitir inhabilitar si tiene permiso inhabilitarUsuarios', async () => {
      const adminUser = await UserModel.create({
        nombre: 'Admin',
        correo: 'admin2@example.com',
        contraseña: 'password123',
        permisos: { inhabilitarUsuarios: true }
      });

      const adminToken = jwt.sign({ userId: adminUser._id }, process.env.JWT_SECRET || 'test-secret');

      const response = await request(app)
        .delete(`/api/usuarios/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });
  });
});
