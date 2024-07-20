/**
 * Methods for interacting with the database.
 * Most of the operation is reading, so cache is used to increase performance.
 * @packageDocumentation
 */

const ChatRoom = require('./models/chatroom');
const WaitRoom = require('./models/waitroom');
const User = require('./models/user');
const LastPerson = require('./models/lastperson');
const Prompt = require('./models/prompt');

const cache = require('./cache');
const mongo = require('./mongo');
const logger = require('../utils/logger');



/**
 * Fetch data from database to cache
 */
const initCache = async () => {
    try {
        await cache.clear();

        const cr = await ChatRoom.find();
        cr.forEach(async (item) => {
            await cache.chatRoomWrite(item.id1, item.id2, item.gender1, item.gender2, item.time);
        });

        const wr = await WaitRoom.find();
        wr.forEach(async (item) => {
            await cache.waitRoomWrite(item.id, item.gender, item.targetGender, item.time);
        });

        const gd = await User.find();
        gd.forEach(async (item) => {
            await cache.userWrite(item.id, item.gender, item.chatHistory);
        });

        const lp = await LastPerson.find();
        lp.forEach(async (item) => {
            await cache.lastPersonWrite(item.id1, item.id2);
        });

        const pr = await Prompt.find();
        pr.forEach(async (item) => {
            await cache.promptWrite(item.mode, item.content);
        });

        return true;
    } catch (err) {
        logger.logError('db::initCache', 'Failed to initialize cache', err, true);
        return false;
    }
};

/**
 * Save prompt to database
 * @param mode - Mode of prompt
 * @param content - Content of prompt
 */
const setPrompt = async (mode, content) => {
    await Promise.all([cache.promptWrite(mode, content), mongo.promptWrite(mode, content)]);
};

/**
 * Get prompt from database
 * @param mode - Mode of prompt
 */
const getPrompt = async (mode) => {
    return await cache.promptFind(mode);
};

/**
 * Get all prompts from database
 */
const getAllPrompts = async () => {
    return await cache.promptRead();
};

/**
 * Remove prompt from database
 * @param mode - Mode of prompt
 */
const removePrompt = async (mode) => {
    await Promise.all([cache.promptRemove(mode), mongo.promptRemove(mode)]);
};


/**
 * Save user to database
 * @param id - ID of user
 * @param gender - Gender of user
 * @param chatHistory - Chat history of user
 */
const setUser = async (id, gender, chatHistory) => {
    await Promise.all([cache.userWrite(id, gender, chatHistory), mongo.userWrite(id, gender, chatHistory)]);
};


/**
 * Get user from database.
 * Return `null` if not available.
 * @param id - ID of user
 */
const getUser = async (id) => {
    return await cache.userFind(id);
};


/**
 * Return user list data
 */
const getListUser = async () => {
    return await cache.userRead();
};


/**
 * Add user to wait room
 * @param id - ID of user
 * @param gender - Gender of user
 * @param target - Target gender of user
 */
const writeToWaitRoom = async (id, gender, targetGender, time = new Date()) => {
    await Promise.all([cache.waitRoomWrite(id, gender, targetGender, time), mongo.waitRoomWrite(id, gender, targetGender, time)]);
};


/**
 * Check if user is in wait room
 * @param id - ID of user
 */
const isInWaitRoom = async (id) => {
    return await cache.waitRoomFind(id);
};

/**
 * Remove user from wait room
 * @param id - ID of user
 */
const removeFromWaitRoom = async (id) => {
    await Promise.all([cache.waitRoomRemove(id), mongo.waitRoomRemove(id)]);
};


/**
 * Return a list of current users in wait room
 */
const getListWaitRoom = async () => {
    return await cache.waitRoomRead();
};


/**
 * Add paired users to chat room
 * @param id1 - ID of first user
 * @param id2 - ID of second user
 * @param gender1 - Gender of first user
 * @param gender2 - Gender of second user
 */
const writeToChatRoom = async (id1, id2, gender1, gender2, time = new Date()) => {
    await Promise.all([
        cache.chatRoomWrite(id1, id2, gender1, gender2, time),
        mongo.chatRoomWrite(id1, id2, gender1, gender2, time),
    ]);
};


/**
 * Return partner of user. If user is not in chat room, return `null`.
 * @param id - ID of user
 */
const findPartnerChatRoom = async (id) => {
    return await cache.chatRoomFind(id);
};


/**
 * Remove paired users from chat room
 * @param id - ID of one of two user
 */
const removeFromChatRoom = async (id) => {
    await Promise.all([cache.chatRoomRemove(id), mongo.chatRoomRemove(id)]);
};


/**
 * Return a list of current users in chat room
 */
const getListChatRoom = async () => {
    return await cache.chatRoomRead();
};


/**
 * Check if `user1` has just been paired with `user2`
 * @param id1 - ID of `user1`
 * @param id2 - ID of `user2`
 */
const checkLastPerson = async (id1, id2) => {
    return await cache.lastPersonCheck(id1, id2);
};


/**
 * Set `user2` as the last person paired with `user1`
 * @param id1 - ID of `user1`
 * @param id2 - ID of `user2`
 */
const updateLastPerson = async (id1, id2) => {
    await Promise.all([cache.lastPersonWrite(id1, id2), mongo.lastPersonWrite(id1, id2)]);
};


/**
 * Return last person data
 */
const getListLastPerson = async () => {
    return await cache.lastPersonRead();
};



/**
 * Delete everything in database
 */
const resetDatabase = async () => {
    await Promise.all([cache.clear(), mongo.resetDatabase()]);
};


module.exports = {
    // Cache stuffs
    initCache,

    // Prompt stuffs
    setPrompt,
    getPrompt,
    getAllPrompts,
    removePrompt,

    // User stuffs
    setUser,
    getUser,
    getListUser,

    // WaitRoom stuffs
    writeToWaitRoom,
    removeFromWaitRoom,
    isInWaitRoom,
    getListWaitRoom,

    // ChatRoom stuffs
    writeToChatRoom,
    removeFromChatRoom,
    findPartnerChatRoom,
    getListChatRoom,

    // LastPerson stuffs
    checkLastPerson,
    updateLastPerson,
    getListLastPerson,

    resetDatabase,
};

