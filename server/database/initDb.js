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
          
          db.run(
            `ALTER TABLE scans ADD COLUMN negotiation_tips TEXT`,
            () => {
              console.log('database scans table initialized');
              resolve();
            }
          );
        }
      );
    });
  });
}

module.exports = initDb;
