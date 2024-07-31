const { NotInRoomStrategy, InWaitRoomStrategy, InChatRoomStrategy } = require('./strategies');
const db = require('../../database');
const fb = require('../../utils/facebook');
const config = require('../../config');
const lang = require('../../lang');


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
