const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido']
  },
  libro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'El libro es requerido']
  },
  fechaReserva: {
    type: Date,
    default: Date.now
  },
  fechaEntrega: {
    type: Date,
    default: null
  },
  activa: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índice para búsquedas eficientes
reservationSchema.index({ usuario: 1, activa: 1 });
reservationSchema.index({ libro: 1, activa: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);

