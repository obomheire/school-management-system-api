/**
 * School Scope Middleware
 * Enforces school-level access control based on user role
 * - Superadmins can access any school (must provide schoolId in request)
 * - School Admins can only access their assigned school
 */

const CONSTANTS = require('../managers/_common/constants');

module.exports = ({ meta, config, managers }) => {
    return async ({ req, res, next, results }) => {
        // Requires __role middleware to run first
        const roleData = results.__role;

        if (!roleData) {
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 401,
                errors: 'Authentication required'
            });
        }

        let schoolId = null;

        if (roleData.role === CONSTANTS.ROLES.SUPERADMIN) {
            // Superadmin can access any school
            // Check if schoolId is provided in params, query, or body
            schoolId = req.params.schoolId || req.query.schoolId || req.body.schoolId;

            if (!schoolId) {
                return managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: 400,
                    errors: 'schoolId is required'
                });
            }

            // Validate schoolId format (MongoDB ObjectId)
            if (!schoolId.match(/^[0-9a-fA-F]{24}$/)) {
                return managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: 400,
                    errors: 'Invalid schoolId format'
                });
            }

        } else if (roleData.role === CONSTANTS.ROLES.SCHOOL_ADMIN) {
            // School admin can only access their assigned school
            schoolId = roleData.assignedSchool;

            if (!schoolId) {
                return managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: 403,
                    errors: 'No school assigned to this administrator'
                });
            }

            // Verify they're not trying to access a different school
            const requestedSchoolId = req.params.schoolId || req.query.schoolId || req.body.schoolId;

            if (requestedSchoolId && requestedSchoolId !== schoolId) {
                return managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: 403,
                    errors: 'Access denied. You can only access your assigned school.'
                });
            }
        } else {
            // Unknown role
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 403,
                errors: 'Invalid user role'
            });
        }

        // Pass school scope data to next middleware/controller
        next({
            schoolId: schoolId,
            role: roleData.role,
            userId: roleData.userId
        });
    };
};
