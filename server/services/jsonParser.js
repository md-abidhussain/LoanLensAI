const { RISK_LEVELS } = require('../config/constants');

function parseAnalysisJson(responseText) {
  let parsedData;
  try {
    parsedData = JSON.parse(responseText);
  } catch (parseErr) {
    console.error('gemini output is not valid json', parseErr.message);
    throw new Error('the analysis returned invalid data, please retry');
  }

  if (!parsedData.summary || typeof parsedData.summary !== 'string') {
    parsedData.summary = 'no summary provided';
  }
  if (!parsedData.stated_interest_rate || typeof parsedData.stated_interest_rate !== 'string') {
    parsedData.stated_interest_rate = 'not stated';
  }
  if (!parsedData.effective_apr || typeof parsedData.effective_apr !== 'string') {
    parsedData.effective_apr = 'not calculated';
  }
  
  if (!parsedData.risk_score || !RISK_LEVELS.includes(parsedData.risk_score)) {
    parsedData.risk_score = 'Medium';
  }

  if (!Array.isArray(parsedData.negotiation_tips)) {
    parsedData.negotiation_tips = [];
  } else {
    parsedData.negotiation_tips = parsedData.negotiation_tips
      .filter(tip => typeof tip === 'string')
      .map(tip => tip.trim());
  }

  if (!Array.isArray(parsedData.red_flags)) {
    parsedData.red_flags = [];
  } else {
    parsedData.red_flags = parsedData.red_flags.map(flag => ({
      clause: typeof flag.clause === 'string' ? flag.clause : 'unspecified clause',
      severity: typeof flag.severity === 'string' && ['low', 'medium', 'high'].includes(flag.severity.toLowerCase())
        ? flag.severity.toLowerCase()
        : 'medium',
      explanation: typeof flag.explanation === 'string' ? flag.explanation : 'no detail provided'
    }));
  }

  return parsedData;
}

module.exports = {
  parseAnalysisJson
};
