require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const routes = require('./presentation/routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a la base de datos solo si no estamos en modo test
if (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
  connectDB();
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api', routes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor solo si no estamos en modo test
if (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}

module.exports = app;
