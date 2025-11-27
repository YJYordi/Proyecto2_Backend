const Reservation = require('../../domain/entities/Reservation');

class ReservationMapper {
  // Convierte modelo de Mongoose a entidad de dominio
  static toDomain(mongooseReservation) {
    if (!mongooseReservation) return null;

    const usuarioId = mongooseReservation.usuario?._id 
      ? mongooseReservation.usuario._id.toString()
      : mongooseReservation.usuario?.toString() || mongooseReservation.usuario;

    const libroId = mongooseReservation.libro?._id
      ? mongooseReservation.libro._id.toString()
      : mongooseReservation.libro?.toString() || mongooseReservation.libro;

    return new Reservation(
      mongooseReservation._id.toString(),
      usuarioId,
      libroId,
      mongooseReservation.fechaReserva,
      mongooseReservation.fechaEntrega,
      mongooseReservation.activa,
      mongooseReservation.createdAt,
      mongooseReservation.updatedAt
    );
  }

  // Convierte entidad de dominio a objeto plano para Mongoose
  static toPersistence(domainReservation) {
    if (!domainReservation) return null;

    return {
      usuario: domainReservation.usuarioId,
      libro: domainReservation.libroId,
      fechaReserva: domainReservation.fechaReserva,
      fechaEntrega: domainReservation.fechaEntrega,
      activa: domainReservation.activa
    };
  }

  // Convierte múltiples modelos de Mongoose a entidades de dominio
  static toDomainList(mongooseReservations) {
    return mongooseReservations.map(reservation => this.toDomain(reservation));
  }
}

module.exports = ReservationMapper;

