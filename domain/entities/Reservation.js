class Reservation {
  constructor(id, usuarioId, libroId, fechaReserva = null, fechaEntrega = null, activa = true, createdAt = null, updatedAt = null) {
    this.id = id;
    this.usuarioId = usuarioId;
    this.libroId = libroId;
    this.fechaReserva = fechaReserva || new Date();
    this.fechaEntrega = fechaEntrega;
    this.activa = activa;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Métodos de negocio
  isActive() {
    return this.activa === true;
  }

  return() {
    this.activa = false;
    this.fechaEntrega = new Date();
  }

  belongsToUser(userId) {
    return this.usuarioId === userId;
  }
}

module.exports = Reservation;

