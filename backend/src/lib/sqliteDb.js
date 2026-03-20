/**
 * Shared SQLite connection to cases.db
 * Used by chat and cases routes for court case queries.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use the platform-writable temp directory in Render and other hosts.
// Files under the project source may be read-only after build; default to /tmp.
const DB_PATH = process.env.SQLITE_DB_PATH || '/tmp/cases.db';

// Open the DB read/write and create if missing. Fail fast if the DB cannot be opened.
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('[SQLite] Fatal: unable to open database at', DB_PATH, '-', err.message);
    // Fail fast so the process doesn't run in a degraded state.
    // In production orchestrators this will surface the problem immediately.
    process.exit(1);
  } else {
    console.log('[SQLite] ✅ Connected to', DB_PATH);
  }
});

module.exports = db;
