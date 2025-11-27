const bcrypt = require('bcryptjs');

class LoginUserUseCase {
  constructor(userRepository, jwtService) {
    this.userRepository = userRepository;
    this.jwtService = jwtService;
  }

  async execute({ correo, contraseña }) {
    // Buscar usuario
    const user = await this.userRepository.findByEmail(correo);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar si está habilitado
    if (!user.isEnabled()) {
      throw new Error('Usuario inhabilitado');
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(contraseña, user.contraseña);
    if (!isMatch) {
      throw new Error('Credenciales inválidas');
    }

    // Generar token
    const token = this.jwtService.generateToken(user.id);

    return {
      message: 'Login exitoso',
      token,
      user: user.toJSON()
    };
  }
}

module.exports = LoginUserUseCase;

