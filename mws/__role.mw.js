/**
 * Role-Based Authorization Middleware
 * Fetches user from MongoDB and verifies their role and status
 * Can optionally enforce a required role via meta parameter
 */

const User = require('../managers/entities/user/user.mongoModel');

module.exports = ({ meta, config, managers }) => {
    return async ({ req, res, next, results }) => {
        // Requires __auth or __token middleware to run first
        const tokenData = results.__auth || results.__token;

        if (!tokenData || !tokenData.userId) {
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 401,
                errors: 'Authentication required'
            });
        }

        try {
            // Fetch user from MongoDB
            const user = await User.findById(tokenData.userId)
                .select('role assignedSchool status email username')
                .lean();

            if (!user) {
                return managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: 404,
                    errors: 'User not found'
                });
            }

            // Check if user account is active
            if (user.status !== 'active') {
                return managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: 403,
                    errors: 'User account is inactive or suspended'
                });
            }

            // Check if a specific role is required (from meta parameter)
            if (meta && meta.requiredRole) {
                if (user.role !== meta.requiredRole) {
                    return managers.responseDispatcher.dispatch(res, {
                        ok: false,
                        code: 403,
                        errors: `Access denied. Requires ${meta.requiredRole} role`
                    });
                }
            }

            // Pass user role data to next middleware/controller
            next({
                userId: user._id.toString(),
                role: user.role,
                assignedSchool: user.assignedSchool ? user.assignedSchool.toString() : null,
                email: user.email,
                username: user.username
            });

        } catch (error) {
            console.error('Role middleware error:', error);
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 500,
                errors: 'Failed to verify user role'
            });
        }
    };
};
