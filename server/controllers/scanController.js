const extractPdfText = require('../services/extractPdfText');
const { analyzeDocument } = require('../services/geminiClient');
const { insertScan, fetchScans, fetchScanById } = require('./saveScan');
const { formatScanResponse, calculateHealthMetrics } = require('./responseFormatter');

async function createScan(req, res) {
  const file = req.file;
  let extractedText = null;

  try {
    if (file.mimetype === 'application/pdf') {
      extractedText = await extractPdfText(file.buffer);
    }

    const analysis = await analyzeDocument(file.buffer, file.mimetype, extractedText);
    const lastId = await insertScan(file.originalname, analysis);

    const formatted = formatScanResponse(lastId, file.originalname, analysis);
    return res.status(201).json(formatted);
  } catch (err) {
    console.error('scan creation failure', err.message);
    return res.status(500).json({ error: err.message });
  }
}

async function getScans(req, res) {
  try {
    const rows = await fetchScans();
    const mapped = rows.map(row => {
      let summaryText = row.summary;
      let loanType = 'Other Loan';
      let verdict = 'Read Carefully';
      let healthScore = 70;
      let healthMeter = '███████░░░';
      try {
        const parsed = JSON.parse(row.summary);
        summaryText = parsed.text;
        loanType = parsed.loan_type || 'Other Loan';
        verdict = parsed.verdict || 'Read Carefully';
        healthScore = parsed.health_score || 70;
        healthMeter = parsed.health_meter || '███████░░░';
      } catch (e) {
        // Fallback for legacy
      }
      return {
        ...row,
        summary: summaryText,
        loan_type: loanType,
        verdict: verdict,
        health_score: healthScore,
        health_meter: healthMeter
      };
    });
    return res.json(mapped);
  } catch (err) {
    console.error('scans retrieval failure', err.message);
    return res.status(500).json({ error: 'failed to retrieve scans' });
  }
}

async function getScanById(req, res) {
  try {
    const row = await fetchScanById(req.params.id);
    if (!row) {
      return res.status(404).json({ error: 'scan not found' });
    }
    
    let summaryText = row.summary;
    let loanType = 'Other Loan';
    let verdict = 'Read Carefully';
    let verdictReason = '';
    
    try {
      const parsed = JSON.parse(row.summary);
      summaryText = parsed.text;
      loanType = parsed.loan_type || 'Other Loan';
      verdict = parsed.verdict || 'Read Carefully';
      verdictReason = parsed.verdict_reason || '';
    } catch (e) {
      // Fallback for legacy
    }

    try {
      row.red_flags = JSON.parse(row.red_flags);
    } catch (parseErr) {
      console.error('json parse failure', parseErr.message);
      row.red_flags = [];
    }
    
    try {
      row.negotiation_tips = JSON.parse(row.negotiation_tips || '[]');
    } catch (parseErr) {
      console.error('json parse failure', parseErr.message);
      row.negotiation_tips = [];
    }
    
    const metrics = calculateHealthMetrics(row.red_flags, row.risk_score);
    const responseData = {
      ...row,
      summary: summaryText,
      loan_type: loanType,
      verdict: verdict,
      verdict_reason: verdictReason,
      ...metrics
    };
    
    return res.json(responseData);
  } catch (err) {
    console.error('scan detail retrieval failure', err.message);
    return res.status(500).json({ error: 'failed to retrieve scan detail' });
  }
}

module.exports = {
  createScan,
  getScans,
  getScanById
};
