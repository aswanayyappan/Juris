const express    = require('express');
const router     = express.Router();
const { db }     = require('../lib/firebaseAdmin');
const { Timestamp } = require('firebase-admin/firestore');
const verify     = require('../middleware/verifyFirebaseToken');
const { generateTasks } = require('../services/taskGenerator');
const { calculateScore } = require('../services/scoreService');

/**
 * POST /api/businesses
 * Creates a new business profile and auto-generates compliance tasks.
 * Also stores ownerEmail for email reminders and calculates initial score.
 */
router.post('/', verify, async (req, res) => {
  const { name, type, state, gstRegistered, employeeCount } = req.body;
  const ownerUid = req.user.uid;

  if (!name || !type || !state) {
    return res.status(400).json({ error: 'name, type, and state are required' });
  }

  try {
    // Fetch owner email from /users collection for email reminders
    let ownerEmail = req.user.email || '';
    try {
      const userDoc = await db.collection('users').doc(ownerUid).get();
      if (userDoc.exists) ownerEmail = userDoc.data().email || ownerEmail;
    } catch (_) { /* use fallback email */ }

    const bizRef = db.collection('businesses').doc();
    const tasks  = generateTasks({ type, gstRegistered, employeeCount });

    // Calculate initial health score from generated tasks
    const { score: initialScore, label: initialLabel } = calculateScore(tasks);

    // Batch: create business + all tasks atomically
    const batch = db.batch();

    batch.set(bizRef, {
      businessId:    bizRef.id,
      ownerUid,
      ownerEmail,
      name,
      type,
      state,
      gstRegistered: Boolean(gstRegistered),
      employeeCount: employeeCount || '0_10',
      healthScore:   initialScore,
      scoreLabel:    initialLabel,
      createdAt:     Timestamp.now(),
      updatedAt:     Timestamp.now(),
    });

    for (const task of tasks) {
      const taskRef = bizRef.collection('tasks').doc();
      batch.set(taskRef, { ...task, taskId: taskRef.id });
    }

    await batch.commit();

    // Mark onboarding complete for user
    await db.collection('users').doc(ownerUid).update({ onboardingDone: true });

    return res.status(201).json({
      message: 'Business created',
      businessId: bizRef.id,
      healthScore: initialScore,
      scoreLabel: initialLabel,
    });
  } catch (err) {
    console.error('[Business] Create error:', err.message);
    return res.status(500).json({ error: 'Failed to create business' });
  }
});

/**
 * GET /api/businesses/:id
 * Returns business profile and the current health score.
 */
router.get('/:id', verify, async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection('businesses').doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Business not found' });
    if (doc.data().ownerUid !== req.user.uid) return res.status(403).json({ error: 'Forbidden' });

    return res.json({ business: doc.data() });
  } catch (err) {
    console.error('[Business] Get error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch business' });
  }
});

/**
 * PATCH /api/businesses/:id
 * Updates business profile and regenerates tasks if profile changed.
 */
router.patch('/:id', verify, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const bizRef = db.collection('businesses').doc(id);
    const doc = await bizRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Business not found' });
    if (doc.data().ownerUid !== req.user.uid) return res.status(403).json({ error: 'Forbidden' });

    const profileChanged =
      updates.type !== undefined ||
      updates.gstRegistered !== undefined ||
      updates.employeeCount !== undefined;

    await bizRef.update({ ...updates, updatedAt: Timestamp.now() });

    // If profile changed, re-generate tasks and recalculate score
    if (profileChanged) {
      const newData = { ...doc.data(), ...updates };
      const tasks   = generateTasks(newData);

      // Delete existing tasks, then write new ones
      const existingTasks = await bizRef.collection('tasks').get();
      const batch = db.batch();
      existingTasks.docs.forEach((d) => batch.delete(d.ref));
      for (const task of tasks) {
        const taskRef = bizRef.collection('tasks').doc();
        batch.set(taskRef, { ...task, taskId: taskRef.id });
      }
      await batch.commit();

      // Recalculate health score
      const { score, label } = calculateScore(tasks);
      await bizRef.update({ healthScore: score, scoreLabel: label });
    }

    return res.json({ message: 'Business updated' });
  } catch (err) {
    console.error('[Business] Update error:', err.message);
    return res.status(500).json({ error: 'Failed to update business' });
  }
});

/**
 * GET /api/businesses
 * Returns the authenticated user's business profile (first match by ownerUid).
 */
router.get('/', verify, async (req, res) => {
  try {
    const snap = await db.collection('businesses')
      .where('ownerUid', '==', req.user.uid)
      .limit(1)
      .get();

    if (snap.empty) return res.status(404).json({ error: 'No business found' });
    return res.json({ business: snap.docs[0].data() });
  } catch (err) {
    console.error('[Business] List error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch business' });
  }
});

module.exports = router;
