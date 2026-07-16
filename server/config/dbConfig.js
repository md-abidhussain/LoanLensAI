const path = require('path');
require('dotenv').config();

const dbPath = process.env.DATABASE_PATH || 'database.db';
const absoluteDbPath = path.isAbsolute(dbPath)
  ? dbPath
  : path.join(__dirname, '../..', dbPath);

module.exports = {
  databasePath: absoluteDbPath
};
