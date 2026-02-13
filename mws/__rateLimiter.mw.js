const rateLimit = require('express-rate-limit');
const RedisStoreImport = require('rate-limit-redis');

const RedisStore = RedisStoreImport.RedisStore || RedisStoreImport;

const toNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getRedisStore = ({ redisClient, prefix }) => {
    if (!redisClient) return undefined;
    return new RedisStore({
        prefix,
        sendCommand: (...args) => redisClient.call(...args),
    });
};

module.exports = ({ redisClient, dotEnv = {} }) => {
    const windowMs = toNumber(dotEnv.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
    const generalMax = toNumber(dotEnv.RATE_LIMIT_MAX_REQUESTS, 100);
    const authMax = toNumber(dotEnv.RATE_LIMIT_AUTH_MAX_REQUESTS, 20);

    const commonOptions = {
        windowMs,
        standardHeaders: true,
        legacyHeaders: true,
    };

    const generalLimiter = rateLimit({
        ...commonOptions,
        store: getRedisStore({ redisClient, prefix: 'rl:general:' }),
        max: generalMax,
        message: {
            ok: false,
            code: 429,
            errors: 'Too many requests, please try again later.',
        },
    });

    const authLimiter = rateLimit({
        ...commonOptions,
        store: getRedisStore({ redisClient, prefix: 'rl:auth:' }),
        max: authMax,
        skipSuccessfulRequests: true,
        message: {
            ok: false,
            code: 429,
            errors: 'Too many authentication attempts, please try again later.',
        },
    });

    return {
        generalLimiter,
        authLimiter,
    };
};
