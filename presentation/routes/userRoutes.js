const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { authenticate } = require('../middleware/auth');
const { validateUserRegister, validateUserLogin, validateUserUpdate } = require('../middleware/validators');

// Create (Registro) - No requiere autenticación
router.post('/register', validateUserRegister, (req, res) => userController.register(req, res));

// Read (Login) - No requiere autenticación
router.post('/login', validateUserLogin, (req, res) => userController.login(req, res));

// Read (Obtener usuario) - Requiere autenticación (debe ser seguro)
router.get('/:userId', authenticate, (req, res) => userController.getUser(req, res));

// Update (Modificar usuario) - Requiere autenticación
router.put('/:userId', authenticate, validateUserUpdate, (req, res) => userController.updateUser(req, res));

// Delete (Inhabilitar usuario) - Requiere autenticación
router.delete('/:userId', authenticate, (req, res) => userController.deleteUser(req, res));

module.exports = router;

