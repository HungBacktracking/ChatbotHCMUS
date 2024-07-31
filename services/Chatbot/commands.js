const fb = require('../../utils/facebook');
const lang = require('../../lang');
const db = require('../../database');
const chatbotUtils = require('../../utils/ChatbotUtils');
const gifts = require('../../utils/gifts');
const club = require('../../utils/club');
const LLM = require('../../services/llm_service');


class Command {
    execute(event) {}
}


class StartCommand extends Command {
    async execute(event) {
        const sender = event.sender.id;
        const gender = await chatbotUtils.getGender(sender);
        await chatbotUtils.findPair(sender, gender, 'UNKNOWN');
    }
}

class HelpCommand extends Command {
    async execute(event) {
        const sender = event.sender.id;
        await fb.sendTextButtons(sender, lang.HELP_TXT, true, false, true, true, false);
    }
}

class CatCommand extends Command {
    async execute(event) {
        const sender = event.sender.id;
        await gifts.sendCatPic(sender, null);
    }
}

class DogCommand extends Command {
    async execute(event) {
        const sender = event.sender.id;
        await gifts.sendDogPic(sender, null);
    }
}

class ClubCommand extends Command {
    async execute(event) {
        const sender = event.sender.id;
        await club.suggestClub(sender);
    }
}

class ChatCommand extends Command {
    async execute(event) {
        const sender = event.sender.id;
        const text = event.message.text.toLowerCase();
        await LLM.generateResponse(sender, text);
    }
}

module.exports = { StartCommand, HelpCommand, CatCommand, DogCommand, ClubCommand, ChatCommand };
