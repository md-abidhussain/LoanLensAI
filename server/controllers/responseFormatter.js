function formatScanResponse(id, filename, analysis) {
  return {
    id: id,
    filename: filename,
    summary: analysis.summary,
    stated_interest_rate: analysis.stated_interest_rate,
    effective_apr: analysis.effective_apr,
    risk_score: analysis.risk_score,
    red_flags: analysis.red_flags,
    created_at: new Date().toISOString()
  };
}

module.exports = {
  formatScanResponse
};
