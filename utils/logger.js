/**
 * Logging module
 * @packageDocumentation
 */

const config = require('../config');
const phin = require('phin');
const lang = require('../lang');
const graphApiUrl = require('./helpers').graphApiUrl;

/**
 * Log error
 * @param source - Source
 * @param message - Message
 * @param err - Error details. Will be converted to a JSON string
 * @param sendToDev - Should notify developer
 */
const logError = (source, message, err = null, sendToDev = false) => {
    console.error(`[ERROR - ${source}] ${message}. Details: ${JSON.stringify(err)}`, err);

    // truncate message if too long
    message = `[ERROR - ${source}] ${message}`;
    if (message.length > config.MAX_MESSAGE_LENGTH) {
        message = message.substr(0, config.MAX_MESSAGE_LENGTH) + '...';
    }

    // send message to dev
    if (sendToDev) {
        sendLoggerMessage(config.DEV_ID, {"text": message});
    }
};


/**
 * Send logger message to Dev
 * @param receiver - ID of receiver
 * @param messageData - Message data
 */
const sendLoggerMessage = async (receiver, messageData) => {
    const payload = {
        recipient: { id: receiver },
        message: messageData,
        messaging_type: 'MESSAGE_TAG',
        tag: 'ACCOUNT_UPDATE',
    };


    try {
    const res = await phin({
        url: graphApiUrl(`/me/messages?access_token=${config.PAGE_ACCESS_TOKEN}`),
        method: 'POST',
        parse: 'json',
        data: payload,
    });

    const body = res.body;

    if (body.error && body.error.code) {
        logError(
            'facebook::sendMessage',
            `bot to ${receiver} failed`,
            body,
        );

    }
    } catch (err) {
        // FIX-ME: sendMessage should retry on timeout. Currently it just logs error and returns.
        // Timeout happens very rarely, though.
        logError('facebook::sendMessage', 'Failed to send request to Facebook', err, true);
    }
};


module.exports = { logError };