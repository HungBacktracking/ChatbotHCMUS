/**
 * Logging module
 * @packageDocumentation
 */

const config = require('../config');
// const fb = require('../utils/facebook');
const phin = require('phin');

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
        // fb.sendTextMessage('', config.DEV_ID, message, false);
    }
};

module.exports = { logError };