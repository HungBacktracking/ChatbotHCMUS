const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const config = require('../config');
const logger = require('../utils/logger'); 
import { introduction_HCMUS } from '../database/HCMUS';

const genAI = new GoogleGenerativeAI(config.GEMINI_API);
const model = genAI.getGenerativeModel({ model: "gemini-pro"});

// const SAFETY_SETTINGS = [
//     { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
//     { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
//     { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
//     { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
// ]; // Default safety settings

// const GENERATION_CONFIG = {
//     max_tokens: 4096,
//     temperature: 0.3, // control the randomness of the output
//     top_p: 1.0, // control the diversity of the output
//     frequency_penalty: 0.0, // control the diversity of the output
//     presence_penalty: 0.0, // control the repetitiveness of the output
//     best_of: 1, // generate multiple completions and return the best one
// };


// ref : https://github.com/devarshishimpi/google-gemini-nodejs-chatbot/blob/main/index.js 
// ref : https://reetesh.in/blog/integrating-google-gemini-to-node.js-application
// async function startConversation() {
//     try {
//         const chat = model.startChat({
//             generationConfig: GENERATION_CONFIG,
//             safetySettings: SAFETY_SETTINGS,
//             history: [
//                 { role: "user", content: "Bạn có biết về trường Đại học Khoa học Tự nhiên không?"},
//                 { role: "model", content: "Có phải ý bạn là trường Đại học Khoa học Tự nhiên - ĐHQG TPHCM không?"},
//                 { role: "user", content: "Đúng rồi, bạn có thể cho mình biết về trường này được không?"},
//                 { role: "model", content: $(introduction_HCMUS)}, 
//             ], 

//         });

//         while (true) {
//             const userMessage = await getUserMessage();
            
//             if(userMessage.toLowerCase() === 'exit' || userMessage.toLowerCase() === 'thoát' || 
//                         userMessage.toLowerCase() === 'kết thúc' || userMessage.toLowerCase() === 'dừng lại') {
//                 break;
//             }
            
//             const result = await chat.sendMessage(userMessage);
            
//             if (result.error) {
//                 logger.logError('LLM::startConversation', 'Failed to generate AI response ' + result.error);
//                 continue;
//             }
//             const response = result.response();

//             const text = Buffer.from(response.text(), 'utf-8').toString();
//             logger.logError('LLM::startConversation', 'Content: ' + text);
//         }
//     } catch (error) {
//         logger.logError('LLM::startConversation', 'Failed to generate AI response ' + config.GEMINI_API, error, true);
//     }
// }

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
