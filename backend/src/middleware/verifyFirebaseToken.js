const { auth } = require('../lib/firebaseAdmin');

const verifyFirebaseToken = async (req, res, next) => {
  // ── DEV-ONLY test bypass (never runs in production) ───────────────────────
  if (process.env.NODE_ENV !== 'production' && req.headers['x-test-uid']) {
    req.user = { uid: req.headers['x-test-uid'], email: 'test@juris.dev' };
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decoded = await auth.verifyIdToken(token);
    req.user = decoded; // uid, email, etc. now available on req
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = verifyFirebaseToken;
