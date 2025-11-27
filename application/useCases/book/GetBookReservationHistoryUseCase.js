class GetBookReservationHistoryUseCase {
  constructor(bookRepository, reservationRepository) {
    this.bookRepository = bookRepository;
    this.reservationRepository = reservationRepository;
  }

  async execute(bookId, includeDisabled = false) {
    // Verificar que el libro existe
    const book = await this.bookRepository.findById(bookId, includeDisabled);
    if (!book) {
      throw new Error('Libro no encontrado');
    }

    // Obtener todas las reservas del libro
    const reservations = await this.reservationRepository.findByBookId(bookId);

    const history = reservations.map(reservation => ({
      nombreUsuario: reservation.usuario?.nombre || 'N/A',
      correoUsuario: reservation.usuario?.correo || 'N/A',
      fechaReserva: reservation.fechaReserva,
      fechaEntrega: reservation.fechaEntrega,
      activa: reservation.activa
    }));

    return {
      libro: {
        nombre: book.nombre,
        autor: book.autor
      },
      historial: history
    };
  }
}

module.exports = GetBookReservationHistoryUseCase;

