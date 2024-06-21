const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');
const logger = require('../utils/logger'); 

const genAI = new GoogleGenerativeAI(config.GEMINI_API);
const model = genAI.getGenerativeModel({ model: "gemini-pro"});


const generateResponse = async (command) => {
    try {
        const prompt = command;
        
        const result = await model.generateContent(prompt);
        const response = result.response;

        // Ensure the text is UTF-8 encoded
        const text = Buffer.from(response.text(), 'utf-8').toString();
        logger.logError('LLM::generateResponse', 'Content: ' + text);

        return text;

    } catch (error) {
        logger.logError('LLM::generateResponse', 'Failed to generate AI response ' + config.GEMINI_API, error, true);
        return "Sorry, I am not able to generate a response at the moment. Please try again later.";
    }
}

module.exports = {
    generateResponse
};
