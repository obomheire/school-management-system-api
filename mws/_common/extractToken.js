const extractToken = (headers = {}) => {
    if (headers.token && typeof headers.token === 'string' && headers.token.trim()) {
        return headers.token.trim();
    }

    const authorization = headers.authorization;
    if (!authorization || typeof authorization !== 'string') {
        return null;
    }

    const [scheme, credentials] = authorization.split(' ');
    if (scheme && scheme.toLowerCase() === 'bearer' && credentials) {
        return credentials.trim();
    }

    return null;
};

module.exports = extractToken;
