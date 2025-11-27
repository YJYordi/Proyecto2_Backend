class ReturnBookUseCase {
  constructor(reservationRepository, bookRepository) {
    this.reservationRepository = reservationRepository;
    this.bookRepository = bookRepository;
  }

  async execute(reservationId, userId, requestingUser) {
    // Buscar reserva
    const reservation = await this.reservationRepository.findById(reservationId);
    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }

    // Verificar que la reserva pertenece al usuario o tiene permisos
    if (!reservation.belongsToUser(userId) && !requestingUser.canModifyUsers()) {
      throw new Error('No tiene permiso para entregar este libro');
    }

    if (!reservation.isActive()) {
      throw new Error('Esta reserva ya fue entregada');
    }

    // Marcar reserva como inactiva y agregar fecha de entrega
    reservation.return();
    await this.reservationRepository.update(reservationId, {
      activa: false,
      fechaEntrega: reservation.fechaEntrega
    });

    // Marcar libro como disponible
    // El libroId puede venir de la reserva poblada o del dominio
    const libroId = reservation.libroId || reservation.libro?._id || reservation.libro;
    if (libroId) {
      const book = await this.bookRepository.findById(libroId);
      if (book) {
        book.markAsAvailable();
        await this.bookRepository.update(libroId, { disponible: true });
      }
    }

    return {
      message: 'Libro entregado exitosamente',
      reservation: {
        fechaReserva: reservation.fechaReserva,
        fechaEntrega: reservation.fechaEntrega,
        activa: reservation.activa
      }
    };
  }
}

module.exports = ReturnBookUseCase;

