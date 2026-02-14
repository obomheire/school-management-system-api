// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/test_db'; // This won't be used due to mocking
require('dotenv').config({ path: './.env.test' });

// Mock Redis and other external dependencies
jest.mock('../cache/redis-client', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    quit: jest.fn(),
  })),
}));

jest.mock('ion-cortex', () => {
  return jest.fn().mockImplementation(() => ({
    sub: jest.fn(),
    pub: jest.fn(),
  }));
});

jest.mock('oyster-db', () => {
  return jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  }));
});

jest.mock('aeon-machine', () => {
  return jest.fn().mockImplementation(() => ({
    // Mock Aeon machine methods
  }));
});

// Mock the managers and their dependencies
const mockManagers = {
  responseDispatcher: {
    dispatch: jest.fn((res, data) => {
      res.send(data);
    })
  },
  cache: {
    key: {
      set: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    }
  },
  cortex: {
    sub: jest.fn(),
    pub: jest.fn(),
  },
  token: {
    genLongToken: jest.fn(() => 'mocked-long-token'),
  },
  auth: {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
  },
  school: {
    createSchool: jest.fn(),
    listSchools: jest.fn(),
    getSchool: jest.fn(),
    updateSchool: jest.fn(),
    deleteSchool: jest.fn(),
  },
  classroom: {
    createClassroom: jest.fn(),
    listClassrooms: jest.fn(),
    getClassroom: jest.fn(),
    updateClassroom: jest.fn(),
    deleteClassroom: jest.fn(),
  },
  student: {
    enrollStudent: jest.fn(),
    listStudents: jest.fn(),
    getStudent: jest.fn(),
    updateStudent: jest.fn(),
    withdrawnStudent: jest.fn(),
  },
  mwsRepo: {},
  mwsExec: {
    createBolt: jest.fn(() => ({
      run: jest.fn(),
    }))
  },
  userServer: {
    run: jest.fn(),
  },
  userApi: {
    mw: jest.fn(),
  }
};

// Mock the managers loader
jest.mock('../loaders/ManagersLoader.js', () => {
  return jest.fn().mockImplementation(() => ({
    load: jest.fn(() => mockManagers)
  }));
});

// Mock the config module to prevent actual database connections
jest.mock('../config/index.config.js', () => ({
  dotEnv: {
    MONGO_URI: 'mongodb://localhost:27017/test_db', // This is mocked anyway
    CACHE_REDIS: null,
    CORTEX_REDIS: null,
    OYSTER_REDIS: null,
    LONG_TOKEN_SECRET: 'test-secret',
    SHORT_TOKEN_SECRET: 'test-secret',
    NACL_SECRET: 'test-secret',
  }
}));

// Mock mongoose to prevent actual database connections
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: {
    dropDatabase: jest.fn(),
    close: jest.fn(),
    collection: jest.fn(() => ({
      deleteMany: jest.fn(),
    })),
  },
  model: jest.fn(),
  Schema: jest.fn(),
  Types: {
    ObjectId: jest.fn((id) => id || 'mock-object-id'),
  }
}));

let managers;

beforeAll(async () => {
  // Load mocked managers
  const ManagersLoader = require('../loaders/ManagersLoader.js');
  const managersLoader = new ManagersLoader({ 
    config: require('../config/index.config.js'), 
    cache: mockManagers.cache, 
    cortex: mockManagers.cortex 
  });
  managers = managersLoader.load();
});

afterAll(async () => {
  // Clean up
  if (global.gc) {
    global.gc();
  }
});

// Export managers for use in tests
module.exports = { managers, mockManagers };