/**
 * Wrapper for Facebook Graph API
 * @packageDocumentation
 */

const graphApiUrl = require('../utils/helpers').graphApiUrl;
const config = require('../config');
const lang = require('../lang');
const logger = require('./logger');
const phin = require('phin');

let personaID = '';

const persistent_menu = [
    {
        locale: 'default',
        composer_input_disabled: false,
        call_to_actions: [
            {
                title: 'meow',
                type: 'postback',
                payload: lang.KEYWORD_CAT,
            },
            {
                title: 'gauw',
                type: 'postback',
                payload: lang.KEYWORD_DOG,
            },
            {
                title: 'tìm nam',
                type: 'postback',
                payload: lang.KEYWORD_GENDER + lang.KEYWORD_GENDER_MALE,
            },
            {
                title: 'tìm nữ',
                type: 'postback',
                payload: lang.KEYWORD_GENDER + lang.KEYWORD_GENDER_FEMALE,
            },
            {
                title: 'xem câu lạc bộ',
                type: 'postback',
                payload: lang.KEYWORD_CLUB,
            },
            {
                title: 'kết thúc',
                type: 'postback',
                payload: lang.KEYWORD_END,
            },
            {
                title: 'trợ giúp',
                type: 'postback',
                payload: lang.KEYWORD_HELP,
            },
            {
                title: 'gửi phản hồi',
                type: 'web_url',
                url: config.REPORT_LINK,
            },
        ],
    },
];

const quick_buttons_generic = [
    {
        content_type: 'text',
        title: 'meow',
        payload: lang.KEYWORD_CAT,
    },
    {
        content_type: 'text',
        title: 'gauw',
        payload: lang.KEYWORD_DOG,
    },
    {
        content_type: 'text',
        title: 'trợ giúp',
        payload: lang.KEYWORD_HELP,
    },
    {
        content_type: 'text',
        title: 'xem câu lạc bộ',
        payload: lang.KEYWORD_CLUB,
    },
];

const quick_buttons_genders = [
    {
        content_type: 'text',
        title: 'tìm nam',
        payload: lang.KEYWORD_GENDER + lang.KEYWORD_GENDER_MALE,
    },
    {
        content_type: 'text',
        title: 'tìm nữ',
        payload: lang.KEYWORD_GENDER + lang.KEYWORD_GENDER_FEMALE,
    },
];

const setPersona = async () => {
    // Check if persona is already set up
    let setUp = false;

    try {
        const res = await phin({
            url: graphApiUrl(`/me/personas?access_token=${config.PAGE_ACCESS_TOKEN}`),
            method: 'get',
            parse: 'json',
        });

        const body = res.body;

        if (!Array.isArray(body.data)) {
            logger.logError('facebook::setPersona', 'Failed to get personas', body, true);
        } else {
			for (let i = 0; i < body.data.length; i++) {
				if (body.data[i].name === 'Bạn chat') {
					setUp = true;
					personaID = body.data[i].id;
					break;
				}
			}
        }
    } catch (err) {
        logger.logError('facebook::setPersona::getPersonas', 'Failed to send request to Facebook', err, true);
    }

    if (setUp) {
        console.log('setPersona succeed. Use existing persona ID.');
        return;
    }

    const payload = {
        name: 'Bạn chat',
        profile_picture_url: config.PERSONA_PROFILE_PICTURE,
    };

    try {
        const res = await phin({
            url: graphApiUrl(`/me/personas?access_token=${config.PAGE_ACCESS_TOKEN}`),
            method: 'POST',
            parse: 'json',
            data: payload,
        });

        const body = res.body;

        if (typeof body.id !== 'string') {
            logger.logError('facebook::setPersona', 'Failed to get persona ID', null, true);
            return;
        }

        personaID = body.id;
        console.log('setPersona succeed. Set up new persona.');
    } catch (err) {
        logger.logError('facebook::setPersona', 'Failed to send request to Facebook', err, true);
    }
};

/**
 * Set messenger profile
 */
const setMessengerProfile = async () => {
	const payload = {
		get_started: {
		payload: 'ʬ',
		},
		persistent_menu,
	};

	try {
		const res = await phin({
			url: graphApiUrl(`/me/messenger_profile?access_token=${config.PAGE_ACCESS_TOKEN}`),
			method: 'POST',
			parse: 'json',
			data: payload,
		});

		const body = res.body;

		if (body.result === 'success') {
			console.log('setMessengerProfile succeed');
		} else {
			logger.logError('facebook::setMessengerProfile', 'Failed to set messenger profile', body, true);
		}
	} catch (err) {
		logger.logError('facebook::setMessengerProfile', 'Failed to send request to Facebook', err, true);
	}
};

/**
 * Send message to user
 * @param receiver - ID of receiver
 * @param messageData - Message data
 * @param usePersona - Should send with persona
 * @param origSender - ID of original sender (see code for better understanding)
 */
