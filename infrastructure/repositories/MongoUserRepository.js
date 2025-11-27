const UserModel = require('../models/UserModel');
const UserMapper = require('../../application/mappers/UserMapper');
const mongoose = require('mongoose');

class MongoUserRepository {
  async findById(id, includeDisabled = false) {
    const query = { _id: new mongoose.Types.ObjectId(id) };
    if (!includeDisabled) {
      query.habilitado = true;
    }

    const mongooseUser = await UserModel.findOne(query);
    return UserMapper.toDomain(mongooseUser);
  }

  async findByEmail(email, includeDisabled = false) {
    const query = { correo: email };
    if (!includeDisabled) {
      query.habilitado = true;
    }

    const mongooseUser = await UserModel.findOne(query);
    return UserMapper.toDomain(mongooseUser);
  }

  async create(user) {
    const userData = UserMapper.toPersistence(user);
    const mongooseUser = new UserModel(userData);
    await mongooseUser.save();
    return UserMapper.toDomain(mongooseUser);
  }

  async update(id, updates) {
    const mongooseUser = await UserModel.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    return UserMapper.toDomain(mongooseUser);
  }

  async delete(id) {
    await UserModel.findByIdAndUpdate(id, { habilitado: false });
    return true;
  }

  async exists(email) {
    const user = await UserModel.findOne({ correo: email, habilitado: true });
    return !!user;
  }
}

module.exports = MongoUserRepository;

