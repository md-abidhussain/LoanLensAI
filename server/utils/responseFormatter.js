function calculateHealthMetrics(redFlags, riskScore) {
  let score = 100;
  
  if (Array.isArray(redFlags)) {
    redFlags.forEach(flag => {
      const severity = (flag.severity || 'medium').toLowerCase();
      if (severity === 'high') {
        score -= 30;
      } else if (severity === 'medium') {
        score -= 15;
      } else {
        score -= 5;
      }
    });
  }

  score = Math.max(10, score);
  if (riskScore === 'Predatory') {
    score = Math.min(15, score);
  }

  const filledBlocks = Math.round(score / 10);
  const emptyBlocks = 10 - filledBlocks;
  const healthMeter = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

  return {
    health_score: score,
    health_meter: healthMeter
  };
}

function formatScanResponse(id, filename, analysis) {
  const metrics = calculateHealthMetrics(analysis.red_flags, analysis.risk_score);
  return {
    id: id,
    filename: filename,
    summary: analysis.summary,
    loan_type: analysis.loan_type || 'Other Loan',
    verdict: analysis.verdict || 'Read Carefully',
    verdict_reason: analysis.verdict_reason || '',
    stated_interest_rate: analysis.stated_interest_rate,
    effective_apr: analysis.effective_apr,
    risk_score: analysis.risk_score,
    ...metrics,
    negotiation_tips: analysis.negotiation_tips || [],
    red_flags: analysis.red_flags,
    created_at: new Date().toISOString()
  };
}

module.exports = {
  calculateHealthMetrics,
  formatScanResponse
};
