const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  correo: {
    type: String,
    required: [true, 'El correo es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un correo válido']
  },
  contraseña: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  permisos: {
    crearLibros: { type: Boolean, default: false },
    modificarLibros: { type: Boolean, default: false },
    inhabilitarLibros: { type: Boolean, default: false },
    modificarUsuarios: { type: Boolean, default: false },
    inhabilitarUsuarios: { type: Boolean, default: false }
  },
  habilitado: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash de contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('contraseña')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.contraseña = await bcrypt.hash(this.contraseña, salt);
  next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.contraseña);
};

// Método para transformar el objeto al enviarlo (sin contraseña)
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.contraseña;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);

