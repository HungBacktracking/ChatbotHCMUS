const fb = require('../../utils/facebook');
const lang = require('../../lang');
const db = require('../../database');
const chatbotUtils = require('../../utils/ChatbotUtils');
const gifts = require('../../utils/gifts');
const club = require('../../utils/club');
const LLM = require('../../services/llm_service');



class Command {
    execute(event, isInWaitRoom = false, isInChatRoom = false) {}
}



class GreetingCommand extends Command {
    async execute(event, isInWaitRoom, isInChatRoom) {
        const sender = event.sender.id;
        await fb.sendTextButtons(sender, lang.FIRST_COME, true, false, true, true, false);
    }
}

class StartCommand extends Command {
    async execute(event, isInWaitRoom, isInChatRoom) {
        const sender = event.sender.id;
        const gender = await chatbotUtils.getGender(sender);
        await chatbotUtils.findPair(sender, gender, 'UNKNOWN');
    }
}

class EndCommand extends Command {
    async execute(event, isInWaitRoom, isInChatRoom) {
        const sender = event.sender.id;
        if (isInWaitRoom) {
            await db.removeFromWaitRoom(sender);
            await fb.sendTextButtons(sender, lang.END_CHAT, true, false, true, true, false);
        } else if (isInChatRoom) {
            const sender2 = await db.findPartnerChatRoom(sender);
            await chatbotUtils.processEndChat(sender, sender2);
        }
    }
}

class HelpCommand extends Command {
    async execute(event, isInWaitRoom, isInChatRoom) {
        const sender = event.sender.id;

        if (isInWaitRoom) {
            await fb.sendTextButtons(sender, lang.HELP_TXT, false, false, true, false, false);
        } else if (isInChatRoom) {
            await fb.sendTextButtons(sender, lang.HELP_TXT, false, true, true, false, false);
        } else {
            await fb.sendTextButtons(sender, lang.HELP_TXT, true, false, true, true, false);
        }
    }
}

class CatCommand extends Command {
    async execute(event, isInWaitRoom, isInChatRoom) {
        const sender = event.sender.id;

        if (isInChatRoom) {
            const sender2 = await db.findPartnerChatRoom(sender);
            await chatbotUtils.forwardMessage(sender, sender2, event.message);
            await gifts.sendCatPic(sender, sender2);
        } else {
            await gifts.sendCatPic(sender, null);
        }
    }
}

class DogCommand extends Command {
    async execute(event, isInWaitRoom, isInChatRoom) {
        const sender = event.sender.id;
        
        if (isInChatRoom) {
            const sender2 = await db.findPartnerChatRoom(sender);
            await chatbotUtils.forwardMessage(sender, sender2, event.message);
            await gifts.sendDogPic(sender, sender2);
        } else {
            await gifts.sendDogPic(sender, null);
        }
    }
}

class ClubCommand extends Command {
    async execute(event, isInWaitRoom, isInChatRoom) {
        const sender = event.sender.id;
        
        if (isInChatRoom) {
            const sender2 = await db.findPartnerChatRoom(sender);
            await chatbotUtils.forwardMessage(sender, sender2, event.message);
            await club.suggestClub(sender);
            await club.suggestClub(sender2);
        } else {
            await club.suggestClub(sender);
        }
    }
}

class LLMCommand extends Command {
    async execute(event, isInWaitRoom, isInChatRoom) {
        const sender = event.sender.id;
        const text = getText(event);
        await LLM.generateResponse(sender, text);
    }
}

class GenderCommand extends Command {
    async execute(event, isInWaitRoom, isInChatRoom) {
        const text = getText(event);
        const sender = event.sender.id;
        const gender = await chatbotUtils.getGender(sender);
        const targetGender = chatbotUtils.parseGender(text);

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
    }
}


class CommonChatCommand extends Command {
    async execute(event, isInWaitRoom, isInChatRoom) {
        const text = getText(event);
        const sender = event.sender.id;
        const sender2 = await db.findPartnerChatRoom(sender);
        if (event.read) {
            await fb.sendSeenIndicator(sender2);
        } else if (text.trim().toLowerCase().startsWith('[bot]')) {
            await fb.sendTextMessage('', sender, lang.ERR_FAKE_MSG, false);
        } else {
            await chatbotUtils.forwardMessage(sender, sender2, event.message);
        }
    }
}



const getText = (event) => {
    let text = '';
    if (event.message.quick_reply && event.message.quick_reply.payload) {
        text = event.message.quick_reply.payload;
    } else if (event.message.text) {
        text = event.message.text;
    }

    text = text.toLowerCase();
    return text;
}




module.exports = { StartCommand, EndCommand, HelpCommand, CatCommand, DogCommand, ClubCommand, LLMCommand, GenderCommand, GreetingCommand, CommonChatCommand };
