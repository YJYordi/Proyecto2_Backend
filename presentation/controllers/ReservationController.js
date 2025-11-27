const container = require('../../application/container/DependencyContainer');
const UserMapper = require('../../application/mappers/UserMapper');

class ReservationController {
  // Create (Crear reserva)
  async createReservation(req, res) {
    try {
      const { bookId } = req.body;
      const userId = req.user._id.toString();
      const result = await container.createReservationUseCase.execute(bookId, userId);
      
      // Formatear respuesta para mantener compatibilidad
      res.status(201).json({
        message: result.message,
        reservation: {
          _id: result.reservation.id,
          usuario: {
            nombre: result.reservation.usuario?.nombre || 'N/A',
            correo: result.reservation.usuario?.correo || 'N/A'
          },
          libro: {
            nombre: result.reservation.libro?.nombre || 'N/A',
            autor: result.reservation.libro?.autor || 'N/A'
          },
          fechaReserva: result.reservation.fechaReserva,
          fechaEntrega: result.reservation.fechaEntrega,
          activa: result.reservation.activa
        }
      });
    } catch (error) {
      if (error.message === 'Libro no encontrado o inhabilitado' || 
          error.message === 'El libro no está disponible' ||
          error.message === 'Ya tiene una reserva activa de este libro') {
        return res.status(error.message.includes('no encontrado') ? 404 : 400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Obtener historial de reservas de un usuario
  async getUserReservationHistory(req, res) {
    try {
      const { userId } = req.params;
      const requestingUser = UserMapper.toDomain(req.user);
      const includeDisabled = req.query.includeDisabled === 'true';
      const result = await container.getUserReservationHistoryUseCase.execute(userId, requestingUser, includeDisabled);
      res.json(result);
    } catch (error) {
      if (error.message === 'Usuario no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'No tiene permiso para ver el historial de este usuario') {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Entregar libro (marcar reserva como inactiva)
  async returnBook(req, res) {
    try {
      const { reservationId } = req.params;
      const userId = req.user._id.toString();
      const requestingUser = UserMapper.toDomain(req.user);
      const result = await container.returnBookUseCase.execute(reservationId, userId, requestingUser);
      res.json(result);
    } catch (error) {
      if (error.message === 'Reserva no encontrada') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'No tiene permiso para entregar este libro' ||
          error.message === 'Esta reserva ya fue entregada') {
        return res.status(error.message.includes('permiso') ? 403 : 400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ReservationController();

