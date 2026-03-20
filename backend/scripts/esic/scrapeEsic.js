const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_TXT = path.join(__dirname, 'esic_circulars.txt');

function appendToTxt(text) {
  fs.appendFileSync(OUTPUT_TXT, text);
}

async function scrapeEsic() {
  console.log("Launching browser for ESIC Circulars scraper...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Initialize file
  fs.writeFileSync(OUTPUT_TXT, `=== ESIC CIRCULARS SCRAPED ON ${new Date().toLocaleString()} ===\n\n`);
  
  let pageNum = 1;
  let hasMore = true;
  let totalScraped = 0;

  while (hasMore) {
    const url = pageNum === 1 
      ? 'https://esic.gov.in/circulars' 
      : `https://esic.gov.in/circulars/index/page:${pageNum}`;
      
    console.log(`\nNavigating to Page ${pageNum}: ${url}`);
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForSelector('._tbl-grid tbody tr', { timeout: 10000 });
      
      const circulars = await page.evaluate(() => {
        const items = [];
        const rows = document.querySelectorAll('._tbl-grid tbody tr');
        
        rows.forEach(row => {
          const cols = row.querySelectorAll('td');
          // Skip if missing columns or if it's an empty/no-record row
          if (cols.length >= 6) {
            const sNo = cols[0].innerText.trim();
            const branch = cols[1].innerText.trim();
            const circularDate = cols[2].innerText.trim();
            
            const subjectLinks = [];
            const links = cols[3].querySelectorAll('a');
            links.forEach(a => {
               let title = a.innerText.trim();
               title = title.replace(/\s*-\s*PDF\s*size:\([\s\S]*?\)\s*\./, '').trim();
               if(title) {
                 subjectLinks.push({ title, url: a.href });
               }
            });
            
            const publishDate = cols[4].innerText.trim();
            const consoleNo = cols[5].innerText.trim();
            
            // Basic validation to ensure it's a real row
            if (sNo && consoleNo) {
                items.push({
                  sNo, branch, circularDate, subjectLinks, publishDate, consoleNo
                });
            }
          }
        });
        return items;
      });

      if (circulars.length === 0) {
        console.log(`No circulars found on Page ${pageNum}. Stopping pagination.`);
        hasMore = false;
        break;
      }

      console.log(`Extracted ${circulars.length} circulars from Page ${pageNum}. Saving...`);
      totalScraped += circulars.length;
      
      for (const item of circulars) {
        let entry = `[${item.sNo}] Console No: ${item.consoleNo} | Branch: ${item.branch}\n`;
        entry += `Circular Date: ${item.circularDate} | Publish Date: ${item.publishDate}\n`;
        entry += `Subjects / Attachments:\n`;
        
        if (item.subjectLinks.length === 0) {
           entry += `  - No accessible links found.\n`;
        } else {
           item.subjectLinks.forEach(link => {
              entry += `  - Title: ${link.title}\n`;
              entry += `    Link: ${link.url}\n`;
           });
        }
        
        entry += `\n${'-'.repeat(80)}\n\n`;
        appendToTxt(entry);
      }
      
      pageNum++;
      
    } catch (err) {
      console.log(`Error or timeout on Page ${pageNum}: ${err.message}. Assuming end of list.`);
      hasMore = false;
    }
  }

  console.log(`\nDone! Scraped a total of ${totalScraped} circulars spanning ${pageNum - 1} pages.`);
  console.log(`All data saved to: ${OUTPUT_TXT}`);
  await browser.close();
}

scrapeEsic().catch(err => {
  console.error("Critical error scraping ESIC:", err);
});
