const { NotInRoomStrategy, InWaitRoomStrategy, InChatRoomStrategy } = require('./strategies');
const db = require('../../database');
const fb = require('../../utils/facebook');
const lang = require('../../lang');


const processEvent = async (event) => {
    
    if (event.read || event.delivery || !event.hasOwnProperty('message') || event.message.is_echo === true) {
        return;
    }

    const sender = event.sender.id;
    const sender2 = await db.findPartnerChatRoom(sender);
    const waitState = await db.isInWaitRoom(sender);

    let strategy;

    if (!waitState && sender2 === null) {
        strategy = new NotInRoomStrategy();
    } else if (waitState && sender2 === null) {
        strategy = new InWaitRoomStrategy();
    } else if (!waitState && sender2 !== null) {
        strategy = new InChatRoomStrategy();
    } else {
        await db.removeFromWaitRoom(sender);
        await db.removeFromChatRoom(sender);
        await fb.sendTextMessage('', sender, lang.ERR_UNKNOWN, false);
        return;
    }

    await strategy.handle(event);
};

module.exports = { processEvent };
