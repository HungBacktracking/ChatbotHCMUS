/**
 * Parse configuration from environment (`.env` is supported).
 * Fallback to default value if not available.
 */

/**
 * Parse string from environment variable
 * @param key - Environment key
 */
const parseEnvString = (key) => {
    return process.env[key];
};

/**
 * Parse number from environment variable
 * @param key - Environment key
 */
const parseEnvNumber = (key) => {
    if (process.env[key]) {
        return Number(process.env[key]);
    } else {
        return undefined;
    }
};

/**
 * Parse boolean from environment variable
 * @param key - Environment key
 */
const parseEnvBoolean = (key) => {
    if (process.env[key]) {
        return String(process.env[key]).toLowerCase() === 'true';
    } else {
        return undefined;
    }
};

const config = {
    // Maintenance mode
    MAINTENANCE: parseEnvBoolean('MAINTENANCE') || false,

    // Port
    PORT: parseEnvNumber('PORT') || 5000,

    // Graph API
    GRAPH_API: parseEnvString('GRAPH_API') || 'https://graph.facebook.com/v7.0',

    // App secret
    APP_SECRET: parseEnvString('APP_SECRET') || '',

    // Page access token
    PAGE_ACCESS_TOKEN: parseEnvString('PAGE_ACCESS_TOKEN') || '',

    // Page verify token
    PAGE_VERIFY_TOKEN: parseEnvString('PAGE_VERIFY_TOKEN') || '',

    // Maximum length of text message
    MAX_MESSAGE_LENGTH: parseEnvNumber('MAX_MESSAGE_LENGTH') || 2000,

    // App name (must be the same on Heroku)
    APP_NAME: parseEnvString('APP_NAME') || 'ChatbotHCMUS',

    // App display name
    APP_DISPLAY_NAME: parseEnvString('APP_DISPLAY_NAME') || 'HCMUS Explorer',

    // Page persona profile picture
    PERSONA_PROFILE_PICTURE:
        parseEnvString('PERSONA_PROFILE_PICTURE') || '',

    // Heroku API key
    HEROKU_API_KEY: parseEnvString('HEROKU_API_KEY') || '',

    // URI to MongoDB server
    MONGO_URI: parseEnvString('MONGO_URI') || '',

    // Gemini API key
    GEMINI_API: parseEnvString('GEMINI_API') || '',

    // Logging stuffs
    HAS_POST_LOG: parseEnvBoolean('HAS_POST_LOG') || false,
    POST_LOG_ID: parseEnvString('POST_LOG_ID') || '',
    POST_LOG_P1: parseEnvString('POST_LOG_P1') || '',
    POST_LOG_P2: parseEnvString('POST_LOG_P2') || '',
    POST_LOG_NAME1: parseEnvString('POST_LOG_NAME1') || '',
    POST_LOG_NAME2: parseEnvString('POST_LOG_NAME2') || '',

    // Link to Google Form for reporting
    REPORT_LINK: parseEnvString('REPORT_LINK') || 'https://example.com',

    // Maximum number of people in wait room
    MAX_PEOPLE_IN_WAITROOM: parseEnvNumber('MAX_PEOPLE_IN_WAITROOM') || 20,

    // Maximum amount of time in wait room
    // 0 for unlimited
    MAX_WAIT_TIME_MINUTES: parseEnvNumber('MAX_WAIT_TIME_MINUTES') || 0,

    // Password to log into admin page
    ADMIN_PASSWORD: parseEnvString('ADMIN_PASSWORD') || '',

    // Maximum amount of time of a session
    // 0 for unlimited
    MAX_SESSION_MINUTES: parseEnvNumber('MAX_SESSION_MINUTES') || 30,

    // ID of developer's Facebook account
    DEV_ID: parseEnvString('DEV_ID') || '',

    // ACCESS_TOKEN: parseEnvString('ACCESS_TOKEN') || '',

    // Project version.
    VERSION: '1.0.0',
};

module.exports = config;
