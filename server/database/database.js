const sqlite3 = require('sqlite3').verbose();
const { databasePath } = require('../config/dbConfig');

const db = new sqlite3.Database(databasePath, (err) => {
  if (err) {
    console.error('database connection error', err.message);
  } else {
    console.log('connected to database', databasePath);
  }
});

module.exports = db;
