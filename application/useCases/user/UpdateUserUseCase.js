const bcrypt = require('bcryptjs');

class UpdateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId, updates, requestingUser) {
    // Verificar permisos
    if (!requestingUser.canModifyUser(userId)) {
      throw new Error('No tiene permiso para modificar este usuario');
    }

    // Buscar usuario
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Si se actualiza el correo, verificar que no esté en uso
    if (updates.correo && updates.correo !== user.correo) {
      const existingUser = await this.userRepository.findByEmail(updates.correo);
      if (existingUser) {
        throw new Error('El correo ya está en uso');
      }
    }

    // Hash de contraseña si se actualiza
    if (updates.contraseña) {
      const salt = await bcrypt.genSalt(10);
      updates.contraseña = await bcrypt.hash(updates.contraseña, salt);
    }

    // Actualizar campos permitidos
    const allowedUpdates = ['nombre', 'correo', 'contraseña', 'permisos'];
    const updateData = {};
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    // Actualizar usuario
    const updatedUser = await this.userRepository.update(userId, updateData);

    return {
      message: 'Usuario actualizado exitosamente',
      user: updatedUser.toJSON()
    };
  }
}

module.exports = UpdateUserUseCase;

