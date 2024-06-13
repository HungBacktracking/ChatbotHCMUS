const config = require('../config');
const lang = require('../lang');
const fb = require('../utils/facebook');



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
  
    let command = '';
    if (text.length < 20) {
        command = text.toLowerCase().replace(/ /g, '');
    }
  
    if (command === 'ʬ') {
        await fb.sendTextButtons(sender, lang.FIRST_COME, true, false, true, true, false);
        return;
    }
};

module.exports = { processEvent };
  