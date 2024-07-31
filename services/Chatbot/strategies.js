const lang = require('../../lang');
const { StartCommand, EndCommand, HelpCommand, CatCommand, DogCommand, ClubCommand, GenderCommand, LLMCommand, GreetingCommand, CommonChatCommand } = require('./commands');


class Strategy {
    async handle(event) {}
}


class NotInRoomStrategy extends Strategy {
    async handle(event) {
        const command = getCommand(event);

        if (command instanceof EndCommand) {
            await new LLMCommand().execute(event);
            return;
        } else if (command instanceof CommonChatCommand) {
            await new LLMCommand().execute(event);
            return;
        }
        command.execute(event);
    }
}

class InWaitRoomStrategy extends Strategy {
    async handle(event) {
        const command = getCommand(event);
        if (command instanceof StartCommand || command instanceof GenderCommand) {
            await new LLMCommand().execute(event);
            return;
        }
        else if (command instanceof CommonChatCommand) {
            await new LLMCommand().execute(event);
            return;
        }

        command.execute(event, isWaitRoom = true);
    }
}

class InChatRoomStrategy extends Strategy {
    async handle(event) {
        const command = getCommand(event);
        if (command instanceof StartCommand || command instanceof GenderCommand) {
            await new CommonChatCommand().execute(event);
            return;
        }

        command.execute(event, isInChatRoom = true);
    }
}



const getCommand = (event) => {
    let text = '';
    if (event.message.quick_reply && event.message.quick_reply.payload) {
        text = event.message.quick_reply.payload;
    } else if (event.message.text) {
        text = event.message.text;
    }

    text = text.toLowerCase();
    if (text === 'ʬ') {
        return new GreetingCommand();
    } else if (text === lang.KEYWORD_START) {
        return new StartCommand();
    } else if (text === lang.KEYWORD_END) {
        return new EndCommand();
    } else if (text === lang.KEYWORD_HELP) {
        return new HelpCommand();
    } else if (text === lang.KEYWORD_CAT) {
        return new CatCommand();
    } else if (text === lang.KEYWORD_DOG) {
        return new DogCommand();
    } else if (text === lang.KEYWORD_CLUB) {
        return new ClubCommand();
    } else if (text.startsWith(lang.KEYWORD_GENDER)) {
        return new GenderCommand();
    }
    else {
        return new CommonChatCommand();
    }

}



module.exports = { NotInRoomStrategy, InWaitRoomStrategy, InChatRoomStrategy };
