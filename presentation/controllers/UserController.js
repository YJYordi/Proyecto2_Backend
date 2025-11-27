const container = require('../../application/container/DependencyContainer');
const UserMapper = require('../../application/mappers/UserMapper');

class UserController {
  // Create (Registro)
  async register(req, res) {
    try {
      const result = await container.registerUserUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error.message === 'El correo ya está registrado') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Read (Login)
  async login(req, res) {
    try {
      const result = await container.loginUserUseCase.execute(req.body);
      res.json(result);
    } catch (error) {
      if (error.message === 'Credenciales inválidas' || error.message === 'Usuario inhabilitado') {
        return res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Read (Obtener información de usuario)
  async getUser(req, res) {
    try {
      const { userId } = req.params;
      const includeDisabled = req.query.includeDisabled === 'true';
      const result = await container.getUserUseCase.execute(userId, includeDisabled);
      res.json(result);
    } catch (error) {
      if (error.message === 'Usuario no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Update (Modificar usuario)
  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const requestingUser = UserMapper.toDomain(req.user);
      const result = await container.updateUserUseCase.execute(userId, req.body, requestingUser);
      res.json(result);
    } catch (error) {
      if (error.message === 'No tiene permiso para modificar este usuario') {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === 'Usuario no encontrado' || error.message === 'El correo ya está en uso') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Delete (Soft delete - Inhabilitar usuario)
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;
      const requestingUser = UserMapper.toDomain(req.user);
      const result = await container.deleteUserUseCase.execute(userId, requestingUser);
      res.json(result);
    } catch (error) {
      if (error.message === 'No tiene permiso para inhabilitar este usuario') {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === 'Usuario no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserController();

