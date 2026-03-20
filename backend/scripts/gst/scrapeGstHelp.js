const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_TXT = path.join(__dirname, 'scarpp.txt');

function appendToTxt(text) {
  fs.appendFileSync(OUTPUT_TXT, text);
}

// Custom wait function to replace deprecated waitForTimeout
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function scrapeGstHelp() {
  console.log("Launching browser for Help page scraper...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  console.log("Navigating to GST Help Returns page...");
  await page.goto('https://www.gst.gov.in/help/returns', { waitUntil: 'networkidle2' });
  
  console.log("Extracting all reference links from the panels...");
  // Extract all links
  const linksToScrape = await page.evaluate(() => {
    const items = [];
    const links = document.querySelectorAll('.panel-body a');
    links.forEach(a => {
      let url = a.href;
      if (!url || url.includes('javascript:')) return;
      
      let parent = a.closest('.panel-body');
      let titleContext = parent && parent.querySelector('h4') ? parent.querySelector('h4').innerText.trim() : '';
      let linkText = a.innerText.trim() || 'Link';
      
      let fullTitle = titleContext ? `${titleContext} - ${linkText}` : linkText;
      
      items.push({
        title: fullTitle,
        url: url
      });
    });
    
    // Remove duplicates
    const unique = [];
    const seen = new Set();
    for (const item of items) {
      if (!seen.has(item.url)) {
        seen.add(item.url);
        unique.push(item);
      }
    }
    
    return unique;
  });

  console.log(`Found ${linksToScrape.length} unique links. Scraping each one...\n`);
  appendToTxt(`\n\n${'='.repeat(80)}\nGST HELP RETURNS - SCRAPED ON ${new Date().toLocaleString()}\n${'='.repeat(80)}\n\n`);

  for(let i = 0; i < linksToScrape.length; i++) {
    const item = linksToScrape[i];
    console.log(`[${i+1}/${linksToScrape.length}] Title: ${item.title}`);
    console.log(`URL: ${item.url}`);
    
    let content = '';
    
    if (item.url.toLowerCase().endsWith('.pdf')) {
      content = '[PDF Document - Skipped text extraction]';
    } else {
      try {
        await page.goto(item.url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Give the page/iframes extra time to render
        await delay(3000);
        
        // Extract text from the main page and all available frames
        for (const frame of page.frames()) {
          try {
            const frameText = await frame.evaluate(() => {
              return document.body ? document.body.innerText.trim() : '';
            });
            if (frameText && frameText.length > 20) {
              content += frameText + '\n\n';
            }
          } catch(e) {
            // Ignore frame cross-origin or access errors
          }
        }
        
        content = content.replace(/\n{3,}/g, '\n\n').trim();
        if (!content) {
          content = '[No readable text found on page]';
        }
      } catch (err) {
        content = `[ERROR fetching URL: ${err.message}]`;
      }
    }
    
    const preview = content.slice(0, 400).replace(/\n/g, ' ');
    console.log(`Content Preview: ${preview}...\n`);
    
    const entry = [
      `[${i+1}] ${item.title}`,
      `URL: ${item.url}`,
      '',
      content,
      '',
      '-'.repeat(80),
      ''
    ].join('\n');
    
    appendToTxt(entry);
  }
  
  console.log(`\nAll Help links scraped and appended to ${OUTPUT_TXT}`);
  await browser.close();
}

scrapeGstHelp().catch(console.error);
