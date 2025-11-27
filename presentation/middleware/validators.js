const { body, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validaciones para registro de usuario
const validateUserRegister = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  body('correo')
    .trim()
    .notEmpty().withMessage('El correo es requerido')
    .isEmail().withMessage('Debe ser un correo válido'),
  body('contraseña')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  handleValidationErrors
];

// Validaciones para login
const validateUserLogin = [
  body('correo')
    .trim()
    .notEmpty().withMessage('El correo es requerido')
    .isEmail().withMessage('Debe ser un correo válido'),
  body('contraseña')
    .notEmpty().withMessage('La contraseña es requerida'),
  handleValidationErrors
];

// Validaciones para crear libro
const validateBookCreate = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre del libro es requerido'),
  body('autor')
    .trim()
    .notEmpty().withMessage('El autor es requerido'),
  body('genero')
    .trim()
    .notEmpty().withMessage('El género es requerido'),
  body('fechaPublicacion')
    .notEmpty().withMessage('La fecha de publicación es requerida')
    .isISO8601().withMessage('La fecha debe ser válida'),
  body('casaEditorial')
    .trim()
    .notEmpty().withMessage('La casa editorial es requerida'),
  handleValidationErrors
];

// Validaciones para actualizar usuario
const validateUserUpdate = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  body('correo')
    .optional()
    .trim()
    .isEmail().withMessage('Debe ser un correo válido'),
  body('contraseña')
    .optional()
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  handleValidationErrors
];

module.exports = {
  validateUserRegister,
  validateUserLogin,
  validateBookCreate,
  validateUserUpdate,
  handleValidationErrors
};

