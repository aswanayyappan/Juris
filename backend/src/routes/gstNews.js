const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Route: GET /api/gst-news
router.get('/', (req, res) => {
  console.log('[GST News API] Request received at', new Date().toISOString());
  console.log('[GST News API] Headers:', req.headers);
  try {
    const filePath = path.join(__dirname, '../../scripts/gst/scarpp.txt');
    
    if (!fs.existsSync(filePath)) {
      return res.json({ articles: [] });
    }

    const rawData = fs.readFileSync(filePath, 'utf8');
    const blocks = rawData.split('--------------------------------------------------------------------------------');

    const articles = [];

    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 2) continue;

      // Extract title and date: "[Date] Title"
      const titleLine = lines[0];
      let date = "Unknown Date";
      let title = titleLine;

      const dateMatch = titleLine.match(/^\[(.*?)\]\s*(.*)$/);
      if (dateMatch) {
        date = dateMatch[1];
        title = dateMatch[2];
      }

      // Extract URL
      let url = "";
      let urlIndex = 1;
      if (lines[1].startsWith('URL:')) {
        url = lines[1].replace('URL:', '').trim();
        urlIndex = 2; // Content starts after this
      }

      // Extract Content (Combine remaining lines)
      const contentLines = lines.slice(urlIndex);
      // Remove generic filler headers if present
      const cleanContent = contentLines.filter(line => 
        !line.startsWith('Skip to Main Content') &&
        !line.startsWith('Goods and Services Tax') &&
        !line.startsWith('Government of India') &&
        !line.startsWith('REGISTER LOGIN') &&
        !line.startsWith('Home')
      ).join('\n').trim();

      if (title.length > 0) {
        articles.push({
          id: Math.random().toString(36).substring(7),
          date,
          title,
          url,
          content: cleanContent
        });
      }
    }

    // Return the latest 20 articles (reversing the array so newest is first assuming append-only)
    const reversedArticles = articles.reverse().slice(0, 20);
    console.log('[GST News API] Parsed articles:', reversedArticles.length, 'articles found');
    if (reversedArticles.length > 0) {
      console.log('[GST News API] First article:', reversedArticles[0]);
    }
    res.json({ articles: reversedArticles });
  } catch (error) {
    console.error('[GST News API] Error parsing scarpp.txt:', error);
    res.status(500).json({ error: 'Internal server error while fetching GST updates.' });
  }
});

module.exports = router;
