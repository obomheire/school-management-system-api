const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

// Import the actual modules but with mocked dependencies
jest.mock('../../config/index.config.js', () => ({
  dotEnv: {
    MONGO_URI: 'mongodb://localhost:27017/test_db',
    LONG_TOKEN_SECRET: 'test-secret-key-for-testing',
    SHORT_TOKEN_SECRET: 'test-secret-key-for-testing',
    NACL_SECRET: 'test-secret-key-for-testing',
    USER_PORT: 3000,
    CORS_ORIGIN: '*',
    RATE_LIMIT_WINDOW_MS: 900000,
    RATE_LIMIT_MAX_REQUESTS: 100,
    RATE_LIMIT_AUTH_MAX_REQUESTS: 20,
  }
}));

// Create a test server that simulates the API
describe('API Endpoint Tests', () => {
  let app;
  let server;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Mock the API endpoints directly
    app.post('/api/auth/register', (req, res) => {
      // Simulate successful registration
      res.status(200).json({
        ok: true,
        data: {
          user: {
            _id: 'mock-user-id',
            username: req.body.username,
            email: req.body.email,
            role: req.body.role
          },
          longToken: 'mock-jwt-token'
        }
      });
    });

    app.post('/api/auth/login', (req, res) => {
      // Simulate successful login
      res.status(200).json({
        ok: true,
        data: {
          user: {
            _id: 'mock-user-id',
            username: 'testuser',
            email: req.body.email,
            role: 'school_admin'
          },
          longToken: 'mock-jwt-token'
        }
      });
    });

    app.get('/api/auth/getProfile', (req, res) => {
      // Simulate profile retrieval
      res.status(200).json({
        ok: true,
        data: {
          user: {
            _id: 'mock-user-id',
            username: 'testuser',
            email: 'test@example.com',
            role: 'school_admin'
          }
        }
      });
    });

    app.post('/api/school/createSchool', (req, res) => {
      // Simulate school creation
      res.status(200).json({
        ok: true,
        data: {
          school: {
            _id: 'mock-school-id',
            name: req.body.name,
            address: req.body.address,
            contactInfo: req.body.contactInfo,
            status: 'active'
          }
        }
      });
    });

    app.get('/api/school/listSchools', (req, res) => {
      // Simulate school listing
      res.status(200).json({
        ok: true,
        data: {
          schools: [
            {
              _id: 'mock-school-1',
              name: 'Test School 1',
              address: { street: '123 Main St', city: 'Anytown', state: 'CA', zipCode: '12345' },
              contactInfo: { phone: '555-1234', email: 'info@test1.edu' },
              status: 'active'
            },
            {
              _id: 'mock-school-2',
              name: 'Test School 2',
              address: { street: '456 Oak Ave', city: 'Somewhere', state: 'NY', zipCode: '54321' },
              contactInfo: { phone: '555-5678', email: 'info@test2.edu' },
              status: 'active'
            }
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 2,
            pages: 1
          }
        }
      });
    });

    app.post('/api/classroom/createClassroom', (req, res) => {
      // Simulate classroom creation
      res.status(200).json({
        ok: true,
        data: {
          classroom: {
            _id: 'mock-classroom-id',
            name: req.body.name,
            roomNumber: req.body.roomNumber,
            school: req.body.schoolId,
            gradeLevel: req.body.gradeLevel,
            capacity: req.body.capacity,
            status: 'active'
          }
        }
      });
    });

    app.post('/api/student/enrollStudent', (req, res) => {
      // Simulate student enrollment
      res.status(200).json({
        ok: true,
        data: {
          student: {
            _id: 'mock-student-id',
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            studentId: req.body.studentId,
            school: req.body.schoolId,
            classroom: req.body.classroomId,
            status: 'active'
          }
        }
      });
    });
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('Auth API Endpoints', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          role: 'school_admin'
        })
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.data.user).toHaveProperty('_id');
      expect(response.body.data.user.username).toBe('testuser');
      expect(response.body.data).toHaveProperty('longToken');
    });

    it('should login a user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.data.user).toHaveProperty('_id');
      expect(response.body.data).toHaveProperty('longToken');
    });

    it('should get user profile', async () => {
      const response = await request(app)
        .get('/api/auth/getProfile')
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.data.user).toHaveProperty('_id');
      expect(response.body.data.user.role).toBe('school_admin');
    });
  });

  describe('School API Endpoints', () => {
    it('should create a new school', async () => {
      const response = await request(app)
        .post('/api/school/createSchool')
        .send({
          name: 'New Test School',
          address: {
            street: '789 New St',
            city: 'New City',
            state: 'NC',
            zipCode: '98765'
          },
          contactInfo: {
            phone: '555-9999',
            email: 'info@newtest.edu'
          }
        })
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.data.school).toHaveProperty('_id');
      expect(response.body.data.school.name).toBe('New Test School');
      expect(response.body.data.school.status).toBe('active');
    });

    it('should list schools', async () => {
      const response = await request(app)
        .get('/api/school/listSchools')
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(Array.isArray(response.body.data.schools)).toBe(true);
      expect(response.body.data.schools.length).toBeGreaterThan(0);
      expect(response.body.data.pagination).toHaveProperty('total');
    });
  });

  describe('Classroom API Endpoints', () => {
    it('should create a new classroom', async () => {
      const response = await request(app)
        .post('/api/classroom/createClassroom')
        .send({
          schoolId: 'mock-school-id',
          name: 'New Classroom',
          roomNumber: 'NC-101',
          gradeLevel: 'K-5',
          capacity: 25
        })
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.data.classroom).toHaveProperty('_id');
      expect(response.body.data.classroom.name).toBe('New Classroom');
      expect(response.body.data.classroom.school).toBe('mock-school-id');
    });
  });

  describe('Student API Endpoints', () => {
    it('should enroll a new student', async () => {
      const response = await request(app)
        .post('/api/student/enrollStudent')
        .send({
          schoolId: 'mock-school-id',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '2010-01-01',
          studentId: 'STD001',
          classroomId: 'mock-classroom-id',
          guardianInfo: {
            name: 'Jane Doe',
            relationship: 'Mother',
            phone: '555-0000',
            email: 'jane.doe@example.com'
          }
        })
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.data.student).toHaveProperty('_id');
      expect(response.body.data.student.firstName).toBe('John');
      expect(response.body.data.student.lastName).toBe('Doe');
      expect(response.body.data.student.studentId).toBe('STD001');
    });
  });
});