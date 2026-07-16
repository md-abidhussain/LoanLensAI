const db = require('../database/dbConnection');
const extractPdfText = require('../services/extractPdfText');
const { analyzeDocument } = require('../services/geminiService');

async function createScan(req, res) {
  const file = req.file;
  let extractedText = null;

  try {
    if (file.mimetype === 'application/pdf') {
      extractedText = await extractPdfText(file.buffer);
    }

    const analysis = await analyzeDocument(file.buffer, file.mimetype, extractedText);

    const query = `
      INSERT INTO scans (filename, summary, stated_interest_rate, effective_apr, risk_score, red_flags)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      file.originalname,
      analysis.summary,
      analysis.stated_interest_rate,
      analysis.effective_apr,
      analysis.risk_score,
      JSON.stringify(analysis.red_flags)
    ];

    db.run(query, params, function(err) {
      if (err) {
        console.error('database insert failure', err.message);
        return res.status(500).json({ error: 'failed to save scan to database' });
      }
      return res.status(201).json({
        id: this.lastID,
        filename: file.originalname,
        ...analysis,
        created_at: new Date().toISOString()
      });
    });
  } catch (err) {
    console.error('scan creation failure', err.message);
    return res.status(500).json({ error: err.message });
  }
}

function getScans(req, res) {
  const query = 'SELECT id, filename, risk_score, created_at FROM scans ORDER BY created_at DESC';
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('database query failure', err.message);
      return res.status(500).json({ error: 'failed to retrieve scans' });
    }
    return res.json(rows);
  });
}

function getScanById(req, res) {
  const id = req.params.id;
  const query = 'SELECT * FROM scans WHERE id = ?';
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('database query failure', err.message);
      return res.status(500).json({ error: 'failed to retrieve scan detail' });
    }
    if (!row) {
      return res.status(404).json({ error: 'scan not found' });
    }
    try {
      row.red_flags = JSON.parse(row.red_flags);
    } catch (parseErr) {
      console.error('database json parse failure', parseErr.message);
      row.red_flags = [];
    }
    return res.json(row);
  });
}

module.exports = {
  createScan,
  getScans,
  getScanById
};
