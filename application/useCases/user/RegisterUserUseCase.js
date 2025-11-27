const User = require('../../../domain/entities/User');
const bcrypt = require('bcryptjs');

class RegisterUserUseCase {
  constructor(userRepository, jwtService) {
    this.userRepository = userRepository;
    this.jwtService = jwtService;
  }

  async execute({ nombre, correo, contraseña, permisos }) {
    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(correo);
    if (existingUser) {
      throw new Error('El correo ya está registrado');
    }

    // Hash de contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contraseña, salt);

    // Crear entidad de dominio
    const user = new User(
      null, // id se asignará al guardar
      nombre,
      correo,
      hashedPassword,
      permisos || {}
    );

    // Guardar usuario
    const savedUser = await this.userRepository.create(user);

    // Generar token
    const token = this.jwtService.generateToken(savedUser.id);

    return {
      message: 'Usuario creado exitosamente',
      token,
      user: savedUser.toJSON()
    };
  }
}

module.exports = RegisterUserUseCase;

