const db = require('./database');

function initDb() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        `CREATE TABLE IF NOT EXISTS scans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filename TEXT NOT NULL,
          summary TEXT NOT NULL,
          stated_interest_rate TEXT NOT NULL,
          effective_apr TEXT NOT NULL,
          risk_score TEXT NOT NULL,
          red_flags TEXT NOT NULL,
          negotiation_tips TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (err) => {
          if (err) {
            console.error('database table creation failure', err.message);
            return reject(err);
          }
          
          db.all('PRAGMA table_info(scans)', (infoErr, rows) => {
            if (infoErr) {
              console.error('pragma table info query failure', infoErr.message);
              return reject(infoErr);
            }
            
            const columns = rows.map(r => r.name);
            const migrations = [];
            
            if (!columns.includes('loan_type')) {
              migrations.push("ALTER TABLE scans ADD COLUMN loan_type TEXT");
            }
            if (!columns.includes('verdict')) {
              migrations.push("ALTER TABLE scans ADD COLUMN verdict TEXT");
            }
            if (!columns.includes('verdict_reason')) {
              migrations.push("ALTER TABLE scans ADD COLUMN verdict_reason TEXT");
            }
            
            if (migrations.length === 0) {
              return resolve();
            }
            
            let completed = 0;
            migrations.forEach(sql => {
              db.run(sql, (alterErr) => {
                if (alterErr) {
                  console.error('migration failed for:', sql, alterErr.message);
                  return reject(alterErr);
                }
                completed++;
                if (completed === migrations.length) {
                  db.all('SELECT id, summary FROM scans', (selectErr, scanRows) => {
                    if (selectErr) {
                      console.error('failed to select scans for legacy migration', selectErr.message);
                      return reject(selectErr);
                    }
                    
                    const legacyRows = scanRows.filter(row => {
                      try {
                        const parsed = JSON.parse(row.summary);
                        return parsed && parsed.text;
                      } catch (e) {
                        return false;
                      }
                    });
                    
                    if (legacyRows.length === 0) {
                      return resolve();
                    }
                    
                    let updatedCount = 0;
                    legacyRows.forEach(row => {
                      const parsed = JSON.parse(row.summary);
                      const text = parsed.text;
                      const loanType = parsed.loan_type || 'Other Loan';
                      const verdict = parsed.verdict || 'Read Carefully';
                      const verdictReason = parsed.verdict_reason || '';
                      
                      db.run(
                        'UPDATE scans SET summary = ?, loan_type = ?, verdict = ?, verdict_reason = ? WHERE id = ?',
                        [text, loanType, verdict, verdictReason, row.id],
                        (updateErr) => {
                          if (updateErr) {
                            console.error('legacy row migration failed for id:', row.id, updateErr.message);
                            return reject(updateErr);
                          }
                          updatedCount++;
                          if (updatedCount === legacyRows.length) {
                            resolve();
                          }
                        }
                      );
                    });
                  });
                }
              });
            });
          });
        }
      );
    });
  });
}

module.exports = initDb;
