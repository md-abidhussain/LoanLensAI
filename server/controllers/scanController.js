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
    return res.json(rows);
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
