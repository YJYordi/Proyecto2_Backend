const jwt = require('jsonwebtoken');

class JwtService {
  constructor(secret) {
    this.secret = secret || process.env.JWT_SECRET;
  }

  generateToken(userId) {
    return jwt.sign({ userId }, this.secret, { expiresIn: '7d' });
  }

  verifyToken(token) {
    return jwt.verify(token, this.secret);
  }
}

module.exports = JwtService;

