const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('missing GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(apiKey || 'dummy_key');
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

module.exports = {
  geminiModel
};
