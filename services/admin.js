/**
 * Everything related to admin page is done here.
 * @packageDocumentation
 */

const pidusage = require('pidusage');

const db = require('../database');
const lang = require('../lang');
const fb = require('../utils/facebook');

/**
 * Send broadcast message to all users
 * @param content - Content of message
 */
const sentBroadcast = async (content) => {
    const userList = await db.getListUser();
    userList.forEach(async (entry) => {
        await fb.sendTextButtons(entry.id, content, false, false, true, false, false);
    });
    return { success: true, error: false };
}


/**
 * Return a list of current users in chat room
 */
const readChatRoom = async () => {
    const chatRoomList = await db.getListChatRoom();
    return { success: true, error: false, chatRoom: chatRoomList };
};

/**
 * Return a list of current users in wait room
 */
const readWaitRoom = async () => {
    const waitRoomList = await db.getListWaitRoom();
    return { success: true, error: false, waitRoom: waitRoomList };
};

/**
 * Create backup
 */
const createBackup = async () => {
    const chatRoomList = await db.getListChatRoom();
    const waitRoomList = await db.getListWaitRoom();
    const userList = await db.getListUser();
    const lastPersonList = await db.getListLastPerson();
    const promptList = await db.getAllPrompts();

    return {
        success: true,
        error: false,
        chatRoom: chatRoomList,
        waitRoom: waitRoomList,
        user: userList,
        lastPerson: lastPersonList,
        prompt: promptList,
    };
};

/**
 * Restore database from backup
 * @param data - Backup data
 */
const restoreBackup = async (data) => {
    if (!Array.isArray(data.chatRoom)) {
        return { success: false, error: true, errorType: 'Invalid chat room data' };
    }

    if (!Array.isArray(data.waitRoom)) {
        return { success: false, error: true, errorType: 'Invalid wait room data' };
    }

    if (!Array.isArray(data.user)) {
        return { success: false, error: true, errorType: 'Invalid user data' };
    }

    if (!Array.isArray(data.lastPerson)) {
        return { success: false, error: true, errorType: 'Invalid last person data' };
    }

    if (!Array.isArray(data.prompt)) {
        return { success: false, error: true, errorType: 'Invalid prompt data' };
    }

    await db.resetDatabase();

    data.chatRoom.forEach(async (entry) => {
        await db.writeToChatRoom(entry.id1, entry.id2, entry.gender1, entry.gender2, entry.time);
    });

    data.waitRoom.forEach(async (entry) => {
        await db.writeToWaitRoom(entry.id, entry.gender, entry.targetGender, entry.time);
    });

    data.user.forEach(async (entry) => {
        await db.setUser(entry.id, entry.gender, entry.chatHistory);
    });

    data.lastPerson.forEach(async (entry) => {
        await db.updateLastPerson(entry.id1, entry.id2);
    });

    data.prompt.forEach(async (entry) => {
        await db.setPrompt(entry.mode, entry.content);
    });

    return { success: true, error: false };
};

/**
 * Return stats of server
 */
const readStats = async () => {
    const stat = await pidusage(process.pid);

    let sec = Math.floor(process.uptime());

    const d = Math.floor(sec / (24 * 60 * 60));
    sec -= d * (24 * 60 * 60);

    const h = Math.floor(sec / (60 * 60));
    sec -= h * (60 * 60);

    const m = Math.floor(sec / 60);
    sec -= m * 60;

    return {
        success: true,
        error: false,
        cpu: `${stat.cpu.toFixed(1)}%`,
        mem: `${(stat.memory / 1024 / 1024).toFixed(1)}MB`,
        uptime: `${0 < d ? d + ' day ' : ''}${h}h ${m}m ${sec}s`,
    };
};

/**
 * Forcefully connect two users (only if neither of them is in chat room)
 * @param id1 - ID of first user
 * @param id2 - ID of second user
 * @param gender1 - Gender of first user
 * @param gender2 - Gender of second user
 */
const forceMatch = async (id1, id2, gender1, gender2) => {
    await db.removeFromWaitRoom(id1);
    await db.removeFromWaitRoom(id2);

    const partner1 = await db.findPartnerChatRoom(id1);
    const partner2 = await db.findPartnerChatRoom(id2);
    if (partner1 === null && partner2 === null) {
        await db.writeToChatRoom(id1, id2, gender1, gender2);
    }

    return { success: true, error: false };
};

/**
 * Remove user from wait room and chat room.
 * If that user is connected with another one, remove that one too.
 * @param id - ID of user
 */
const forceRemove = async (id) => {
    const partner = await db.findPartnerChatRoom(id);
    if (partner) {
        await fb.sendTextButtons(id, lang.END_CHAT_PARTNER, true, true, true, true, false);
        await fb.sendTextButtons(partner, lang.END_CHAT_PARTNER, true, true, true, true, false);
    } else {
        await fb.sendTextButtons(id, lang.END_CHAT_FORCE, true, false, true, true, false);
    }
    await db.removeFromChatRoom(id);
    await db.removeFromWaitRoom(id);

    return { success: true, error: false };
};

const getUserData = async (id) => {
    const ret = await fb.getUserData(id);
    if (ret.error) {
        return { success: false, error: true };
    } else {
        return { success: true, error: false, userProfile: ret };
    }
};

/**
 * Delete everything in database
 */
const resetDatabase = async () => {
    await db.resetDatabase();
    return { success: true, error: false };
};

module.exports = {
    sentBroadcast,
    readChatRoom,
    readWaitRoom,
    createBackup,
    restoreBackup,
    readStats,
    forceMatch,
    forceRemove,
    getUserData,
    resetDatabase,
};
