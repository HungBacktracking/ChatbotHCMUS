const config = require('../config');
const lang = require('../lang');
const fb = require('../utils/facebook');
const db = require('../database');
const gifts = require('../utils/gifts');
const chatbotUtils = require('../utils/ChatbotUtils');
const GenderEnum = require('../database/models/GenderEnum');
const LLM = require('../services/llm_service');
const club = require('../utils/club');

/**
 * Process messaging event sent by Facebook
 * @param event - Messaging event
 */
const processEvent = async (event) => {
    if (event.read) {
        event.message = { text: '' };
    }
  
    if (event.postback && event.postback.payload) {
        event.message = { text: event.postback.payload };
    }
  
    if (!event.hasOwnProperty('message') || event.delivery) {
        return;
    }
  
    if (event.message.is_echo === true) {
        return;
    }
  
    const sender = event.sender.id;
  
    if (config.MAINTENANCE) {
        await fb.sendTextMessage('', sender, lang.MAINTENANCE, false);
        return;
    }
  
    let text = '';
    if (event.message.quick_reply && event.message.quick_reply.payload) {
        text = event.message.quick_reply.payload;
    } else if (event.message.text) {
        text = event.message.text;
    }
  
    let command = text.toLowerCase();
    if (command === 'ʬ') {
        await fb.sendTextButtons(sender, lang.FIRST_COME, true, false, true, true, false);
        return;
    }

  
    // fetch person state
    const waitState = await db.isInWaitRoom(sender);
    const sender2 = await db.findPartnerChatRoom(sender);
    
    if (!waitState && sender2 === null) {
        // neither in chat room nor wait room
        if (command === lang.KEYWORD_START) {
            const gender = await chatbotUtils.getGender(sender);
            await chatbotUtils.findPair(sender, gender, 'UNKNOWN');
        } else if (command.startsWith(lang.KEYWORD_GENDER)) {
            const gender = await chatbotUtils.getGender(sender);
            const targetGender = chatbotUtils.parseGender(command);
            if (targetGender === null) {
                await fb.sendTextButtons(sender, lang.GENDER_ERR, false, false, true, true, false);
            } else {
                let genderString = '';
                if (targetGender === GenderEnum.MALE) {
                    genderString = lang.GENDER_ARR_MALE;
                } else if (targetGender === GenderEnum.FEMALE) {
                    genderString = lang.GENDER_ARR_FEMALE;
                }
        
                if (targetGender !== GenderEnum.UNKNOWN) {
                    await fb.sendTextMessage('', sender, lang.GENDER_WRITE_OK + genderString + lang.GENDER_WRITE_WARN, false);
                }
        
                await chatbotUtils.findPair(sender, gender, targetGender);
            }
        } else if (command === lang.KEYWORD_HELP) {
            await fb.sendTextButtons(sender, lang.HELP_TXT, true, false, true, true, false);
        } else if (command === lang.KEYWORD_CAT) {
            await gifts.sendCatPic(sender, null);
        } else if (command === lang.KEYWORD_DOG) {
            await gifts.sendDogPic(sender, null);
        } else if (command === lang.KEYWORD_CLUB) {
            await club.suggestClub(sender);
        } else if (!event.read) {
            await LLM.generateResponse(sender, command);
        }
    } else if (waitState && sender2 === null) {
        // in wait room and waiting
        if (command === lang.KEYWORD_END) {
            await db.removeFromWaitRoom(sender);
            await fb.sendTextButtons(sender, lang.END_CHAT, true, false, true, true, false);
        } else if (command === lang.KEYWORD_HELP) {
            await fb.sendTextButtons(sender, lang.HELP_TXT, false, false, true, false, false);
        } else if (command === lang.KEYWORD_CAT) {
            await gifts.sendCatPic(sender, null);
        } else if (command === lang.KEYWORD_DOG) {
            await gifts.sendDogPic(sender, null);
        } else if (command === lang.KEYWORD_CLUB) {
            await club.suggestClub(sender);
        } else if (!event.read) {
            await LLM.generateResponse(sender, command);
        }
    } else if (!waitState && sender2 !== null) {
        // in chat room
        if (command === lang.KEYWORD_END) {
            await chatbotUtils.processEndChat(sender, sender2);
        } else if (command === lang.KEYWORD_START) {
            await fb.sendTextMessage('', sender, lang.START_ERR_ALREADY, false);
        } else if (command === lang.KEYWORD_HELP) {
            await fb.sendTextButtons(sender, lang.HELP_TXT, false, true, true, false, false);
        } else if (command === lang.KEYWORD_CAT) {
            await chatbotUtils.forwardMessage(sender, sender2, event.message);
            await gifts.sendCatPic(sender, sender2);
        } else if (command === lang.KEYWORD_DOG) {
            await chatbotUtils.forwardMessage(sender, sender2, event.message);
            await gifts.sendDogPic(sender, sender2);
        } else if (command === lang.KEYWORD_CLUB) {
            await chatbotUtils.forwardMessage(sender, sender2, event.message);
            await club.suggestClub(sender);
            await club.suggestClub(sender2);
        } else {
            // FIX-ME: Only send seen indicator for messages before watermark
            if (event.read) {
                await fb.sendSeenIndicator(sender2);
            } else if (text.trim().toLowerCase().startsWith('[bot]')) {
                await fb.sendTextMessage('', sender, lang.ERR_FAKE_MSG, false);
            } else {
                await chatbotUtils.forwardMessage(sender, sender2, event.message);
            }
        }
    } else {
        await db.removeFromWaitRoom(sender);
        await db.removeFromChatRoom(sender);
        await fb.sendTextMessage('', sender, lang.ERR_UNKNOWN, false);
    }
};


module.exports = { processEvent };
  