const sendMessage = async (receiver, messageData, usePersona, origSender = '') => {
    if (messageData.text || messageData.attachment) {
        if (messageData.text && messageData.text.length > config.MAX_MESSAGE_LENGTH) {
            if (origSender !== '') {
                await sendMessage(origSender, { text: lang.ERR_TOO_LONG }, false);
            }
            return;
        }

        const payload = {
            recipient: { id: receiver },
            message: messageData,
            messaging_type: 'MESSAGE_TAG',
            tag: 'ACCOUNT_UPDATE',
        };

        if (usePersona && personaID !== '') {
            payload.persona_id = personaID;
        }

        try {
        const res = await phin({
            url: graphApiUrl(`/me/messages?access_token=${config.PAGE_ACCESS_TOKEN}`),
            method: 'POST',
            parse: 'json',
            data: payload,
        });

        const body = res.body;

        if (body.error && body.error.code) {
            logger.logError(
                'facebook::sendMessage',
                `${origSender === '' ? 'bot' : origSender} to ${receiver} failed`,
                body,
            );

            const errorCode = body.error.code;
            if (errorCode === 5) {
                // do something
                
            } else if (origSender !== '') {
                if (errorCode === 200 || errorCode === 551) {
                    await sendMessage(origSender, { text: lang.ERR_200 }, false);
                } else if (errorCode === 10) {
                    await sendMessage(origSender, { text: lang.ERR_10 }, false);
                }
            }
        }
        } catch (err) {
            // FIX-ME: sendMessage should retry on timeout. Currently it just logs error and returns.
            // Timeout happens very rarely, though.
            logger.logError('facebook::sendMessage', 'Failed to send request to Facebook', err, true);
        }
    } else {
        logger.logError('facebook::sendMessage', 'Got invalid messageData. Skipped!!!', messageData, true);
    }
};

/**
 * Send attachment
 * @param sender - ID of sender (`''` if sent by bot)
 * @param receiver - ID of receiver
 * @param type - Type of attachment (`image`, `video`, `audio`, `file`)
 * @param url - URL of attachment
 * @param showGenericButton - Should show generic button
 * @param showGenderButton - Should show gender button
 * @param usePersona - Should send with persona
 */
const sendAttachment = async (
    sender,
    receiver,
    type,
    payload,
    showGenericButton,
    showGenderButton,
    usePersona
) => {
    let quick_replies = [];
    if (showGenericButton) {
        quick_replies = quick_replies.concat(quick_buttons_generic);
    }
    if (showGenderButton) {
        quick_replies = quick_replies.concat(quick_buttons_genders);
    }

    const message = {
        attachment: {
            type,
            payload: payload,
        },
    };
    console.log('sendAttachment', message);

    if (showGenericButton || showGenderButton) {
        message.quick_replies = quick_replies;
    }

    await sendMessage(receiver, message, usePersona, sender);
};

/**
 * Send text message
 * @param sender - ID of sender (`''` if sent by bot)
 * @param receiver - ID of receiver
 * @param text - Text to send
 * @param usePersona - Should send with persona
 */
const sendTextMessage = async (sender, receiver, text, usePersona) => {
    await sendMessage(receiver, { text }, usePersona, sender);
};

/**
 * Send text message with buttons
 * @param receiver - ID of receiver
 * @param text - Text to send
 * @param showStartButton - Should show start button
 * @param showReportButton - Should show report button
 * @param showGenericButton - Should show generic button
 * @param showGenderButton - Should show gender button
 * @param usePersona - Should send with persona
 */
const sendTextButtons = async (receiver,
    text,
    showStartButton,
    showReportButton,
    showGenericButton,
    showGenderButton,
    usePersona,
) => {
	const buttons = [];

	if (showStartButton) {
		buttons.push({ type: 'postback', title: 'Bắt đầu chat', payload: lang.KEYWORD_START });
	}

	if (showReportButton) {
		buttons.push({ type: 'web_url', title: 'Gửi phản hồi', url: config.REPORT_LINK });
	}

	let quick_replies = [];
	if (showGenericButton) {
		quick_replies = quick_replies.concat(quick_buttons_generic);
	}
	if (showGenderButton) {
		quick_replies = quick_replies.concat(quick_buttons_genders);
	}

	const messageData = {};

	if (showGenericButton || showGenderButton) {
		messageData.quick_replies = quick_replies;
	}

	if (showStartButton || showReportButton) {
		messageData.attachment = {
		type: 'template',
		payload: {
			template_type: 'button',
			text,
			buttons,
		},
		};
	} else {
		messageData.text = text;
	}

	await sendMessage(receiver, messageData, usePersona);
};

/**
 * Send seed indicator
 * @param receiver - ID of receiver
 */
const sendSeenIndicator = async (receiver) => {
	const payload = {
		recipient: { id: receiver },
		sender_action: 'mark_seen',
		messaging_type: 'MESSAGE_TAG',
		tag: 'ACCOUNT_UPDATE',
	};

	try {
		await phin({
			url: graphApiUrl(`/me/messages?access_token=${config.PAGE_ACCESS_TOKEN}`),
			method: 'POST',
			parse: 'json',
			data: payload,
		});
	} catch (err) {
		logger.logError('facebook::sendSeenIndicator', 'Failed to send request to Facebook', err, true);
	}
};

/**
 * Get user information from Facebook
 * @param id - ID of user
 */
const getUserData = async (id) => {
	try {
		const res = await phin({
			url: graphApiUrl(`/${id}?access_token=${config.PAGE_ACCESS_TOKEN}&fields=name,first_name,last_name,profile_pic,gender`),
			method: 'GET',
			parse: 'json',
		});

		return res.body;
	} catch (err) {
		logger.logError('facebook::getUserData', 'Failed to send request to Facebook', err, true);
		return { error: { message: 'Failed to send request to Facebook' } };
	}
};

module.exports = {
	setPersona,
	setMessengerProfile,
	sendAttachment,
	sendTextMessage,
	sendTextButtons,
	sendSeenIndicator,
	getUserData,
};
