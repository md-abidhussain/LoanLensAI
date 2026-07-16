function buildPrompt(fileData, fileMimeType, extractedText = null) {
  const promptText = `
  Analyze this loan agreement and output a JSON object with this exact schema:
  {
    "summary": "plain-language summary",
    "stated_interest_rate": "stated interest rate",
    "effective_apr": "estimated effective APR",
    "risk_score": "Low" or "Medium" or "High" or "Predatory",
    "negotiation_tips": [
      "negotiation suggestion tip"
    ],
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

  return contentParts;
}

module.exports = {
  buildPrompt
};
