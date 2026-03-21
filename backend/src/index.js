require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const { initScrapers } = require('./services/scraperScheduler');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    const allowedFrontend = process.env.FRONTEND_URL;
    if (!origin
      || origin.startsWith('http://localhost:')
      || origin.startsWith('http://127.0.0.1:')
      || origin.startsWith('https://localhost:')
      || (allowedFrontend && origin.startsWith(allowedFrontend))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Security & Sessions ─────────────────────────────────────────────────────────
// 1. Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'juris_secure_key_123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours 
  }
}));

// 2. Global Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Apply the rate limiter to all API routes
app.use('/api/', apiLimiter);

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/businesses',    require('./routes/businesses'));
app.use('/api/tasks',         require('./routes/tasks'));
app.use('/api/score',         require('./routes/score'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/library',       require('./routes/library'));
app.use('/api/chat',          require('./routes/chat'));
app.use('/api/cases',         require('./routes/cases'));
app.use('/api/download',      require('./routes/download'));
app.use('/api/experts',       require('./routes/experts'));
app.use('/api/gst-news',      require('./routes/gstNews'));
app.use('/api/gst-returns',   require('./routes/gstReturns'));
app.use('/api/esic-news',     require('./routes/esicNews'));

// ── Health checks & Cron (API namespace) ──────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));
app.get('/api/cron/trigger', async (_req, res) => {
  const { runStatusUpdate } = require('./cron/statusUpdater');
  runStatusUpdate().catch(err => console.error('[Cron] Manual trigger error:', err.message));
  return res.json({ message: 'Cron job triggered (running in background)' });
});

require('./cron/statusUpdater');

// ── Frontend Static & SPA Fallback (MUST BE LAST) ─────────────────────────────
const frontendBuild = path.join(__dirname, '..', '..', 'frontend', 'build');
const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');

let serveDir = fs.existsSync(frontendBuild) ? frontendBuild : frontendDist;
let indexPath = path.join(serveDir, 'index.html');

if (fs.existsSync(indexPath)) {
  console.log('[Server] Initializing SPA Fallback from:', serveDir);
  app.use(express.static(serveDir));
  
  // Catch-all: serve index.html for any route not handled by API above
  app.get(/.*/, (req, res) => {
    // If it's a missing API route, don't serve index.html, return 404
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(indexPath);
  });
} else {
  console.log('[Server] Static build not found. Running in API-only mode.');
}

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT, 10) || 4000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  try {
    const logger = require('./lib/logger');
    logger.info('Server started', { host: HOST, port: PORT });
  } catch (e) {
    console.log(`[Server] JURIS backend running on http://${HOST}:${PORT}`);
  }
  
  // Initiating the background scraping pipelines
  initScrapers();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('[Server] SIGINT received — shutting down');
  server.close(() => process.exit(0));
});
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received — shutting down');
  server.close(() => process.exit(0));
});
