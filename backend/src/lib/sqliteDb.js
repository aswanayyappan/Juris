/**
 * Shared SQLite connection to cases.db
 * Used by chat and cases routes for court case queries.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'cases.db');

const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('[SQLite] Error connecting to cases.db:', err.message);
  } else {
    console.log('[SQLite] ✅ Connected to cases.db');
  }
});

module.exports = db;
