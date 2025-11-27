class GetUserReservationHistoryUseCase {
  constructor(userRepository, reservationRepository) {
    this.userRepository = userRepository;
    this.reservationRepository = reservationRepository;
  }

  async execute(userId, requestingUser, includeDisabled = false) {
    // Verificar que el usuario existe
    const user = await this.userRepository.findById(userId, includeDisabled);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Solo el mismo usuario puede ver su historial (o un admin con permisos)
    if (userId !== requestingUser.id && !requestingUser.canModifyUsers()) {
      throw new Error('No tiene permiso para ver el historial de este usuario');
    }

    // Obtener todas las reservas del usuario
    const reservations = await this.reservationRepository.findByUserId(userId);

    const history = reservations.map(reservation => ({
      nombreLibro: reservation.libro?.nombre || 'N/A',
      autorLibro: reservation.libro?.autor || 'N/A',
      generoLibro: reservation.libro?.genero || 'N/A',
      fechaReserva: reservation.fechaReserva,
      fechaEntrega: reservation.fechaEntrega,
      activa: reservation.activa
    }));

    return {
      usuario: {
        nombre: user.nombre,
        correo: user.correo
      },
      historial: history
    };
  }
}

module.exports = GetUserReservationHistoryUseCase;

