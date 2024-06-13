const express = require('express');

// Load variables from .env
const dotenv = require('dotenv');
dotenv.config();

const expressLoader = require('./loaders/express');
const fb = require('./utils/facebook');


const startServer = async () => {
    // Load express
    const app = express();
    await expressLoader(app);

    // Set messenger profile
    await fb.setMessengerProfile();

    // Set persona
    await fb.setPersona();
}

startServer();