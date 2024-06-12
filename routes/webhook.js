const { Router } = require('express');
const verifyXHub = require('../middleware/xhub');
const config = require('../config');

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
        for (var message of messaging) {
            var senderId = message.sender.id;
            if (message.message) {
                if (message.message.text) {
                    var text = message.message.text;
                    console.log(`Received message from ${senderId}: ${text}`);
                }
            }
        }
    }
});

const sendTextMessage = async (senderId, text) => {

}

module.exports = router;