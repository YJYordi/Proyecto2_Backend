const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error al conectar MongoDB: ${error.message}`);
    // No hacer exit en modo test para permitir que las pruebas manejen la conexión
    if (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;

