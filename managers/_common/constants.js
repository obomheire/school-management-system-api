/**
 * System Constants for School Management System
 * Defines roles, statuses, and other enumerated values used throughout the application
 */

module.exports = {
    // User Roles
    ROLES: {
        SUPERADMIN: 'superadmin',
        SCHOOL_ADMIN: 'school_admin'
    },

    // User Status
    USER_STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        SUSPENDED: 'suspended'
    },

    // School Status
    SCHOOL_STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive'
    },

    // Classroom Status
    CLASSROOM_STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive'
    },

    // Student Status
    STUDENT_STATUS: {
        ACTIVE: 'active',
        TRANSFERRED: 'transferred',
        GRADUATED: 'graduated',
        WITHDRAWN: 'withdrawn'
    },

    // Pagination Defaults
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 100
    },

    // Token Configuration
    TOKEN: {
        LONG_TOKEN_EXPIRY: '3y',
        SHORT_TOKEN_EXPIRY: '1y'
    },

    // Classroom Configuration
    CLASSROOM: {
        MIN_CAPACITY: 1,
        MAX_CAPACITY: 100
    },

    // Password Configuration
    PASSWORD: {
        MIN_LENGTH: 8,
        BCRYPT_ROUNDS: 10
    }
};
