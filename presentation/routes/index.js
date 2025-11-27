const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const bookRoutes = require('./bookRoutes');
const reservationRoutes = require('./reservationRoutes');

// Rutas
router.use('/usuarios', userRoutes);
router.use('/libros', bookRoutes);
router.use('/reservas', reservationRoutes);

// Ruta de prueba
router.get('/', (req, res) => {
  res.json({ 
    message: 'API de Biblioteca - Backend funcionando correctamente',
    version: '1.0.0'
  });
});

module.exports = router;

