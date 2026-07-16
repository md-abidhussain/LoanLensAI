function buildPrompt(fileData, fileMimeType, extractedText = null) {
  const promptText = `
  Analyze this loan agreement and return a JSON object matching this schema. The risk_score must be one of: "Low", "Medium", "High", or "Predatory". The severity of each red flag must be one of: "low", "medium", or "high". The verdict must be one of: "Safe to Proceed", "Read Carefully", or "Avoid This Loan". The loan_type must be one of: "Car Loan", "Education Loan", "Personal Loan", "Business Loan", "Gold Loan", "Home Loan", or "Other Loan".
  
  JSON schema:
  {
    "loan_type": "Car Loan | Education Loan | Personal Loan | Business Loan | Gold Loan | Home Loan | Other Loan",
    "verdict": "Safe to Proceed | Read Carefully | Avoid This Loan",
    "verdict_reason": "single sentence reason explaining the verdict",
    "summary": "string summary",
    "stated_interest_rate": "string rate",
    "effective_apr": "string APR",
    "risk_score": "Low | Medium | High | Predatory",
    "negotiation_tips": [
      "negotiation tip description"
    ],
    "red_flags": [
      {
        "clause": "quote of clause",
        "severity": "low | medium | high",
        "explanation": "explanation description"
      }
    ]
  }
  Do not include markdown tags. Output raw JSON.
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
