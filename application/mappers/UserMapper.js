const User = require('../../domain/entities/User');

class UserMapper {
  // Convierte modelo de Mongoose a entidad de dominio
  static toDomain(mongooseUser) {
    if (!mongooseUser) return null;

    return new User(
      mongooseUser._id.toString(),
      mongooseUser.nombre,
      mongooseUser.correo,
      mongooseUser.contraseña,
      mongooseUser.permisos,
      mongooseUser.habilitado,
      mongooseUser.createdAt,
      mongooseUser.updatedAt
    );
  }

  // Convierte entidad de dominio a objeto plano para Mongoose
  static toPersistence(domainUser) {
    if (!domainUser) return null;

    return {
      nombre: domainUser.nombre,
      correo: domainUser.correo,
      contraseña: domainUser.contraseña,
      permisos: domainUser.permisos,
      habilitado: domainUser.habilitado
    };
  }

  // Convierte múltiples modelos de Mongoose a entidades de dominio
  static toDomainList(mongooseUsers) {
    return mongooseUsers.map(user => this.toDomain(user));
  }
}

module.exports = UserMapper;

