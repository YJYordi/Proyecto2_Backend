class User {
  constructor(id, nombre, correo, contraseña, permisos, habilitado = true, createdAt = null, updatedAt = null) {
    this.id = id;
    this.nombre = nombre;
    this.correo = correo;
    this.contraseña = contraseña; // Hasheada
    this.permisos = permisos || {
      crearLibros: false,
      modificarLibros: false,
      inhabilitarLibros: false,
      modificarUsuarios: false,
      inhabilitarUsuarios: false
    };
    this.habilitado = habilitado;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Métodos de negocio
  canCreateBooks() {
    return this.permisos.crearLibros === true;
  }

  canModifyBooks() {
    return this.permisos.modificarLibros === true;
  }

  canDisableBooks() {
    return this.permisos.inhabilitarLibros === true;
  }

  canModifyUsers() {
    return this.permisos.modificarUsuarios === true;
  }

  canDisableUsers() {
    return this.permisos.inhabilitarUsuarios === true;
  }

  canModifyUser(userId) {
    return this.id === userId || this.canModifyUsers();
  }

  canDisableUser(userId) {
    return this.id === userId || this.canDisableUsers();
  }

  isEnabled() {
    return this.habilitado === true;
  }

  disable() {
    this.habilitado = false;
  }

  enable() {
    this.habilitado = true;
  }

  toJSON() {
    const userObject = { ...this };
    delete userObject.contraseña;
    return userObject;
  }
}

module.exports = User;

