const config                = require('./config/index.config.js');
const Cortex                = require('ion-cortex');
const ManagersLoader        = require('./loaders/ManagersLoader.js');
const Aeon                  = require('aeon-machine');
const mongoConnect          = require('./connect/mongo.js');

process.on('uncaughtException', err => {
    console.log(`Uncaught Exception:`)
    console.log(err, err.stack);

    process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled rejection at ', promise, `reason:`, reason);
    process.exit(1)
})

const cache      = require('./cache/cache.dbh')({
    prefix: config.dotEnv.CACHE_PREFIX ,
    url: config.dotEnv.CACHE_REDIS
});

const Oyster  = require('oyster-db');
const oyster     = new Oyster({ 
    url: config.dotEnv.OYSTER_REDIS, 
	prefix: config.dotEnv.OYSTER_PREFIX 
});

const cortex     = new Cortex({
    prefix: config.dotEnv.CORTEX_PREFIX,
    url: config.dotEnv.CORTEX_REDIS,
    type: config.dotEnv.CORTEX_TYPE,
    state: ()=>{
        return {} 
    },
    activeDelay: "50",
    idlDelay: "200",
});
const aeon = new Aeon({ cortex , timestampFrom: Date.now(), segmantDuration: 500 });

// Initialize MongoDB connection
if (config.dotEnv.MONGO_URI) {
    mongoConnect({ uri: config.dotEnv.MONGO_URI });
} else {
    console.log('⚠️  MONGO_URI not found in environment variables. MongoDB features will be disabled.');
}

const managersLoader = new ManagersLoader({config, cache, cortex, oyster, aeon});
const managers = managersLoader.load();

managers.userServer.run();
