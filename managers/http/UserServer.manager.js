const http              = require('http');
const express           = require('express');
const cors              = require('cors');
const helmet            = require('helmet');
const createClient      = require('../../cache/redis-client').createClient;
const getRateLimiters   = require('../../mws/__rateLimiter.mw');
const app               = express();

module.exports = class UserServer {
    constructor({config, managers}){
        this.config        = config;
        this.userApi       = managers.userApi;
        this.redisClient   = null;
    }
    
    /** for injecting middlewares */
    use(args){
        app.use(args);
    }

    /** server configs */
    run(){
        app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", 'data:', 'https:'],
                },
            },
            crossOriginEmbedderPolicy: false,
            crossOriginResourcePolicy: { policy: 'cross-origin' },
        }));

        const corsOrigin = this.config.dotEnv.CORS_ORIGIN || '*';
        const normalizedOrigin = corsOrigin.includes(',')
            ? corsOrigin.split(',').map((origin) => origin.trim()).filter(Boolean)
            : corsOrigin;

        app.use(cors({
            origin: normalizedOrigin,
            credentials: normalizedOrigin !== '*',
        }));

        try {
            this.redisClient = createClient({
                prefix: this.config.dotEnv.CACHE_PREFIX,
                url: this.config.dotEnv.CACHE_REDIS,
            });
        } catch (error) {
            console.error('Rate limiter Redis initialization failed. Falling back to memory store.', error.message);
        }

        const { authLimiter, generalLimiter } = getRateLimiters({
            redisClient: this.redisClient,
            dotEnv: this.config.dotEnv,
        });

        app.use('/api/auth/', authLimiter);
        app.use('/api/token/', authLimiter);
        app.use('/api/', generalLimiter);

        app.use(express.json());
        app.use(express.urlencoded({ extended: true}));
        app.use('/static', express.static('public'));

        /** an error handler */
        app.use((err, req, res, next) => {
            console.error(err.stack)
            res.status(500).send('Something broke!')
        });
        
        /** a single middleware to handle all */
        app.all('/api/:moduleName/:fnName', this.userApi.mw);

        let server = http.createServer(app);
        server.listen(this.config.dotEnv.USER_PORT, () => {
            console.log(`${(this.config.dotEnv.SERVICE_NAME).toUpperCase()} is running on port: ${this.config.dotEnv.USER_PORT}`);
        });
    }
}
