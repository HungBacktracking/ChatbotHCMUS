/**
 * Database loader
 * @packageDocumentation
 */

const mongoose = require('mongoose');
const db = require('../database');
const logger = require('../utils/logger');
const { sleep } = require('../utils/helpers');


const _connect = async (mongoURI, shouldNotifyDev) => {
    let ret = false;
    try {
        await mongoose.connect(mongoURI);
        console.log('[loader::_connect] Connected with MongoDB');

        const tmp = await db.initCache();
        if (!tmp) {
            throw Error('Failed to initialize cache');
        }
        console.log('[loader::_connect] Initialized cache');

        ret = true;
    } catch (err) {
        logger.logError('loader::_connect', 'Failed to load database', err, shouldNotifyDev);
    }
    return ret;
};


/**
 * Connect Mongoose with MongoDB server and initialize cache
 * @param mongoURI - URI to MongoDB server
 */
const dbLoader = async (mongoURI) => {
    // Try until success
    let shouldNotifyDev = true;
    while (true) {
        const attempt = await _connect(mongoURI, shouldNotifyDev);
        if (attempt) {
            break;
        }

        // Only notify dev for the first time to avoid sending too many messages
        // and get blocked
        shouldNotifyDev = false;

        // Retry in 5 seconds
        await sleep(5000);
    }
};

module.exports = dbLoader;
