// Contenedor de dependencias para inyección
const MongoUserRepository = require('../../infrastructure/repositories/MongoUserRepository');
const MongoBookRepository = require('../../infrastructure/repositories/MongoBookRepository');
const MongoReservationRepository = require('../../infrastructure/repositories/MongoReservationRepository');
const JwtService = require('../../infrastructure/auth/JwtService');

// Use Cases - User
const RegisterUserUseCase = require('../useCases/user/RegisterUserUseCase');
const LoginUserUseCase = require('../useCases/user/LoginUserUseCase');
const GetUserUseCase = require('../useCases/user/GetUserUseCase');
const UpdateUserUseCase = require('../useCases/user/UpdateUserUseCase');
const DeleteUserUseCase = require('../useCases/user/DeleteUserUseCase');

// Use Cases - Book
const CreateBookUseCase = require('../useCases/book/CreateBookUseCase');
const GetBookUseCase = require('../useCases/book/GetBookUseCase');
const GetBooksUseCase = require('../useCases/book/GetBooksUseCase');
const UpdateBookUseCase = require('../useCases/book/UpdateBookUseCase');
const DeleteBookUseCase = require('../useCases/book/DeleteBookUseCase');
const GetBookReservationHistoryUseCase = require('../useCases/book/GetBookReservationHistoryUseCase');

// Use Cases - Reservation
const CreateReservationUseCase = require('../useCases/reservation/CreateReservationUseCase');
const GetUserReservationHistoryUseCase = require('../useCases/reservation/GetUserReservationHistoryUseCase');
const ReturnBookUseCase = require('../useCases/reservation/ReturnBookUseCase');

class DependencyContainer {
  constructor() {
    // Repositorios
    this.userRepository = new MongoUserRepository();
    this.bookRepository = new MongoBookRepository();
    this.reservationRepository = new MongoReservationRepository();
    
    // Servicios
    this.jwtService = new JwtService();

    // Use Cases - User
    this.registerUserUseCase = new RegisterUserUseCase(this.userRepository, this.jwtService);
    this.loginUserUseCase = new LoginUserUseCase(this.userRepository, this.jwtService);
    this.getUserUseCase = new GetUserUseCase(this.userRepository);
    this.updateUserUseCase = new UpdateUserUseCase(this.userRepository);
    this.deleteUserUseCase = new DeleteUserUseCase(this.userRepository);

    // Use Cases - Book
    this.createBookUseCase = new CreateBookUseCase(this.bookRepository);
    this.getBookUseCase = new GetBookUseCase(this.bookRepository);
    this.getBooksUseCase = new GetBooksUseCase(this.bookRepository);
    this.updateBookUseCase = new UpdateBookUseCase(this.bookRepository);
    this.deleteBookUseCase = new DeleteBookUseCase(this.bookRepository);
    this.getBookReservationHistoryUseCase = new GetBookReservationHistoryUseCase(
      this.bookRepository,
      this.reservationRepository
    );

    // Use Cases - Reservation
    this.createReservationUseCase = new CreateReservationUseCase(
      this.bookRepository,
      this.reservationRepository
    );
    this.getUserReservationHistoryUseCase = new GetUserReservationHistoryUseCase(
      this.userRepository,
      this.reservationRepository
    );
    this.returnBookUseCase = new ReturnBookUseCase(
      this.reservationRepository,
      this.bookRepository
    );
  }
}

// Singleton
const container = new DependencyContainer();

module.exports = container;

