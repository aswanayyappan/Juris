const { spawn } = require('child_process');
const path = require('path');

function runScraper(scriptName, scriptPath) {
  console.log(`[Scheduler] Starting scraper: ${scriptName} at ${new Date().toISOString()}`);
  
  // Note: we run the scripts from the backend folder context 
  // since the scraper scripts themselves might have relative paths that expect it.
  const backendDir = path.join(__dirname, '../../');

  const scraper = spawn('node', [scriptPath], { cwd: backendDir });

  scraper.stdout.on('data', (data) => {
    console.log(`[${scriptName}] ${data.toString().trim()}`);
  });

  scraper.stderr.on('data', (data) => {
    console.error(`[${scriptName} ERROR] ${data.toString().trim()}`);
  });

  scraper.on('close', (code) => {
    console.log(`[Scheduler] ${scriptName} finished with exit code ${code}`);
  });
}

function initScrapers() {
  const gstScript = path.join(__dirname, '../../scripts/gst/scrapeGst.js');
  const gstReturnsScript = path.join(__dirname, '../../scripts/gst/scrapeGstHelp.js');
  const esicScript = path.join(__dirname, '../../scripts/esic/scrapeEsic.js');

  const runAll = () => {
    console.log('\n[Scheduler] Triggering autonomous web scrapers...');
    runScraper('GST_Scraper', gstScript);
    runScraper('GST_Returns_Scraper', gstReturnsScript);
    runScraper('ESIC_Scraper', esicScript);
  };

  // 1. Run immediately when the server starts
  runAll();

  // 2. Schedule to run every 1 Hour (60 mins * 60 secs * 1000 ms = 3,600,000 ms)
  setInterval(runAll, 60 * 60 * 1000);
}

module.exports = { initScrapers };
