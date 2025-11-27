const Reservation = require('../../../domain/entities/Reservation');

class CreateReservationUseCase {
  constructor(bookRepository, reservationRepository) {
    this.bookRepository = bookRepository;
    this.reservationRepository = reservationRepository;
  }

  async execute(bookId, userId) {
    // Verificar que el libro existe y está habilitado
    const book = await this.bookRepository.findById(bookId);
    if (!book || !book.isEnabled()) {
      throw new Error('Libro no encontrado o inhabilitado');
    }

    // Verificar que el libro está disponible
    if (!book.isAvailable()) {
      throw new Error('El libro no está disponible');
    }

    // Verificar si el usuario ya tiene una reserva activa de este libro
    const existingReservation = await this.reservationRepository.findActiveByUserAndBook(userId, bookId);
    if (existingReservation) {
      throw new Error('Ya tiene una reserva activa de este libro');
    }

    // Crear entidad de dominio
    const reservation = new Reservation(
      null, // id se asignará al guardar
      userId,
      bookId
    );

    // Guardar reserva
    const savedReservation = await this.reservationRepository.create(reservation);

    // Marcar libro como no disponible
    book.markAsUnavailable();
    await this.bookRepository.update(bookId, { disponible: false });

    return {
      message: 'Reserva creada exitosamente',
      reservation: savedReservation
    };
  }
}

module.exports = CreateReservationUseCase;

