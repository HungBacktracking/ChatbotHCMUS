/**
 * Methods for interacting with the database.
 * Most of the operation is reading, so cache is used to increase performance.
 * @packageDocumentation
 */

const ChatRoom = require('../models/chatroom');
const WaitRoom = require('../models/waitroom');
const Gender = require('../models/gender');
const LastPerson = require('../models/lastperson');

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
            await cache.waitRoomWrite(item.id, item.gender, item.time);
        });

        const gd = await Gender.find();
        gd.forEach(async (item) => {
            await cache.genderWrite(item.id, item.gender);
        });

        const lp = await LastPerson.find();
        lp.forEach(async (item) => {
            await cache.lastPersonWrite(item.id1, item.id2);
        });

        return true;
    } catch (err) {
        logger.logError('db::initCache', 'Failed to initialize cache', err, true);
        return false;
    }
};


/**
 * Save gender to database
 * @param id - ID of user
 * @param gender - Gender of user
 */
const setGender = async (id, gender) => {
    await Promise.all([cache.genderWrite(id, gender), mongo.genderWrite(id, gender)]);
};


/**
 * Get gender of user from database.
 * Return `null` if not available.
 * @param id - ID of user
 */
const getGender = async (id) => {
    return await cache.genderFind(id);
};


/**
 * Return gender data
 */
const getListGender = async () => {
    return await cache.genderRead();
};


/**
 * Add user to wait room
 * @param id - ID of user
 * @param gender - Gender of user
 */
const writeToWaitRoom = async (id, gender, time = new Date()) => {
    await Promise.all([cache.waitRoomWrite(id, gender, time), mongo.waitRoomWrite(id, gender, time)]);
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

    // Gender stuffs
    setGender,
    getGender,
    getListGender,

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

