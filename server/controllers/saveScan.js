const db = require('../database/database');

function insertScan(filename, analysis) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO scans (filename, summary, stated_interest_rate, effective_apr, risk_score, red_flags, negotiation_tips)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      filename,
      analysis.summary,
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
    const query = 'SELECT id, filename, risk_score, created_at FROM scans ORDER BY created_at DESC';
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
