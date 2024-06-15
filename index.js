const express = require('express');

// Load variables from .env
const dotenv = require('dotenv');
dotenv.config();

const config = require('./config');
const dbLoader = require('./loaders/db');
const cronjobLoader = require('./loaders/cronjob');
const expressLoader = require('./loaders/express');
const fb = require('./utils/facebook');


const startServer = async () => {
    // Load database
    await dbLoader(config.MONGO_URI);

    // Load cronjob
    await cronjobLoader();

    // Load express
    const app = express();
    await expressLoader(app);

    // Set messenger profile
    await fb.setMessengerProfile();

    // Set persona
    await fb.setPersona();

    // Notify developer
    if (config.DEV_ID !== '') {
        await fb.sendTextMessage('', config.DEV_ID, `${config.APP_NAME} v${config.VERSION} is up`, false);
    }
}

startServer();

// module.exports = startServer;