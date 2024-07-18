const db = require('../database');
const config = require('../config');
const lang = require('../lang');
const fb = require('./facebook');
const GenderEnum = require('../models/GenderEnum');


/**
 * Parse string to get gender
 * @param genderString - String to parse
 * @returns Parsed gender
 */
const parseGender = (genderString) => {
    let res;
    if (genderString === lang.KEYWORD_GENDER + lang.KEYWORD_GENDER_MALE) {
        res = GenderEnum.MALE;
    } else if (genderString === lang.KEYWORD_GENDER + lang.KEYWORD_GENDER_FEMALE) {
        res = GenderEnum.FEMALE;
    } else if (genderString === lang.KEYWORD_GENDER + lang.KEYWORD_GENDER_BOTH) {
        res = GenderEnum.UNKNOWN;
    } else {
        res = null;
    }
    return res;
};
  

/**
 * Get gender of user from database if available.
 * Otherwise, get it from Facebook.
 * @param id - ID of user
 * @returns Gender of user
 */
const getGender = async (id) => {
    let user = await db.getUser(id);
    let gender = user ? user.gender : null;
    if (gender) {
        return gender;
    }

    // not found in database, fetch from facebook
    const data = await fb.getUserData(id);
    if (data.error || !data.gender) {
        gender = GenderEnum.UNKNOWN;
    } else if (data.gender === 'male') {
        gender = GenderEnum.MALE;
    } else if (data.gender === 'female') {
        gender = GenderEnum.FEMALE;
    }

    await db.setUserGender(id, gender);
    return gender;
};


/**
 * Connect two users and add them to chat room
 * @param id1 - ID of first user
 * @param id2 - ID of second user
 * @param gender1 - Gender of first user
 * @param gender2 - Gender of second user
 */
const pairPeople = async (id1, id2, gender1, gender2) => {
    await db.removeFromWaitRoom(id1);
    await db.removeFromWaitRoom(id2);
    await db.writeToChatRoom(id1, id2, gender1, gender2);
    await db.updateLastPerson(id1, id2);
    await db.updateLastPerson(id2, id1);
    await fb.sendTextMessage('', id1, lang.CONNECTED, false);
    await fb.sendTextMessage('', id2, lang.CONNECTED, false);
    // await logger.logPair(id1, id2);
};


/**
 * Find a user in wait room to match with new user.
 * If found, pair them. Otherwise, add new user to wait room.
 * @param id - ID of new user
 * @param myGender - Gender of new user
 */
const findPair = async (id, myGender, myTargetGender) => {
    const waitRoomList = await db.getListWaitRoom();

    for (const entry of waitRoomList) {
        const user = entry.id;
        const userGender = entry.gender;
        const userTargetGender = entry.targetGender;

        // check if they have just been paired
        if ((await db.checkLastPerson(id, user)) || (await db.checkLastPerson(user, id))) {
            continue;
        }

        // pair if genders match
        // or there are too many people in wait room
        // or gender of one of them is unknown (with probability 0.2)

        const isPreferredGender =
            (myTargetGender === GenderEnum.UNKNOWN && userTargetGender === GenderEnum.UNKNOWN) ||
            (myGender === GenderEnum.MALE && myTargetGender === GenderEnum.MALE && userGender === GenderEnum.MALE && userTargetGender === GenderEnum.MALE) ||
            (myGender === GenderEnum.FEMALE && myTargetGender === GenderEnum.FEMALE && userGender === GenderEnum.FEMALE && userTargetGender === GenderEnum.FEMALE) ||
            (myGender === GenderEnum.MALE && myTargetGender === GenderEnum.FEMALE && userGender === GenderEnum.FEMALE && userTargetGender === GenderEnum.MALE) ||
            (myGender === GenderEnum.FEMALE && myTargetGender === GenderEnum.MALE && userGender === GenderEnum.MALE && userTargetGender === GenderEnum.FEMALE);


        if (
            isPreferredGender ||
            waitRoomList.length > config.MAX_PEOPLE_IN_WAITROOM ||
            ((myGender === GenderEnum.UNKNOWN || userGender === GenderEnum.UNKNOWN) && Math.random() > 0.8)
        ) {
            await pairPeople(id, user, myGender, userGender);
            return;
        }
    }

    // found no match, put in wait room
    await db.writeToWaitRoom(id, myGender, myTargetGender);

    if (myTargetGender === GenderEnum.UNKNOWN) {
        await fb.sendTextMessage('', id, lang.START_WARN_GENDER, false);
    }
    await fb.sendTextMessage('', id, lang.START_OKAY, false);
};


/**
 * Disconnect paired users
 * @param id1 - ID of first user
 * @param id2 - ID of second user
 */
const processEndChat = async (id1, id2) => {
    await db.removeFromChatRoom(id1); // or await db.removeFromChatRoom(id2);
    await fb.sendTextButtons(id1, lang.END_CHAT, true, true, true, true, false);
    await fb.sendTextButtons(id2, lang.END_CHAT_PARTNER, true, true, true, true, false);
};


/**
 * Forward message from sender to receiver
 * @param sender - ID of sender
 * @param receiver - ID of receiver
 * @param data - Message data to forward
 */
const forwardMessage = async (sender, receiver, data) => {
    if (data.attachments) {
        if (data.attachments[0]) {
            const type = data.attachments[0].type;
            if (type === 'fallback') {
                let text;
                if (data.text) {
                    text = data.text;
                } else {
                    text = lang.ATTACHMENT_LINK + data.attachments[0].payload.url;
                }
                await fb.sendTextMessage(sender, receiver, text, true);
            } else if (type === 'image' || type === 'video' || type === 'audio' || type === 'file') {
                await fb.sendAttachment(sender, receiver, type, data.attachments[0].payload.url, false, false, true);
            } else {
                await fb.sendTextMessage('', sender, lang.ERR_ATTACHMENT, false);
                return;
            }
        }

        for (let i = 1; i < data.attachments.length; i++) {
            const type = data.attachments[i].type;
            if (type === 'image' || type === 'video' || type === 'audio' || type === 'file') {
                await fb.sendAttachment(sender, receiver, type, data.attachments[i].payload.url, false, false, true);
            }
        }
    } else {
      await fb.sendTextMessage(sender, receiver, data.text, true);
    }
};



/**
 * Remove timeout users in wait room every minute.
 * Timeout is specified in config.
 */
const removeTimeoutUser = async () => {
    const waitRoomList = await db.getListWaitRoom();
  
    const now = new Date();
    waitRoomList.forEach(async (entry) => {
        if (now.getTime() - entry.time.getTime() > config.MAX_WAIT_TIME_MINUTES * 60000) {
            await db.removeFromWaitRoom(entry.id);
            await fb.sendTextButtons(entry.id, lang.END_CHAT_FORCE, true, false, true, true, false);
        }
    });
};

module.exports = {
    removeTimeoutUser,
    forwardMessage,
    processEndChat,
    findPair,
    pairPeople,
    getGender,
    parseGender
};