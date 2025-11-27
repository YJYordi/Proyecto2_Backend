// Interface para repositorio de libros

class IBookRepository {
  async findById(id, includeDisabled = false) {
    throw new Error('Method findById must be implemented');
  }

  async findAll(filters = {}, pagination = {}) {
    throw new Error('Method findAll must be implemented');
  }

  async create(book) {
    throw new Error('Method create must be implemented');
  }

  async update(id, updates) {
    throw new Error('Method update must be implemented');
  }

  async delete(id) {
    throw new Error('Method delete must be implemented');
  }

  async exists(nombre, autor) {
    throw new Error('Method exists must be implemented');
  }

  async findReservationsByBookId(bookId) {
    throw new Error('Method findReservationsByBookId must be implemented');
  }
}

module.exports = IBookRepository;

