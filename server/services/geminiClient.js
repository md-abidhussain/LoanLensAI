const { geminiModel } = require('../config/geminiConfig');
const { buildPrompt } = require('./promptBuilder');
const { parseAnalysisJson } = require('./jsonParser');

async function analyzeDocument(fileData, fileMimeType, extractedText = null) {
  const contentParts = buildPrompt(fileData, fileMimeType, extractedText);

  try {
    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: contentParts }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = result.response.text();
    return parseAnalysisJson(responseText);
  } catch (err) {
    console.error('gemini analysis error', err.message);
    throw new Error('failed to complete gemini analysis, please try again');
  }
}

module.exports = {
  analyzeDocument
};
