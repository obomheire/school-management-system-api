/**
 * Authentication Middleware
 * Verifies JWT token from request headers and extracts user information
 */
const extractToken = require('./_common/extractToken');

module.exports = ({ meta, config, managers }) => {
    return ({ req, res, next }) => {
        const token = extractToken(req.headers);
        if (!token) {
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 401,
                errors: 'Authentication required. Please provide a valid token.'
            });
        }

        let decoded = null;
        try {
            // Verify the short token using the existing token manager
            decoded = managers.token.verifyShortToken({ token });

            if (!decoded || !decoded.userId) {
                return managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: 401,
                    errors: 'Invalid or expired token'
                });
            }
        } catch (err) {
            console.error('Token verification error:', err.message);
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 401,
                errors: 'Token verification failed'
            });
        }

        // Pass decoded token data to the next middleware/controller
        next(decoded);
    };
};
