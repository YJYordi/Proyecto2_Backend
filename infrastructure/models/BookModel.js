const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del libro es requerido'],
    trim: true
  },
  autor: {
    type: String,
    required: [true, 'El autor es requerido'],
    trim: true
  },
  genero: {
    type: String,
    required: [true, 'El género es requerido'],
    trim: true
  },
  fechaPublicacion: {
    type: Date,
    required: [true, 'La fecha de publicación es requerida']
  },
  casaEditorial: {
    type: String,
    required: [true, 'La casa editorial es requerida'],
    trim: true
  },
  disponible: {
    type: Boolean,
    default: true
  },
  habilitado: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);

