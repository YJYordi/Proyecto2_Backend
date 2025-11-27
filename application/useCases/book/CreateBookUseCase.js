const Book = require('../../../domain/entities/Book');

class CreateBookUseCase {
  constructor(bookRepository) {
    this.bookRepository = bookRepository;
  }

  async execute({ nombre, autor, genero, fechaPublicacion, casaEditorial }) {
    // Verificar si el libro ya existe
    const exists = await this.bookRepository.exists(nombre, autor);
    if (exists) {
      throw new Error('Este libro ya existe en la biblioteca');
    }

    // Crear entidad de dominio
    const book = new Book(
      null, // id se asignará al guardar
      nombre,
      autor,
      genero,
      fechaPublicacion,
      casaEditorial
    );

    // Guardar libro
    const savedBook = await this.bookRepository.create(book);

    return {
      message: 'Libro creado exitosamente',
      book: savedBook
    };
  }
}

module.exports = CreateBookUseCase;

