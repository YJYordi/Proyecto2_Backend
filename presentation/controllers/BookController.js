const container = require('../../application/container/DependencyContainer');
const UserMapper = require('../../application/mappers/UserMapper');

class BookController {
  // Create (Crear libro)
  async createBook(req, res) {
    try {
      const result = await container.createBookUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error.message === 'Este libro ya existe en la biblioteca') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Read (Obtener un libro)
  async getBook(req, res) {
    try {
      const { bookId } = req.params;
      const includeDisabled = req.query.includeDisabled === 'true';
      const result = await container.getBookUseCase.execute(bookId, includeDisabled);
      res.json(result);
    } catch (error) {
      if (error.message === 'Libro no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Read (Obtener varios libros con filtros y paginación)
  async getBooks(req, res) {
    try {
      const filters = {
        genero: req.query.genero,
        fechaPublicacion: req.query.fechaPublicacion,
        casaEditorial: req.query.casaEditorial,
        autor: req.query.autor,
        nombre: req.query.nombre,
        disponible: req.query.disponible,
        includeDisabled: req.query.includeDisabled
      };

      const pagination = {
        page: req.query.page || 1,
        limit: req.query.limit || 10
      };

      const result = await container.getBooksUseCase.execute(filters, pagination);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update (Modificar libro)
  async updateBook(req, res) {
    try {
      const { bookId } = req.params;
      const requestingUser = UserMapper.toDomain(req.user);
      const result = await container.updateBookUseCase.execute(bookId, req.body, requestingUser);
      res.json(result);
    } catch (error) {
      if (error.message === 'No tiene permiso para modificar la información del libro') {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === 'Libro no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Delete (Soft delete - Inhabilitar libro)
  async deleteBook(req, res) {
    try {
      const { bookId } = req.params;
      const result = await container.deleteBookUseCase.execute(bookId);
      res.json(result);
    } catch (error) {
      if (error.message === 'Libro no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Obtener historial de reservas de un libro
  async getBookReservationHistory(req, res) {
    try {
      const { bookId } = req.params;
      const includeDisabled = req.query.includeDisabled === 'true';
      const result = await container.getBookReservationHistoryUseCase.execute(bookId, includeDisabled);
      res.json(result);
    } catch (error) {
      if (error.message === 'Libro no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new BookController();

