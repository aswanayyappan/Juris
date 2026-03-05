/**
 * GET /api/download?file=filename.pdf
 * Serves PDF files from the backend/output/ directory.
 */

const express = require('express');
const router  = express.Router();
const path    = require('path');

router.get('/', (req, res) => {
  let fileName = req.query.file;

  if (!fileName) {
    return res.status(400).json({ error: 'file parameter is required' });
  }

  // Ensure the file has a .pdf extension
  if (!fileName.endsWith('.pdf')) {
    fileName = fileName.replace(/\.txt$/, '.pdf');
  }

  const filePath = path.join(__dirname, '..', '..', 'output', fileName);

  // Set correct Content-Type for PDF
  res.setHeader('Content-Type', 'application/pdf');

  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error('[Download] Error downloading file:', err);
      res.status(500).send('Error downloading file.');
    }
  });
});

module.exports = router;
