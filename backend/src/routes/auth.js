const express   = require('express');
const router    = express.Router();
const { db, auth } = require('../lib/firebaseAdmin');
const { Timestamp } = require('firebase-admin/firestore');
const verify = require('../middleware/verifyFirebaseToken');
const logger = require('../lib/logger');

/**
 * POST /api/auth/login
 * Called by the frontend after Firebase client-side sign-in.
 * Expects:  Authorization: Bearer <firebase_id_token>
 * Returns:  Full user profile JSON (creates profile if first login)
 */
router.post('/login', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  let decoded;
  try {
    decoded = await auth.verifyIdToken(token);
  } catch (err) {
    console.error('[Auth] Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { uid, email, name: displayName } = decoded;

  try {
    const userRef = db.collection('users').doc(uid);
    let snap = await userRef.get();

    if (!snap.exists) {
      // First-time login — auto-create the profile
      const newProfile = {
        uid,
        email,
        displayName: decoded.name || decoded.display_name || 'User',
        role: 'user',
        credits: 5,
        createdAt: Timestamp.now(),
        onboardingDone: false,
      };
      await userRef.set(newProfile);
      snap = await userRef.get();
      logger.info('New user auto-created', { email, uid });
    }

    const profile = { id: snap.id, ...snap.data() };
    // Convert Firestore Timestamps to ISO strings for the client
    if (profile.createdAt && profile.createdAt.toDate) {
      profile.createdAt = profile.createdAt.toDate().toISOString();
    }

    // Initialize express-session state tracking locally
    req.session.user = {
      uid: profile.uid,
      email: profile.email,
      role: profile.role,
      displayName: profile.displayName
    };

    logger.info('User login and session initialized', { email, uid });
    return res.status(200).json(profile);
  } catch (err) {
    console.error('[Auth] Login error:', err.message);
    return res.status(500).json({ error: 'Failed to process login' });
  }
});

/**
 * GET /api/auth/me
 * Returns current user's profile based on token.
 */
router.get('/me', verify, async (req, res) => {
  try {
    const userRef = db.collection('users').doc(req.user.uid);
    const snap = await userRef.get();
    if (!snap.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    return res.json({ user: snap.data() });
  } catch (err) {
    console.error('[Auth] Get /me error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * POST /api/auth/logout
 * Expects:  Authorization: Bearer <firebase_id_token>
 * Revokes all Firebase refresh tokens for this user so any
 * other sessions / tabs with cached tokens are invalidated.
 */
router.post('/logout', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decoded = await auth.verifyIdToken(token);
    // Revoke all refresh tokens → forces every other session to re-authenticate
    await auth.revokeRefreshTokens(decoded.uid);
    
    // Terminate local Express session
    req.session.destroy((err) => {
      if (err) console.error('[Auth] Error destroying express session:', err);
    });
    res.clearCookie('connect.sid'); // Clear the default session cookie framework
    
    logger.info('User logout & tokens revoked, session destroyed', { email: decoded.email, uid: decoded.uid });
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('[Auth] Logout error:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
});

/**
 * POST /api/auth/register
 * Legacy endpoint — kept for compatibility.
 * Prefer using /api/auth/login which auto-registers on first use.
 */
router.post('/register', async (req, res) => {
  const { uid, email, displayName, role } = req.body;

  if (!uid || !email) {
    return res.status(400).json({ error: 'uid and email are required' });
  }

  try {
    const userRef = db.collection('users').doc(uid);
    const existing = await userRef.get();

    if (existing.exists) {
      return res.status(200).json({ message: 'User already exists', uid });
    }

    await userRef.set({
      uid,
      email,
      displayName: displayName || 'User',
      role: role || 'user',
      credits: 5,
      createdAt: Timestamp.now(),
      onboardingDone: false,
    });

    logger.info('New user registered', { email, uid });
    return res.status(201).json({ message: 'User created', uid });
  } catch (err) {
    console.error('[Auth] Register error:', err.message);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

module.exports = router;

