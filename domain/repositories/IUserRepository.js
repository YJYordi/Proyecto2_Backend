// Interface para repositorio de usuarios
// La implementación concreta estará en infrastructure

class IUserRepository {
  async findById(id, includeDisabled = false) {
    throw new Error('Method findById must be implemented');
  }

  async findByEmail(email, includeDisabled = false) {
    throw new Error('Method findByEmail must be implemented');
  }

  async create(user) {
    throw new Error('Method create must be implemented');
  }

  async update(id, updates) {
    throw new Error('Method update must be implemented');
  }

  async delete(id) {
    throw new Error('Method delete must be implemented');
  }

  async exists(email) {
    throw new Error('Method exists must be implemented');
  }
}

module.exports = IUserRepository;

