const extractPdfText = require('../services/extractPdfText');
const { analyzeDocument } = require('../services/geminiClient');
const { insertScan, fetchScans, fetchScanById } = require('../database/scanRepository');
const { formatScanResponse, calculateHealthMetrics } = require('../utils/responseFormatter');

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
      let redFlags = [];
      try {
        redFlags = JSON.parse(row.red_flags || '[]');
      } catch (e) {
      }
      const metrics = calculateHealthMetrics(redFlags, row.risk_score);
      return {
        id: row.id,
        filename: row.filename,
        risk_score: row.risk_score,
        summary: row.summary,
        loan_type: row.loan_type,
        verdict: row.verdict,
        verdict_reason: row.verdict_reason,
        created_at: row.created_at,
        ...metrics
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
    
    let redFlags = [];
    try {
      redFlags = JSON.parse(row.red_flags || '[]');
    } catch (parseErr) {
      console.error('json parse failure', parseErr.message);
    }
    
    let tips = [];
    try {
      tips = JSON.parse(row.negotiation_tips || '[]');
    } catch (parseErr) {
      console.error('json parse failure', parseErr.message);
    }
    
    const metrics = calculateHealthMetrics(redFlags, row.risk_score);
    const responseData = {
      id: row.id,
      filename: row.filename,
      summary: row.summary,
      loan_type: row.loan_type,
      verdict: row.verdict,
      verdict_reason: row.verdict_reason,
      stated_interest_rate: row.stated_interest_rate,
      effective_apr: row.effective_apr,
      risk_score: row.risk_score,
      red_flags: redFlags,
      negotiation_tips: tips,
      created_at: row.created_at,
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
