const db = require('../database/database');
const { calculateHealthMetrics } = require('./responseFormatter');

function insertScan(filename, analysis) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO scans (filename, summary, stated_interest_rate, effective_apr, risk_score, red_flags, negotiation_tips)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const metrics = calculateHealthMetrics(analysis.red_flags, analysis.risk_score);
    const serializedSummary = JSON.stringify({
      text: analysis.summary,
      loan_type: analysis.loan_type || 'Other Loan',
      verdict: analysis.verdict || 'Read Carefully',
      verdict_reason: analysis.verdict_reason || '',
      health_score: metrics.health_score,
      health_meter: metrics.health_meter
    });

    const params = [
      filename,
      serializedSummary,
      analysis.stated_interest_rate,
      analysis.effective_apr,
      analysis.risk_score,
      JSON.stringify(analysis.red_flags),
      JSON.stringify(analysis.negotiation_tips)
    ];

    db.run(query, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

function fetchScans() {
  return new Promise((resolve, reject) => {
    const query = 'SELECT id, filename, risk_score, summary, created_at FROM scans ORDER BY created_at DESC';
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function fetchScanById(id) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM scans WHERE id = ?';
    db.get(query, [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

module.exports = {
  insertScan,
  fetchScans,
  fetchScanById
};
