class UpdateBookUseCase {
  constructor(bookRepository) {
    this.bookRepository = bookRepository;
  }

  async execute(bookId, updates, requestingUser) {
    // Verificar si se están modificando campos de información del libro
    const infoFields = ['nombre', 'autor', 'genero', 'fechaPublicacion', 'casaEditorial'];
    const isModifyingInfo = infoFields.some(field => updates[field] !== undefined);

    if (isModifyingInfo && !requestingUser.canModifyBooks()) {
      throw new Error('No tiene permiso para modificar la información del libro');
    }

    // Buscar libro
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new Error('Libro no encontrado');
    }

    // Actualizar campos permitidos
    const allowedUpdates = ['nombre', 'autor', 'genero', 'fechaPublicacion', 'casaEditorial', 'disponible'];
    const updateData = {};
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    // Actualizar libro
    const updatedBook = await this.bookRepository.update(bookId, updateData);

    return {
      message: 'Libro actualizado exitosamente',
      book: updatedBook
    };
  }
}

module.exports = UpdateBookUseCase;

