/**
 * RBAC Helper Functions
 * Provides utility functions for Role-Based Access Control
 */

const CONSTANTS = require('./constants');

module.exports = {
    /**
     * Check if a user has a specific role
     * @param {String} userRole - User's current role
     * @param {String} requiredRole - Required role for the operation
     * @returns {Boolean}
     */
    hasRole(userRole, requiredRole) {
        return userRole === requiredRole;
    },

    /**
     * Check if user is a superadmin
     * @param {String} role - User's role
     * @returns {Boolean}
     */
    isSuperadmin(role) {
        return role === CONSTANTS.ROLES.SUPERADMIN;
    },

    /**
     * Check if user is a school admin
     * @param {String} role - User's role
     * @returns {Boolean}
     */
    isSchoolAdmin(role) {
        return role === CONSTANTS.ROLES.SCHOOL_ADMIN;
    },

    /**
     * Check if user can access a specific school
     * @param {String} role - User's role
     * @param {String} assignedSchoolId - User's assigned school ID (for school admins)
     * @param {String} targetSchoolId - School ID being accessed
     * @returns {Boolean}
     */
    canAccessSchool(role, assignedSchoolId, targetSchoolId) {
        // Superadmin can access any school
        if (this.isSuperadmin(role)) {
            return true;
        }

        // School admin can only access their assigned school
        if (this.isSchoolAdmin(role)) {
            return assignedSchoolId && assignedSchoolId.toString() === targetSchoolId.toString();
        }

        return false;
    },

    /**
     * Get the school ID scope for a user based on their role
     * @param {String} role - User's role
     * @param {String} assignedSchoolId - User's assigned school ID (for school admins)
     * @param {String} requestedSchoolId - School ID from the request
     * @returns {String|null} - School ID to use for the operation
     */
    getSchoolScope(role, assignedSchoolId, requestedSchoolId) {
        if (this.isSuperadmin(role)) {
            // Superadmin uses the requested school ID
            return requestedSchoolId;
        }

        if (this.isSchoolAdmin(role)) {
            // School admin always uses their assigned school ID
            return assignedSchoolId;
        }

        return null;
    },

    /**
     * Validate that a role is one of the allowed roles
     * @param {String} role - Role to validate
     * @returns {Boolean}
     */
    isValidRole(role) {
        const validRoles = Object.values(CONSTANTS.ROLES);
        return validRoles.includes(role);
    },

    /**
     * Check if school assignment is required for a role
     * @param {String} role - User's role
     * @returns {Boolean}
     */
    requiresSchoolAssignment(role) {
        return role === CONSTANTS.ROLES.SCHOOL_ADMIN;
    }
};
