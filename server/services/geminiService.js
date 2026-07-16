const { geminiModel } = require('../config/geminiConfig');

async function analyzeDocument(fileData, fileMimeType, extractedText = null) {
  const promptText = `
  Analyze this loan agreement and output a JSON object with this exact schema:
  {
    "summary": "plain-language summary",
    "stated_interest_rate": "stated interest rate",
    "effective_apr": "estimated effective APR",
    "risk_score": "Low" or "Medium" or "High" or "Predatory",
    "red_flags": [
      {
        "clause": "clause quote",
        "severity": "low" or "medium" or "high",
        "explanation": "explanation"
      }
    ]
  }
  Do not wrap the output in markdown code blocks. Output raw JSON.
  `;

  const contentParts = [{ text: promptText }];

  if (fileMimeType === 'application/pdf') {
    contentParts.push({ text: `Document content: \n\n${extractedText}` });
  } else {
    contentParts.push({
      inlineData: {
        data: fileData.toString('base64'),
        mimeType: fileMimeType
      }
    });
  }

  try {
    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: contentParts }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = result.response.text();
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('gemini json parse failure', parseErr.message);
      throw new Error('the analysis returned invalid data, please retry');
    }
    return parsedData;
  } catch (err) {
    console.error('gemini analysis error', err.message);
    throw new Error('failed to complete gemini analysis, please try again');
  }
}

module.exports = {
  analyzeDocument
};
