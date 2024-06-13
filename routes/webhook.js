const { Router } = require('express');
const verifyXHub = require('../middleware/xhub');
const config = require('../config');
const Chatbot = require('../services/Chatbot');

const router = Router();

router.get('/', (req, res) => {
	// Parse the query params
	const mode = req.query['hub.mode'];
	const token = req.query['hub.verify_token'];
	const challenge = req.query['hub.challenge'];

	// Checks if a token and mode is in the query string of the request
	if (mode && token) {
		// Checks the mode and token sent is correct
		if (mode === 'subscribe' && token === config.PAGE_VERIFY_TOKEN) {
		// Responds with the challenge token from the request
		res.status(200).send(challenge);
		} else {
		// Responds with '403 Forbidden' if verify tokens do not match
		res.sendStatus(403);
		}
	}
});

router.post('/', verifyXHub, (req, res) => {
    res.sendStatus(200);

    var entries = req.body.entry;
    for (var entry of entries) {

        var messaging = entry.messaging;
        for (var event of messaging) {
            Chatbot.processEvent(event);
        }
    }
});

module.exports = router;