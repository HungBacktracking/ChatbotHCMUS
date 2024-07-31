const lang = require('../../lang');
const db = require('../../database');
const fb = require('../../utils/facebook');
const chatbotUtils = require('../../utils/ChatbotUtils');

const { StartCommand, HelpCommand, CatCommand, DogCommand, ClubCommand, ChatCommand } = require('./commands');



class Strategy {
    async handle(event) {}
}


class NotInRoomStrategy extends Strategy {
    async handle(event) {
        const command = event.message.text.toLowerCase();
        switch (command) {
        case lang.KEYWORD_START:
            await new StartCommand().execute(event);
            break;
        case lang.KEYWORD_HELP:
            await new HelpCommand().execute(event);
            break;
        case lang.KEYWORD_CAT:
            await new CatCommand().execute(event);
            break;
        case lang.KEYWORD_DOG:
            await new DogCommand().execute(event);
            break;
        case lang.KEYWORD_CLUB:
            await new ClubCommand().execute(event);
            break;
        default:
            await new ChatCommand().execute(event);
        }
    }
}

class InWaitRoomStrategy extends Strategy {
    async handle(event) {
        const sender = event.sender.id;
        const command = event.message.text.toLowerCase();
        switch (command) {
        case lang.KEYWORD_END:
            await db.removeFromWaitRoom(sender);
            await fb.sendTextButtons(sender, lang.END_CHAT, true, false, true, true, false);
            break;
        case lang.KEYWORD_HELP:
            await new HelpCommand().execute(event);
            break;
        case lang.KEYWORD_CAT:
            await new CatCommand().execute(event);
            break;
        case lang.KEYWORD_DOG:
            await new DogCommand().execute(event);
            break;
        case lang.KEYWORD_CLUB:
            await new ClubCommand().execute(event);
            break;
        default:
            await new ChatCommand().execute(event);
        }
    }
}

class InChatRoomStrategy extends Strategy {
    async handle(event) {
        const sender = event.sender.id;
        const sender2 = await db.findPartnerChatRoom(sender);
        const command = event.message.text.toLowerCase();

        switch (command) {
        case lang.KEYWORD_END:
            await chatbotUtils.processEndChat(sender, sender2);
            break;
        case lang.KEYWORD_HELP:
            await new HelpCommand().execute(event);
            break;
        case lang.KEYWORD_CAT:
            await chatbotUtils.forwardMessage(sender, sender2, event.message);
            await new CatCommand().execute(event);
            break;
        case lang.KEYWORD_DOG:
            await chatbotUtils.forwardMessage(sender, sender2, event.message);
            await new DogCommand().execute(event);
            break;
        case lang.KEYWORD_CLUB:
            await chatbotUtils.forwardMessage(sender, sender2, event.message);
            await new ClubCommand().execute(event);
            break;
        default:
            await chatbotUtils.forwardMessage(sender, sender2, event.message);
        }
    }
}

module.exports = { NotInRoomStrategy, InWaitRoomStrategy, InChatRoomStrategy };
