/**
 * GET /api/cases/search?query=...
 * Searches the court_cases SQLite table across multiple fields.
 * Returns matching rows as JSON.
 */

const express = require('express');
const router  = express.Router();
const db = require('../lib/sqliteDb');

router.get('/search', (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const sql = `
    SELECT case_number, court_name, case_type, petitioner_name, prosecutor_name,
           crime_number, case_details, status, file_name
    FROM court_cases
    WHERE case_number LIKE ?
       OR court_name LIKE ?
       OR case_type LIKE ?
       OR petitioner_name LIKE ?
       OR prosecutor_name LIKE ?
       OR crime_number LIKE ?
       OR case_details LIKE ?
       OR status LIKE ?
  `;

  const like = `%${query}%`;
  const params = [like, like, like, like, like, like, like, like];

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('[Cases] Search error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    return res.json({ results: rows });
  });
});

module.exports = router;
