const express = require('express');

// Load variables from .env
const dotenv = require('dotenv');
dotenv.config();

const expressLoader = require('./loaders/express');


const startServer = async () => {
    const app = express();
    await expressLoader(app);
}

startServer();