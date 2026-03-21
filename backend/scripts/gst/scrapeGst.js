const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ── Config ──────────────────────────────────────────────────────────────────
const INTERVAL_MINUTES = 60;           // How often to check for new articles
const OUTPUT_TXT       = path.join(__dirname, 'scarpp.txt');
const SEEN_URLS_FILE   = path.join(__dirname, 'seen_urls.json');

// ── Helpers ──────────────────────────────────────────────────────────────────
function loadSeenUrls() {
  if (fs.existsSync(SEEN_URLS_FILE)) {
    return new Set(JSON.parse(fs.readFileSync(SEEN_URLS_FILE, 'utf8')));
  }
  return new Set();
}

function saveSeenUrls(seenSet) {
  fs.writeFileSync(SEEN_URLS_FILE, JSON.stringify([...seenSet], null, 2));
}

function appendToTxt(text) {
  fs.appendFileSync(OUTPUT_TXT, text);
}

async function scrapeArticleContent(page, url) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  try {
    await page.waitForFunction(() => {
      const pane = document.querySelector('.content-pane');
      if (!pane) return false;
      const text = pane.innerText.trim();
      return text.length > 30 && !text.startsWith('BACK');
    }, { timeout: 8000 });
  } catch (_) {}

  return await page.evaluate(() => {
    const pane = document.querySelector('.content-pane');
    return pane ? pane.innerText.trim() : document.body.innerText.trim();
  });
}

function cleanContent(raw) {
  const lines = raw.split('\n').filter(l => l.trim().length > 0);
  const startIdx = lines.findIndex(l => l.includes('Home') && l.includes('News'));
  const trimmed = startIdx >= 0 ? lines.slice(startIdx + 1) : lines;
  return trimmed.join('\n').replace(/BACK PRINT[\s\S]*$/m, '').trim();
}

// ── Main scrape function ──────────────────────────────────────────────────────
async function runScrape() {
  const timestamp = new Date().toLocaleString();
  console.log(`\n${'='.repeat(80)}`);
  console.log(`[${timestamp}] Running GST scraper...`);

  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.goto('https://www.gst.gov.in/newsandupdates', { waitUntil: 'networkidle2' });
    await page.waitForSelector('.news-updts li');

    const newsItems = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll('.news-updts li').forEach(li => {
        const dateEl = li.querySelector('.dt');
        const titleEl = li.querySelector('p a');
        if (dateEl && titleEl) {
          items.push({
            date: dateEl.innerText.trim(),
            title: titleEl.innerText.trim(),
            link: titleEl.href
          });
        }
      });
      return items;
    });

    const seenUrls = loadSeenUrls();
    const newItems = newsItems.filter(item => !seenUrls.has(item.link));

    if (newItems.length === 0) {
      console.log(`No new articles found. (${newsItems.length} already scraped)`);
      await browser.close();
      return;
    }

    console.log(`Found ${newItems.length} new article(s) out of ${newsItems.length} total.\n`);
    appendToTxt(`\n\n--- Scrape run: ${timestamp} | ${newItems.length} new article(s) ---\n\n`);

    for (let i = 0; i < newItems.length; i++) {
      const item = newItems[i];
      console.log(`[${i + 1}/${newItems.length}] ${item.date} — ${item.title}`);
      console.log(`     URL: ${item.link}`);

      let content = '';
      try {
        const raw = await scrapeArticleContent(page, item.link);
        content = cleanContent(raw);
      } catch (err) {
        content = `[ERROR: ${err.message}]`;
      }

      const preview = content.slice(0, 500).replace(/\n{3,}/g, '\n\n');
      console.log(`\n${preview}${content.length > 500 ? '\n...[truncated]' : ''}\n`);
      console.log('-'.repeat(80));

      const entry = [
        `[${item.date}] ${item.title}`,
        `URL: ${item.link}`,
        '',
        content,
        '',
        '-'.repeat(80),
        ''
      ].join('\n');

      appendToTxt(entry);
      seenUrls.add(item.link);
    }

    saveSeenUrls(seenUrls);
    console.log(`\nDone. scarpp.txt updated. Next check in ${INTERVAL_MINUTES} min.`);
    await browser.close();

  } catch (err) {
    console.error(`[ERROR] Scrape failed: ${err.message}`);
    if (browser) await browser.close();
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────
console.log(`GST Auto-Scraper started. Checking every ${INTERVAL_MINUTES} minute(s).`);
console.log(`Output: ${OUTPUT_TXT}`);
console.log(`Seen URLs tracked in: ${SEEN_URLS_FILE}\n`);

// Run immediately
runScrape();
