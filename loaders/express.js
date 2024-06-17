const express = require('express');
const cors = require('cors');
const admin = require('../routes/admin_route');
const webhook = require('../routes/webhook_route');
const config = require('../config');

const expressLoader = async (app) => {
    // Middleware that transforms the raw string of req.body into json
    app.use(
        express.json({
            verify(req, res, buf) {
                req.rawBody = buf;
            },
        })
    );
    app.use(express.urlencoded({ extended: false }));

    // Enable Cross Origin Resource Sharing to all origins by default
    app.use(cors());

    // Load API routes
    app.use('/admin', admin);
    app.use('/webhook', webhook);

    // Show status
    app.get('/', (req, res) => {
        res.send(`${config.APP_NAME} v${config.VERSION} is up`);
    });

    // Store port in Express settings
    app.set('port', config.PORT || 5000);

    app.listen(app.get('port'), () => {
        console.log(`v${config.VERSION} running on port ${app.get('port')}`);
    });
    
}

module.exports = expressLoader;