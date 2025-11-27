class Book {
  constructor(id, nombre, autor, genero, fechaPublicacion, casaEditorial, disponible = true, habilitado = true, createdAt = null, updatedAt = null) {
    this.id = id;
    this.nombre = nombre;
    this.autor = autor;
    this.genero = genero;
    this.fechaPublicacion = fechaPublicacion;
    this.casaEditorial = casaEditorial;
    this.disponible = disponible;
    this.habilitado = habilitado;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Métodos de negocio
  isAvailable() {
    return this.disponible === true && this.habilitado === true;
  }

  isEnabled() {
    return this.habilitado === true;
  }

  disable() {
    this.habilitado = false;
    this.disponible = false;
  }

  enable() {
    this.habilitado = true;
  }

  markAsUnavailable() {
    this.disponible = false;
  }

  markAsAvailable() {
    this.disponible = true;
  }

  updateInfo(nombre, autor, genero, fechaPublicacion, casaEditorial) {
    if (nombre !== undefined) this.nombre = nombre;
    if (autor !== undefined) this.autor = autor;
    if (genero !== undefined) this.genero = genero;
    if (fechaPublicacion !== undefined) this.fechaPublicacion = fechaPublicacion;
    if (casaEditorial !== undefined) this.casaEditorial = casaEditorial;
  }

  updateAvailability(disponible) {
    this.disponible = disponible;
  }
}

module.exports = Book;

