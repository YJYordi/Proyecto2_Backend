class DeleteBookUseCase {
  constructor(bookRepository) {
    this.bookRepository = bookRepository;
  }

  async execute(bookId) {
    // Buscar libro
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new Error('Libro no encontrado');
    }

    // Soft delete
    book.disable();
    await this.bookRepository.update(bookId, { 
      habilitado: false, 
      disponible: false 
    });

    return {
      message: 'Libro inhabilitado exitosamente'
    };
  }
}

module.exports = DeleteBookUseCase;

