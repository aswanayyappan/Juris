const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
  try {
    const filePath = path.join(__dirname, '../../scripts/gst/gst_returns.txt');
    
    if (!fs.existsSync(filePath)) {
      return res.json({ articles: [] });
    }

    const rawData = fs.readFileSync(filePath, 'utf8');
    const blocks = rawData.split('--------------------------------------------------------------------------------');

    const articles = [];

    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 3) continue;

      let title = "";
      let url = "";
      let content = "";
      
      const titleLine = lines.find(l => l.match(/^\[\d+\]/));
      if (titleLine) {
        title = titleLine.replace(/^\[\d+\]\s*/, '').trim();
      }

      const urlLine = lines.find(l => l.startsWith('URL:'));
      if (urlLine) {
        url = urlLine.replace('URL:', '').trim();
      }
      
      const contentIndex = lines.findIndex(l => l.startsWith('URL:'));
      if (contentIndex !== -1 && contentIndex + 1 < lines.length) {
         content = lines.slice(contentIndex + 1).join('\n').trim();
      } else {
         content = lines.join(' ').trim();
      }
      
      if(content === "") {
         content = "No details extracted for this return file.";
      }

      if (title.length > 0) {
        articles.push({
          id: Math.random().toString(36).substring(7),
          title,
          url,
          content,
          date: "Live Tracking"
        });
      }
    }

    // Return the items
    res.json({ articles: articles });
  } catch (error) {
    console.error('[GST Returns API] Error parsing gst_returns.txt:', error);
    res.status(500).json({ error: 'Internal server error while fetching returns help.' });
  }
});

module.exports = router;
