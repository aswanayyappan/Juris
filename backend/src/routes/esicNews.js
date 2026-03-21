const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Route: GET /api/esic-news
router.get('/', (req, res) => {
  try {
    const filePath = path.join(__dirname, '../../scripts/esic/esic_circulars.txt');
    
    if (!fs.existsSync(filePath)) {
      return res.json({ articles: [] });
    }

    const rawData = fs.readFileSync(filePath, 'utf8');
    const blocks = rawData.split('--------------------------------------------------------------------------------');

    const articles = [];

    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 3) continue;

      // Ensure this block actually has circular data (skip headers/footers)
      if (!lines[0].startsWith('[')) {
        continue;
      }

      // Extract Console No and Branch: "[1] Console No: 24809/2026 | Branch: PR"
      const metaLine = lines[0];
      const dateLine = lines[1]; // "Circular Date: 19-03-2026 | Publish Date: 2026-03-19"
      
      let date = "Unknown Date";
      const dateMatch = dateLine.match(/Circular Date:\s*([^|]+)/i);
      if (dateMatch) {
         date = dateMatch[1].trim();
      }

      let contentDesc = metaLine.substring(metaLine.indexOf(']') + 1).trim();

      // Extract Attachments
      // usually lines[3] is "- Title: ..." and lines[4] is "  Link: ..."
      let title = "";
      let url = "";

      for (let i = 2; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('- Title:')) {
           title = line.replace('- Title:', '').trim();
           // The next line should be the link
           if (i + 1 < lines.length && lines[i+1].startsWith('Link:')) {
             url = lines[i+1].replace('Link:', '').trim();
           }
           break; // Stop after first attachment so we just get one distinct card
        }
      }

      if (title.length > 0) {
        articles.push({
          id: Math.random().toString(36).substring(7),
          date,
          title,
          url,
          content: contentDesc
        });
      }
    }

    // Return all articles to let the frontend paginate them accurately
    const reversedArticles = articles.reverse();

    res.json({ articles: reversedArticles });
  } catch (error) {
    console.error('[ESIC News API] Error parsing esic_circulars.txt:', error);
    res.status(500).json({ error: 'Internal server error while fetching ESIC updates.' });
  }
});

module.exports = router;
