class DeleteUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId, requestingUser) {
    // Verificar permisos
    if (!requestingUser.canDisableUser(userId)) {
      throw new Error('No tiene permiso para inhabilitar este usuario');
    }

    // Buscar usuario
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Soft delete
    user.disable();
    await this.userRepository.update(userId, { habilitado: false });

    return {
      message: 'Usuario inhabilitado exitosamente'
    };
  }
}

module.exports = DeleteUserUseCase;

