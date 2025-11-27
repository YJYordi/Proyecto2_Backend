const Book = require('../../domain/entities/Book');

class BookMapper {
  // Convierte modelo de Mongoose a entidad de dominio
  static toDomain(mongooseBook) {
    if (!mongooseBook) return null;

    return new Book(
      mongooseBook._id.toString(),
      mongooseBook.nombre,
      mongooseBook.autor,
      mongooseBook.genero,
      mongooseBook.fechaPublicacion,
      mongooseBook.casaEditorial,
      mongooseBook.disponible,
      mongooseBook.habilitado,
      mongooseBook.createdAt,
      mongooseBook.updatedAt
    );
  }

  // Convierte entidad de dominio a objeto plano para Mongoose
  static toPersistence(domainBook) {
    if (!domainBook) return null;

    return {
      nombre: domainBook.nombre,
      autor: domainBook.autor,
      genero: domainBook.genero,
      fechaPublicacion: domainBook.fechaPublicacion,
      casaEditorial: domainBook.casaEditorial,
      disponible: domainBook.disponible,
      habilitado: domainBook.habilitado
    };
  }

  // Convierte múltiples modelos de Mongoose a entidades de dominio
  static toDomainList(mongooseBooks) {
    return mongooseBooks.map(book => this.toDomain(book));
  }
}

module.exports = BookMapper;

