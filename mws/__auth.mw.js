/**
 * Authentication Middleware
 * Verifies JWT token from request headers and extracts user information
 */

module.exports = ({ meta, config, managers }) => {
    return ({ req, res, next }) => {
        // Check if token is present in headers
        if (!req.headers.token) {
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 401,
                errors: 'Authentication required. Please provide a token in the request headers.'
            });
        }

        let decoded = null;
        try {
            // Verify the short token using the existing token manager
            decoded = managers.token.verifyShortToken({ token: req.headers.token });

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
