/**
 * Cronjob loader
 * @packageDocumentation
 */

const config = require('../config');
const ChatbotUtils = require('../utils/ChatbotUtils');


/**
 * Run cronjob every minute.
 * Remove timeout users from wait room.
 */
const cronjobLoader = async () => {
    if (config.MAX_WAIT_TIME_MINUTES > 0) {
        setInterval(ChatbotUtils.removeTimeoutUser, 60000);
    }
};

module.exports = cronjobLoader;
