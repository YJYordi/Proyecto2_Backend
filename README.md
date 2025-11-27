# API Backend - Plataforma de Biblioteca Digital

Backend desarrollado para una plataforma de biblioteca donde los usuarios pueden ingresar y reservar libros de manera digital.

## Características

- Sistema de autenticación con JWT
- Gestión de usuarios con permisos granulares
- CRUD completo para libros con filtros avanzados
- Sistema de reservas de libros
- Historial de reservas por usuario y por libro
- Soft deletes para seguridad de datos
- Paginación en listados
- Validación de datos con express-validator
- Suite completa de pruebas unitarias

## Tecnologías Utilizadas

- **Node.js** - Entorno de ejecución
- **Express** - Framework web
- **MongoDB** - Base de datos
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas
- **Jest** - Framework de pruebas
- **Supertest** - Pruebas de API

## Requisitos Previos

- Node.js (v14 o superior)
- MongoDB (local o remoto)
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd proyecto_1
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear un archivo `.env` en la raíz del proyecto con el siguiente contenido:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/biblioteca
JWT_SECRET=tu-clave-secreta-cambiar-en-produccion
NODE_ENV=development
```

4. Iniciar el servidor:
```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
proyecto_1/
├── config/
│   └── database.js          # Configuración de MongoDB
├── controllers/
│   ├── userController.js    # Controlador de usuarios
│   ├── bookController.js    # Controlador de libros
│   └── reservationController.js  # Controlador de reservas
├── middleware/
│   ├── auth.js              # Middleware de autenticación
│   └── validators.js        # Validaciones de datos
├── models/
│   ├── User.js              # Modelo de usuario
│   ├── Book.js              # Modelo de libro
│   └── Reservation.js       # Modelo de reserva
├── routes/
│   ├── userRoutes.js        # Rutas de usuarios
│   ├── bookRoutes.js        # Rutas de libros
│   ├── reservationRoutes.js # Rutas de reservas
│   └── index.js             # Índice de rutas
├── tests/
│   ├── setup.js             # Configuración de pruebas
│   ├── userController.test.js
│   ├── bookController.test.js
│   └── reservationController.test.js
├── server.js                # Servidor principal
├── package.json
└── README.md
```

## Endpoints de la API

### Base URL
```
http://localhost:3000/api
```

### Usuarios

#### POST `/usuarios/register`
Registrar un nuevo usuario (no requiere autenticación)

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "correo": "juan@example.com",
  "contraseña": "password123",
  "permisos": {
    "crearLibros": false,
    "modificarLibros": false,
    "inhabilitarLibros": false,
    "modificarUsuarios": false,
    "inhabilitarUsuarios": false
  }
}
```

**Response:**
```json
{
  "message": "Usuario creado exitosamente",
  "token": "jwt-token",
  "user": { ... }
}
```

#### POST `/usuarios/login`
Iniciar sesión (no requiere autenticación)

**Body:**
```json
{
  "correo": "juan@example.com",
  "contraseña": "password123"
}
```

**Response:**
```json
{
  "message": "Login exitoso",
  "token": "jwt-token",
  "user": { ... }
}
```

#### GET `/usuarios/:userId`
Obtener información de un usuario (no requiere autenticación)

**Query params:**
- `includeDisabled=true` - Incluir usuarios inhabilitados

#### PUT `/usuarios/:userId`
Actualizar usuario (requiere autenticación)
- Un usuario solo puede modificarse a sí mismo o tener permiso `modificarUsuarios`

**Body:**
```json
{
  "nombre": "Juan Pérez Actualizado",
  "correo": "nuevo@example.com"
}
```

#### DELETE `/usuarios/:userId`
Inhabilitar usuario - Soft delete (requiere autenticación)
- Un usuario solo puede inhabilitarse a sí mismo o tener permiso `inhabilitarUsuarios`

### Libros

#### POST `/libros`
Crear un libro (requiere autenticación y permiso `crearLibros`)

**Body:**
```json
{
  "nombre": "El Quijote",
  "autor": "Miguel de Cervantes",
  "genero": "Novela",
  "fechaPublicacion": "1605-01-01",
  "casaEditorial": "Editorial XYZ"
}
```

#### GET `/libros`
Obtener lista de libros con filtros y paginación (no requiere autenticación)

**Query params:**
- `genero` - Filtrar por género
- `autor` - Filtrar por autor
- `casaEditorial` - Filtrar por casa editorial
- `nombre` - Filtrar por nombre
- `disponible` - Filtrar por disponibilidad (true/false)
- `fechaPublicacion` - Filtrar por fecha (YYYY-MM-DD)
- `page` - Número de página (default: 1)
- `limit` - Libros por página (default: 10)
- `includeDisabled` - Incluir libros inhabilitados

