jest.mock('../../managers/entities/school/school.mongoModel', () => ({}));
jest.mock('../../managers/entities/user/user.mongoModel', () => ({}));
jest.mock('../../managers/entities/classroom/classroom.mongoModel', () => ({}));
jest.mock('../../managers/entities/student/student.mongoModel', () => ({}));

const SchoolManager = require('../../managers/entities/school/School.manager');

describe('SchoolManager RBAC', () => {
  const manager = new SchoolManager({
    config: {},
    managers: {},
    validators: {},
    cache: {
      key: {
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
      },
    },
  });

  const schoolAdminRole = { role: 'school_admin', assignedSchool: '507f1f77bcf86cd799439011' };

  it('blocks school_admin from listing schools', async () => {
    const result = await manager.listSchools({
      __role: schoolAdminRole,
      __query: { page: 1, limit: 20 },
    });

    expect(result.errors).toEqual(['Access denied. Superadmin role required']);
  });

  it('blocks school_admin from getting school', async () => {
    const result = await manager.getSchool({
      __role: schoolAdminRole,
      __query: { schoolId: '507f1f77bcf86cd799439012' },
    });

    expect(result.errors).toEqual(['Access denied. Superadmin role required']);
  });
});
