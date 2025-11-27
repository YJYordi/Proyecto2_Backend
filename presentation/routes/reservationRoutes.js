const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/ReservationController');
const { authenticate } = require('../middleware/auth');

// Create (Crear reserva) - Requiere autenticación
router.post('/', authenticate, (req, res) => reservationController.createReservation(req, res));

// Historial de reservas de un usuario - Requiere autenticación
router.get('/usuario/:userId', authenticate, (req, res) => reservationController.getUserReservationHistory(req, res));

// Entregar libro - Requiere autenticación
router.put('/:reservationId/entregar', authenticate, (req, res) => reservationController.returnBook(req, res));

module.exports = router;

