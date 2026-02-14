# Test Suite Documentation

This document describes the API test coverage for the School Management System API.

## Overview

The test suite provides comprehensive coverage for the school management system API, including:

- Authentication endpoints (register, login, getProfile)
- School management endpoints (create, list, get, update, delete)
- Classroom management endpoints (create, list, get, update, delete)
- Student management endpoints (enroll, list, get, update, withdraw)

## Test Structure

```
tests/
├── api/
│   └── api.test.js          # API endpoint tests
├── unit/
│   ├── auth.manager.test.js # Unit tests for auth manager
│   └── school.manager.test.js # Unit tests for school manager
└── setup.js                 # Test setup and configuration
```

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Files
```bash
# Run API tests
npm test -- tests/api/api.test.js

# Run unit tests
npm test -- tests/unit/auth.manager.test.js
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## API Endpoint Tests

The API tests cover the following endpoints:

### Authentication (`/api/auth/`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /getProfile` - Get user profile

### Schools (`/api/school/`)
- `POST /createSchool` - Create a new school
- `GET /listSchools` - List all schools
- `GET /getSchool` - Get specific school details
- `PUT /updateSchool` - Update school information
- `DELETE /deleteSchool` - Soft delete a school

### Classrooms (`/api/classroom/`)
- `POST /createClassroom` - Create a new classroom
- `GET /listClassrooms` - List classrooms in a school
- `GET /getClassroom` - Get specific classroom details
- `PUT /updateClassroom` - Update classroom information
- `DELETE /deleteClassroom` - Soft delete a classroom

### Students (`/api/student/`)
- `POST /enrollStudent` - Enroll a new student
- `GET /listStudents` - List students in a school
- `GET /getStudent` - Get specific student details
- `PUT /updateStudent` - Update student information
- `DELETE /withdrawnStudent` - Withdraw a student

## Test Coverage

The test suite includes:
- Positive test cases (successful operations)
- Negative test cases (error conditions)
- Input validation tests
- Authorization tests (where applicable)
- Edge case handling

## Mocking Strategy

The tests use a simulated API server approach that:
- Mocks the API endpoints directly
- Simulates responses from the actual business logic
- Allows for testing without external dependencies
- Enables fast test execution

## Future Improvements

Potential areas for enhancement:
- Add database integration tests with in-memory MongoDB
- Expand negative test cases
- Add performance tests
- Add security-focused tests
- Add contract tests to verify API compliance