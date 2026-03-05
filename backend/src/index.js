require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    const allowedFrontend = process.env.FRONTEND_URL;
    // allow server-to-server requests (no origin), localhost dev, or configured FRONTEND_URL
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

// ── Routes ────────────────────────────────────────────────────────────────────
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

// ── Serve frontend (single-port deployment) ───────────────────────────────────
// The frontend should be built into `frontend/dist`. API routes take precedence.
const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
try {
  app.use(express.static(frontendDist));

  // Serve index.html for any non-API GET requests (SPA fallback)
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} catch (err) {
  console.warn('[Server] Frontend static not available:', err.message);
}

// ── Health check (PRD: GET /api/health) ───────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

// ── Manual cron trigger (DEV ONLY) ───────────────────────────────────────────
app.get('/api/cron/trigger', async (_req, res) => {
  const { runStatusUpdate } = require('./cron/statusUpdater');
  runStatusUpdate().catch(err => console.error('[Cron] Manual trigger error:', err.message));
  return res.json({ message: 'Cron job triggered (running in background)' });
});

// ── Start cron job (scheduled) ────────────────────────────────────────────────
require('./cron/statusUpdater');

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT, 10) || 4000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  // Prefer structured logging if available
  try {
    const logger = require('./lib/logger');
    logger.info('Server started', { host: HOST, port: PORT });
  } catch (e) {
    console.log(`[Server] JURIS backend running on http://${HOST}:${PORT}`);
  }
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
