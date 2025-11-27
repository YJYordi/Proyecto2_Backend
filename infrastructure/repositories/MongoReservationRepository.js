const ReservationModel = require('../models/ReservationModel');
const ReservationMapper = require('../../application/mappers/ReservationMapper');
const BookModel = require('../models/BookModel');
const UserModel = require('../models/UserModel');
const mongoose = require('mongoose');

class MongoReservationRepository {
  async findById(id) {
    const mongooseReservation = await ReservationModel.findById(id)
      .populate('usuario', 'nombre correo')
      .populate('libro', 'nombre autor genero');
    
    if (!mongooseReservation) return null;
    
    return {
      ...ReservationMapper.toDomain(mongooseReservation),
      usuario: mongooseReservation.usuario ? {
        nombre: mongooseReservation.usuario.nombre,
        correo: mongooseReservation.usuario.correo
      } : null,
      libro: mongooseReservation.libro ? {
        nombre: mongooseReservation.libro.nombre,
        autor: mongooseReservation.libro.autor,
        genero: mongooseReservation.libro.genero
      } : null
    };
  }

  async findByUserId(userId) {
    const mongooseReservations = await ReservationModel.find({ usuario: userId })
      .populate('libro', 'nombre autor genero')
      .sort({ fechaReserva: -1 });
    
    return mongooseReservations.map(reservation => ({
      ...ReservationMapper.toDomain(reservation),
      libro: reservation.libro ? {
        nombre: reservation.libro.nombre,
        autor: reservation.libro.autor,
        genero: reservation.libro.genero
      } : null
    }));
  }

  async findByBookId(bookId) {
    const mongooseReservations = await ReservationModel.find({ libro: bookId })
      .populate('usuario', 'nombre correo')
      .sort({ fechaReserva: -1 });
    
    // Retornar con información poblada para el historial
    return mongooseReservations.map(reservation => ({
      ...ReservationMapper.toDomain(reservation),
      usuario: {
        nombre: reservation.usuario?.nombre,
        correo: reservation.usuario?.correo
      }
    }));
  }

  async findActiveByUserAndBook(userId, bookId) {
    const mongooseReservation = await ReservationModel.findOne({
      usuario: userId,
      libro: bookId,
      activa: true
    });
    return ReservationMapper.toDomain(mongooseReservation);
  }

  async create(reservation) {
    const reservationData = ReservationMapper.toPersistence(reservation);
    const mongooseReservation = new ReservationModel(reservationData);
    await mongooseReservation.save();
    
    // Populate para retornar información completa
    await mongooseReservation.populate('usuario', 'nombre correo');
    await mongooseReservation.populate('libro', 'nombre autor');
    
    // Retornar con información poblada
    return {
      ...ReservationMapper.toDomain(mongooseReservation),
      usuario: {
        nombre: mongooseReservation.usuario?.nombre,
        correo: mongooseReservation.usuario?.correo
      },
      libro: {
        nombre: mongooseReservation.libro?.nombre,
        autor: mongooseReservation.libro?.autor
      }
    };
  }

  async update(id, updates) {
    const mongooseReservation = await ReservationModel.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('libro');
    
    if (!mongooseReservation) return null;
    
    return {
      ...ReservationMapper.toDomain(mongooseReservation),
      libro: mongooseReservation.libro ? {
        nombre: mongooseReservation.libro.nombre,
        autor: mongooseReservation.libro.autor
      } : null
    };
  }
}

module.exports = MongoReservationRepository;

