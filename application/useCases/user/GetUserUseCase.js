class GetUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId, includeDisabled = false) {
    const user = await this.userRepository.findById(userId, includeDisabled);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return {
      user: user.toJSON()
    };
  }
}

module.exports = GetUserUseCase;

