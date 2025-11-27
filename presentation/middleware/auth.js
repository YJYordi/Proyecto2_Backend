const jwt = require('jsonwebtoken');
const container = require('../../application/container/DependencyContainer');
const UserMapper = require('../../application/mappers/UserMapper');

// Middleware para verificar token JWT
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        error: 'Acceso denegado. Token no proporcionado.' 
      });
    }

    const decoded = container.jwtService.verifyToken(token);
    const user = await container.userRepository.findById(decoded.userId);

    if (!user || !user.isEnabled()) {
      return res.status(401).json({ 
        error: 'Token inválido o usuario inhabilitado.' 
      });
    }

    // Adjuntar usuario de Mongoose para compatibilidad con código existente
    // Esto permite que req.user tenga los métodos de Mongoose si se necesitan
    const UserModel = require('../../infrastructure/models/UserModel');
    const mongooseUser = await UserModel.findById(decoded.userId);
    req.user = mongooseUser; // Mantener compatibilidad

    // También adjuntar entidad de dominio
    req.userDomain = user;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido.' });
  }
};

// Middleware para verificar permisos específicos
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.userDomain) {
        // Si no hay userDomain, obtenerlo
        const decoded = jwt.verify(
          req.header('Authorization')?.replace('Bearer ', ''),
          process.env.JWT_SECRET
        );
        req.userDomain = await container.userRepository.findById(decoded.userId);
      }

      if (!req.userDomain) {
        return res.status(401).json({ error: 'Usuario no autenticado.' });
      }

      const permissionMap = {
        'crearLibros': 'canCreateBooks',
        'modificarLibros': 'canModifyBooks',
        'inhabilitarLibros': 'canDisableBooks',
        'modificarUsuarios': 'canModifyUsers',
        'inhabilitarUsuarios': 'canDisableUsers'
      };

      const method = permissionMap[permission];
      if (!method || !req.userDomain[method]()) {
        return res.status(403).json({ 
          error: `No tiene permiso para ${permission}.` 
        });
      }

      next();
    } catch (error) {
      res.status(401).json({ error: 'Error al verificar permisos.' });
    }
  };
};

module.exports = {
  authenticate,
  requirePermission
};

