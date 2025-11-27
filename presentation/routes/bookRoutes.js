const express = require('express');
const router = express.Router();
const bookController = require('../controllers/BookController');
const { authenticate, requirePermission } = require('../middleware/auth');
const { validateBookCreate } = require('../middleware/validators');

// Create (Crear libro) - Requiere autenticación y permiso
router.post('/', authenticate, requirePermission('crearLibros'), validateBookCreate, (req, res) => bookController.createBook(req, res));

// Read (Obtener varios libros) - No requiere autenticación (debe ir antes de /:bookId)
router.get('/', (req, res) => bookController.getBooks(req, res));

// Historial de reservas de un libro - Requiere autenticación (más específico, debe ir antes de /:bookId)
router.get('/:bookId/historial', authenticate, (req, res) => bookController.getBookReservationHistory(req, res));

// Read (Obtener un libro) - No requiere autenticación
router.get('/:bookId', (req, res) => bookController.getBook(req, res));

// Update (Modificar libro) - Requiere autenticación
router.put('/:bookId', authenticate, (req, res) => bookController.updateBook(req, res));

// Delete (Inhabilitar libro) - Requiere autenticación y permiso
router.delete('/:bookId', authenticate, requirePermission('inhabilitarLibros'), (req, res) => bookController.deleteBook(req, res));

module.exports = router;

