// Interface para repositorio de reservas

class IReservationRepository {
  async findById(id) {
    throw new Error('Method findById must be implemented');
  }

  async findByUserId(userId) {
    throw new Error('Method findByUserId must be implemented');
  }

  async findByBookId(bookId) {
    throw new Error('Method findByBookId must be implemented');
  }

  async findActiveByUserAndBook(userId, bookId) {
    throw new Error('Method findActiveByUserAndBook must be implemented');
  }

  async create(reservation) {
    throw new Error('Method create must be implemented');
  }

  async update(id, updates) {
    throw new Error('Method update must be implemented');
  }
}

module.exports = IReservationRepository;

