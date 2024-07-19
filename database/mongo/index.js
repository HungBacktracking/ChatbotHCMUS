/**
 * Methods for writing to MongoDB
 * @packageDocumentation
 */

const { Mutex } = require('async-mutex');
const ChatRoom = require('../../models/chatroom');
const WaitRoom = require('../../models/waitroom');
const User = require('../../models/user');
const LastPerson = require('../../models/lastperson');
const GenderEnum = require('../../models/GenderEnum');
const logger = require('../../utils/logger');



/**
 * `findOneAndUpdate` with `upsert` is not atomic.
 * We lock Mongo so that only one operation is allowed at a time.
 */
const mongoMutex = new Mutex();


/**
 * Save prompt to database
 * @param mode - Mode of prompt
 * @param content - Content of prompt
 */
const promptWrite = async (mode, content) => {
    const release = await mongoMutex.acquire();
    try {
        await Prompt.findOneAndUpdate({ mode }, { $set: { content } }, { upsert: true });
    } catch (err) {
        logger.logError('mongo::promptWrite', 'Failed to save data to MongoDB', err, true);
    } finally {
        release();
    }
};

/**
 * Remove prompt from database
 * @param mode - Mode of prompt
 */
const promptRemove = async (mode) => {
    const release = await mongoMutex.acquire();
    try {
        await Prompt.deleteOne({ mode });
    } catch (err) {
        logger.logError('mongo::promptRemove', 'Failed to save data to MongoDB', err, true);
    } finally {
        release();
    }
}


/**
 * Save user to database
 * @param id - ID of user
 * @param gender - Gender of user
 * @param chatHistory - Chat history of user
 */
const userWrite = async (id, gender = '', chatHistory = []) => {
    const release = await mongoMutex.acquire();
    try {
        const updateFields = {};

        if (gender !== '') {
            updateFields.gender = gender;
        }

        if (chatHistory.length > 0) {
            // Lấy user hiện tại từ database
            const user = await User.findOne({ id });

            if (user && user.chatHistory) {
                updateFields.chatHistory = user.chatHistory.concat(chatHistory);
            } else {
                updateFields.chatHistory = chatHistory;
            }

            while (updateFields.chatHistory.length > 6) {
                updateFields.chatHistory.splice(0, 2);
            }
        }

        await User.findOneAndUpdate({ id }, { $set: updateFields }, { upsert: true });
    } catch (err) {
        logger.logError('mongo::userWrite', 'Failed to save data to MongoDB', err, true);
    } finally {
        release();
    }
};



/**
 * Add user to wait room
 * @param id - ID of user
 * @param gender - Gender of user
 * @param target - Target gender of user
 */
const waitRoomWrite = async (id, gender, targetGender, time) => {
    const release = await mongoMutex.acquire();
    try {
        await WaitRoom.findOneAndUpdate({ id }, { $set: { gender, targetGender, time } }, { upsert: true });
    } catch (err) {
        logger.logError('mongo::waitRoomWrite', 'Failed to save data to MongoDB', err, true);
    } finally {
        release();
    }
};


/**
 * Remove user from wait room
 * @param id - ID of user
 */
const waitRoomRemove = async (id) => {
    const release = await mongoMutex.acquire();
    try {
        await WaitRoom.deleteOne({ id });
    } catch (err) {
        logger.logError('mongo::waitRoomRemove', 'Failed to save data to MongoDB', err, true);
    } finally {
        release();
    }
};


/**
 * Add paired users to chat room
 * @param id1 - ID of first user
 * @param id2 - ID of second user
 * @param gender1 - Gender of first user
 * @param gender2 - Gender of second user
 * @param time - Time when paired
 */
const chatRoomWrite = async (id1, id2, gender1, gender2, time) => {
    const release = await mongoMutex.acquire();
    try {
        await ChatRoom.findOneAndUpdate({ id1 }, { $set: { id2, gender1, gender2, time } }, { upsert: true });
    } catch (err) {
        logger.logError('mongo::chatRoomWrite', 'Failed to save data to MongoDB', err, true);
    } finally {
        release();
    }
};


/**
 * Remove paired users from chat room
 * @param id - ID of one of two user
 */
const chatRoomRemove = async (id) => {
    const release = await mongoMutex.acquire();
    try {
        await ChatRoom.deleteOne({ $or: [{ id1: id }, { id2: id }] });
    } catch (err) {
        logger.logError('mongo::chatRoomRemove', 'Failed to save data to MongoDB', err, true);
    } finally {
        release();
    }
};


/**
 * Set `user2` as the last person paired with `user1`
 * @param id1 - ID of `user1`
 * @param id2 - ID of `user2`
 */
const lastPersonWrite = async (id1, id2) => {
    const release = await mongoMutex.acquire();
    try {
        await LastPerson.findOneAndUpdate({ id1 }, { $set: { id2 } }, { upsert: true });
    } catch (err) {
        logger.logError('db::updateLastPerson', 'Failed to save data to MongoDB', err, true);
    } finally {
        release();
    }
};



/**
 * Delete everything in database
 */
const resetDatabase = async () => {
    const release = await mongoMutex.acquire();

    try {
        await ChatRoom.deleteMany({});
    } catch (err) {
        logger.logError('mongo::resetDatabase::chatRoom', 'Failed to save data to MongoDB', err, true);
    }

    try {
        await WaitRoom.deleteMany({});
    } catch (err) {
        logger.logError('mongo::resetDatabase::waitRoom', 'Failed to save data to MongoDB', err, true);
    }

    try {
        await User.deleteMany({});
    } catch (err) {
        logger.logError('mongo::resetDatabase::gender', 'Failed to save data to MongoDB', err, true);
    }

    try {
        await LastPerson.deleteMany({});
    } catch (err) {
        logger.logError('mongo::resetDatabase::lastPerson', 'Failed to save data to MongoDB', err, true);
    }

    release();
};

module.exports = {
    promptWrite,
    promptRemove,
    userWrite,
    waitRoomWrite,
    waitRoomRemove,
    chatRoomWrite,
    chatRoomRemove,
    lastPersonWrite,
    resetDatabase,
};