**Ejemplo:**
```
GET /api/libros?genero=Ficción&autor=Cervantes&page=1&limit=5
```

**Response:**
```json
{
  "books": [
    { "nombre": "Libro 1" },
    { "nombre": "Libro 2" }
  ],
  "paginacion": {
    "paginaActual": 1,
    "paginaMaxima": 5,
    "librosPorPagina": 10,
    "totalLibros": 50
  }
}
```

#### GET `/libros/:bookId`
Obtener un libro específico (no requiere autenticación)

**Query params:**
- `includeDisabled=true` - Incluir libros inhabilitados

#### PUT `/libros/:bookId`
Actualizar libro (requiere autenticación)
- Modificar información del libro requiere permiso `modificarLibros`
- Modificar disponibilidad no requiere permiso especial

#### DELETE `/libros/:bookId`
Inhabilitar libro - Soft delete (requiere autenticación y permiso `inhabilitarLibros`)

#### GET `/libros/:bookId/historial`
Obtener historial de reservas de un libro (requiere autenticación)

**Response:**
```json
{
  "libro": {
    "nombre": "El Quijote",
    "autor": "Miguel de Cervantes"
  },
  "historial": [
    {
      "nombreUsuario": "Juan Pérez",
      "correoUsuario": "juan@example.com",
      "fechaReserva": "2024-01-15T10:00:00.000Z",
      "fechaEntrega": null,
      "activa": true
    }
  ]
}
```

### Reservas

#### POST `/reservas`
Crear una reserva (requiere autenticación)

**Body:**
```json
{
  "bookId": "507f1f77bcf86cd799439011"
}
```

#### GET `/reservas/usuario/:userId`
Obtener historial de reservas de un usuario (requiere autenticación)
- Solo el mismo usuario o usuarios con permiso `modificarUsuarios` pueden ver el historial

**Query params:**
- `includeDisabled=true` - Incluir usuarios inhabilitados

**Response:**
```json
{
  "usuario": {
    "nombre": "Juan Pérez",
    "correo": "juan@example.com"
  },
  "historial": [
    {
      "nombreLibro": "El Quijote",
      "autorLibro": "Miguel de Cervantes",
      "generoLibro": "Novela",
      "fechaReserva": "2024-01-15T10:00:00.000Z",
      "fechaEntrega": null,
      "activa": true
    }
  ]
}
```

#### PUT `/reservas/:reservationId/entregar`
Entregar libro - Marcar reserva como inactiva (requiere autenticación)
- Solo el usuario que hizo la reserva o usuarios con permiso `modificarUsuarios` pueden entregar

## Permisos de Usuario

Los permisos se configuran en el objeto `permisos` del usuario:

- `crearLibros` - Permite crear nuevos libros
- `modificarLibros` - Permite modificar información de libros
- `inhabilitarLibros` - Permite inhabilitar libros
- `modificarUsuarios` - Permite modificar otros usuarios y ver sus historiales
- `inhabilitarUsuarios` - Permite inhabilitar otros usuarios

Los permisos pueden venir en cualquier combinación.

## Pruebas

Ejecutar todas las pruebas:
```bash
npm test
```

Ejecutar pruebas en modo watch:
```bash
npm run test:watch
```

Ejecutar pruebas con cobertura:
```bash
npm test -- --coverage
```

### Configuración de Pruebas

Para las pruebas, crear un archivo `.env.test` (opcional):
```
MONGODB_TEST_URI=mongodb://localhost:27017/biblioteca_test
JWT_SECRET=test-secret-key
```

Las pruebas utilizan una base de datos separada y limpian los datos después de cada ejecución.

## Seguridad

- Las contraseñas se encriptan con bcrypt antes de guardarse
- Autenticación mediante JWT tokens
- Validación de datos en todos los endpoints
- Soft deletes para mantener integridad de datos
- Verificación de permisos en operaciones sensibles
- Los usuarios inhabilitados no pueden iniciar sesión

## Notas Importantes

- Todos los endpoints excepto `POST /usuarios/register`, `POST /usuarios/login`, `GET /libros` y `GET /libros/:bookId` requieren autenticación
- Los READ excluyen entradas inhabilitadas por defecto, a menos que se solicite explícitamente con `includeDisabled=true`
- Un libro es una unidad única (no hay libros repetidos)
- No hay límite en la cantidad de libros que un usuario puede reservar
- Cualquier usuario autenticado puede reservar un libro disponible
- Un usuario no puede tener múltiples reservas activas del mismo libro

## Autor

Desarrollado como proyecto académico para el curso de Desarrollo Web Backend.

## Licencia

ISC

