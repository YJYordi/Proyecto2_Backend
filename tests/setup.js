const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.test' });

// Configurar variables de entorno por defecto para pruebas
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key-for-jest-tests';
}
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}

// Configuración de base de datos de prueba
const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/biblioteca_test';

beforeAll(async () => {
  // Aumentar timeout para conexión a MongoDB
  jest.setTimeout(30000);
  
  try {
    await mongoose.connect(MONGODB_TEST_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
  } catch (error) {
    console.error('Error conectando a MongoDB para pruebas:', error.message);
    console.error('Asegúrate de que MongoDB esté corriendo en:', MONGODB_TEST_URI);
    throw error;
  }
}, 30000);

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
}, 30000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

