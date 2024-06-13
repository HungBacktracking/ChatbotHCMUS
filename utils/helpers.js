/**
 * Some helper functions
 */

// Import the configuration
const config = require('../config');

/**
 * Sleep for `ms` milliseconds
 * @param {number} ms - How many milliseconds to sleep
 * @returns {Promise} A promise that resolves after the specified time
 */
const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Get Graph API URL
 * @param {string} path - API path
 * @returns {string} The complete URL to the Graph API
 */
const graphApiUrl = (path) => config.GRAPH_API + path;


module.exports = {
    sleep,
    graphApiUrl
};
