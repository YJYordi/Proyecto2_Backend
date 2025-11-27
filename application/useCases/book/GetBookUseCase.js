class GetBookUseCase {
  constructor(bookRepository) {
    this.bookRepository = bookRepository;
  }

  async execute(bookId, includeDisabled = false) {
    const book = await this.bookRepository.findById(bookId, includeDisabled);
    
    if (!book) {
      throw new Error('Libro no encontrado');
    }

    return {
      book
    };
  }
}

module.exports = GetBookUseCase;

