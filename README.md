# School Management System API

A comprehensive school management system API built with Node.js, Express, and MongoDB.

## Documentation

- API documentation is available in [`docs/api-docs.md`](docs/api-docs.md)
- Postman collections is available in [`docs/School Management.postman_collection.json`](docs/api-docs.md)
- Architectural design and database design (with diagrams) are available in [`docs/architectural-designs.md`](docs/architectural-designs.md)
- Seeded test users/data reference is available in [`docs/test-data.md`](docs/test-data.md)

## Prerequisites

Before setting up the project, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (either local installation or cloud instance)
- [Redis](https://redis.io/) (for caching and state management)
- [Git](https://git-scm.com/)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd school-management-system-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory by copying the example:

```bash
cp .env.example .env
```

Then update the values in the `.env` file with your specific configurations:

#### Required Environment Variables:

- `SERVICE_NAME`: Name of your service (default: school-management-system-api)
- `USER_PORT`: Port for user-facing API (default: 5111)
- `ADMIN_PORT`: Port for admin-facing API (default: 5222)
- `MONGO_URI`: MongoDB connection string
- `CACHE_REDIS`: Redis URI for caching
- `OYSTER_REDIS`: Redis URI for Oyster DB
- `CORTEX_REDIS`: Redis URI for Cortex state management
- `LONG_TOKEN_SECRET`: Secret key for long-lived tokens (min 32 chars)
- `SHORT_TOKEN_SECRET`: Secret key for short-lived tokens (min 32 chars)
- `NACL_SECRET`: Secret key for encryption (min 32 chars)

#### Example `.env` file:

```env
# Server Configuration
SERVICE_NAME=school-management-system-api
USER_PORT=5111
ADMIN_PORT=5222
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/school_management

# Redis Configuration
CACHE_REDIS=redis://127.0.0.1:6379
CACHE_PREFIX=sms_cache_

OYSTER_REDIS=redis://127.0.0.1:6379
OYSTER_PREFIX=sms_oyster_

CORTEX_REDIS=redis://127.0.0.1:6379
CORTEX_PREFIX=sms_cortex_
CORTEX_TYPE=master

# JWT Token Secrets (CHANGE THESE IN PRODUCTION)
LONG_TOKEN_SECRET=your-super-secret-long-token-key-change-this-in-production-min-32-chars
SHORT_TOKEN_SECRET=your-super-secret-short-token-key-change-this-in-production-min-32-chars
NACL_SECRET=your-super-secret-nacl-key-change-this-in-production-min-32-chars

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX_REQUESTS=20
```

### 4. Set Up MongoDB

You need to have MongoDB running. You can either:

- Install MongoDB locally: Follow the [official installation guide](https://docs.mongodb.com/manual/installation/)
- Use MongoDB Atlas: Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas/database)

Update the `MONGO_URI` in your `.env` file with the appropriate connection string.

### 5. Set Up Redis

You need to have Redis running. You can either:

- Install Redis locally: Follow the [official installation guide](https://redis.io/topics/quickstart)
- Use a cloud Redis service like Redis Labs

Update the Redis URIs in your `.env` file with the appropriate connection strings.

### 6. Run the Application

Start the server using npm:

```bash
npm start
```

Or run directly with node:

```bash
node index.js
```

The application will start and listen on the ports specified in your `.env` file:
- User API: `http://localhost:5111`
- Admin API: `http://localhost:5222`

### 7. Seed Test Data

To seed test data for local API testing:

```bash
npm run seed
```

Seed output details and credentials are documented in [`docs/test-data.md`](docs/test-data.md).

## Project Structure

```
school-management-system-api/
├── app.js                 # Main application entry point
├── index.js              # Alternative entry point
├── .env.example          # Example environment variables
├── package.json          # Project dependencies and scripts
├── config/               # Configuration files
│   ├── index.config.js   # Main configuration
│   └── envs/             # Environment-specific configs
├── connect/              # Database connection utilities
├── loaders/              # Module loaders
├── managers/             # Service managers
├── cache/                # Caching utilities
├── libs/                 # Utility libraries
├── mws/                  # Middleware
└── README.md            # This file
```

## Development

For development purposes, you can use nodemon to automatically restart the server when files change:

```bash
npm install -g nodemon
nodemon index.js
```

## Testing

The project includes a comprehensive test suite to ensure API functionality. To run the tests:

### Install Test Dependencies

```bash
npm install --save-dev jest supertest
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- tests/api/api.test.js
```

### Test Structure

The test suite includes:

- **API Tests** (`tests/api/api.test.js`): Tests for all API endpoints
- **Unit Tests** (`tests/unit/`): Individual component tests
- **Integration Tests**: Full workflow tests

The tests use a simulated server approach that mocks external dependencies, allowing for fast and reliable testing without requiring MongoDB, Redis, or other external services to be running.

## Troubleshooting

### Common Issues:

1. **Environment Variables Missing**: Make sure all required environment variables are set in your `.env` file, especially the token secrets.

2. **MongoDB Connection Issues**: Verify that MongoDB is running and accessible via the URI in your `.env` file.

3. **Redis Connection Issues**: Ensure Redis is running and accessible via the URIs in your `.env` file.

4. **Port Already in Use**: Check if the ports specified in your `.env` file (USER_PORT and ADMIN_PORT) are not being used by other applications.

### Error Messages:

- If you see "missing .env variables check index.config", make sure you have set all three required secret keys in your `.env` file.
- If you see "MONGO_URI not found in environment variables", ensure the MONGO_URI variable is properly set.

## Security Notes

- Change all default secret keys before deploying to production
- Use strong, unique passwords for database connections
- Restrict access to your Redis and MongoDB instances
- Use HTTPS in production environments

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
