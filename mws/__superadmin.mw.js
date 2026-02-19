const User = require('../managers/entities/user/user.mongoModel');
const CONSTANTS = require('../managers/_common/constants');
const extractToken = require('./_common/extractToken');

module.exports = ({ managers }) => {
    return async ({ req, res, next, results }) => {
        const token = extractToken(req.headers);
        if (!token) {
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 401,
                errors: 'Authentication required',
            });
        }

        const decoded = managers.token.verifyShortToken({ token });
        if (!decoded || !decoded.userId) {
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 401,
                errors: 'Invalid or expired token',
            });
        }

        const actor = await User.findById(decoded.userId).select('role status').lean();
        if (!actor || actor.status !== CONSTANTS.USER_STATUS.ACTIVE || actor.role !== CONSTANTS.ROLES.SUPERADMIN) {
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 403,
                errors: 'Access denied. Superadmin role required',
            });
        }

        next({
            userId: decoded.userId,
            role: actor.role,
        });
    };
};
