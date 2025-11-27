const BookModel = require('../models/BookModel');
const BookMapper = require('../../application/mappers/BookMapper');
const ReservationModel = require('../models/ReservationModel');
const UserModel = require('../models/UserModel');
const mongoose = require('mongoose');

class MongoBookRepository {
  async findById(id, includeDisabled = false) {
    const query = { _id: new mongoose.Types.ObjectId(id) };
    if (!includeDisabled) {
      query.habilitado = true;
    }

    const mongooseBook = await BookModel.findOne(query);
    return BookMapper.toDomain(mongooseBook);
  }

  async findAll(filters = {}, pagination = {}) {
    const query = {};

    // Filtro de habilitados
    if (!filters.includeDisabled || filters.includeDisabled !== 'true') {
      query.habilitado = true;
    }

    // Filtros de búsqueda
    if (filters.genero) {
      query.genero = { $regex: filters.genero, $options: 'i' };
    }

    if (filters.casaEditorial) {
      query.casaEditorial = { $regex: filters.casaEditorial, $options: 'i' };
    }

    if (filters.autor) {
      query.autor = { $regex: filters.autor, $options: 'i' };
    }

    if (filters.nombre) {
      query.nombre = { $regex: filters.nombre, $options: 'i' };
    }

    if (filters.disponible !== undefined) {
      query.disponible = filters.disponible === 'true' || filters.disponible === true;
    }

    if (filters.fechaPublicacion) {
      const fecha = new Date(filters.fechaPublicacion);
      if (!isNaN(fecha.getTime())) {
        const inicioDia = new Date(fecha);
        inicioDia.setHours(0, 0, 0, 0);
        const finDia = new Date(fecha);
        finDia.setHours(23, 59, 59, 999);
        query.fechaPublicacion = { $gte: inicioDia, $lte: finDia };
      }
    }

    // Paginación
    const pageNum = parseInt(pagination.page) || 1;
    const limitNum = parseInt(pagination.limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Obtener total
    const total = await BookModel.countDocuments(query);

    // Obtener libros
    const mongooseBooks = await BookModel.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ nombre: 1 });

    const books = BookMapper.toDomainList(mongooseBooks);

    return { books, total };
  }

  async create(book) {
    const bookData = BookMapper.toPersistence(book);
    const mongooseBook = new BookModel(bookData);
    await mongooseBook.save();
    return BookMapper.toDomain(mongooseBook);
  }

  async update(id, updates) {
    const mongooseBook = await BookModel.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    return BookMapper.toDomain(mongooseBook);
  }

  async delete(id) {
    await BookModel.findByIdAndUpdate(id, { habilitado: false, disponible: false });
    return true;
  }

  async exists(nombre, autor) {
    const book = await BookModel.findOne({ nombre, autor, habilitado: true });
    return !!book;
  }

  async findReservationsByBookId(bookId) {
    const reservations = await ReservationModel.find({ libro: bookId })
      .populate('usuario', 'nombre correo')
      .sort({ fechaReserva: -1 });
    return reservations;
  }
}

module.exports = MongoBookRepository;

