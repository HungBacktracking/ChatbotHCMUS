const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const config = require('../config');
const logger = require('../utils/logger'); 
const fb = require('../utils/facebook');
const db = require('../database');

const genAI = new GoogleGenerativeAI(config.GEMINI_API);


const getChatHistory = async (user) => {
    let chatHistory = [];
    if (user && user.chatHistory) {
        chatHistory = user.chatHistory;
    }

    prompt = {
        role: "user",
        parts: [{ text: await db.getPrompt("normal") }]
    };
    chatHistory.splice(0, 0, prompt);
    return chatHistory;
}


/**
 * Generate a response from the AI model
 * @param {string} userId - The user ID
 * @param {string} message - The message to generate a response for
 */
const generateResponse = async (userId, message) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro"});
        const user = await db.getUser(userId);

        let chatHistory = await getChatHistory(user);
        const chat = model.startChat({ history: chatHistory });

        const result = await chat.sendMessage(message);
        const response = result.response.text();
        await fb.sendTextButtons(userId, response, false, false, true, true, false);

        newChat = [
            { role: "user", parts: [{ text: message }] },
            { role: "model", parts: [{ text: response }] }
        ];
        await db.setUser(userId, '', newChat);

        logger.logError('LLM::generateResponse', 'Content: ' + response);
        return response;

    } catch (error) {
        logger.logError('LLM::generateResponse', 'Failed to generate AI response ', error, true);
        const response = "Sorry, I am not able to generate a response at the moment. Please try again later.";
        await fb.sendTextButtons(userId, response, false, false, true, true, false);

        return response;
    }
}

module.exports = {
    generateResponse
};

