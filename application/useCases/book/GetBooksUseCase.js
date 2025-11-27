class GetBooksUseCase {
  constructor(bookRepository) {
    this.bookRepository = bookRepository;
  }

  async execute(filters = {}, pagination = {}) {
    const { books, total } = await this.bookRepository.findAll(filters, pagination);
    
    const pageNum = parseInt(pagination.page) || 1;
    const limitNum = parseInt(pagination.limit) || 10;
    const maxPage = Math.ceil(total / limitNum);

    // Retornar solo nombres según requisitos
    const booksNames = books.map(book => ({ nombre: book.nombre }));

    return {
      books: booksNames,
      paginacion: {
        paginaActual: pageNum,
        paginaMaxima: maxPage,
        librosPorPagina: limitNum,
        totalLibros: total
      }
    };
  }
}

module.exports = GetBooksUseCase;

