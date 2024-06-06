import express from 'express';
import cors from 'cors';
import webhook from '../routes/webhook';
import config from '../config';

const expressLoader = async (app) => {
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Load API routes
    app.use('/webhook', webhook);

    // Show status
    app.get('/', (req, res) => {
        res.send(`${config.APP_NAME} v${config.VERSION} is up`);
    });

    // Store port in Express settings
    app.set('port', process.env.PORT || 5000);

    app.listen(app.get('port'), () => {
        console.log(`v${config.VERSION} running on port ${app.get('port')}`);
    });
    
}