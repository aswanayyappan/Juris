const express = require('express');
const router = express.Router();
const { db } = require('../lib/firebaseAdmin');
const { Timestamp } = require('firebase-admin/firestore');
const verify = require('../middleware/verifyFirebaseToken');
const { generateSyntheticRegTechData } = require('../services/dataGenerator');

/**
 * POST /api/businesses
 * Creates a new business profile and auto-generates compliance tasks.
 * Also stores ownerEmail for email reminders and calculates initial score.
 */
router.post('/', verify, async (req, res) => {
  const { name, type, state, cin } = req.body;
  const ownerUid = req.user.uid;

  if (!name || !type || !state) {
    return res.status(400).json({ error: 'name, type, and state are required' });
  }

  try {
    // Enforce Strict Single-Tenant Topology: Clear any existing 'ghost' business fragments for the user
    // This directly solves the bug where stale duplicate entities override newly registered frontend payloads.
    const existingSnap = await db.collection('businesses').where('ownerUid', '==', ownerUid).get();
    if (!existingSnap.empty) {
      const purgeBatch = db.batch();
      for (const doc of existingSnap.docs) {
        const existingTasks = await doc.ref.collection('tasks').get();
        existingTasks.docs.forEach((t) => purgeBatch.delete(t.ref));
        purgeBatch.delete(doc.ref);
      }
      await purgeBatch.commit();
    }

    // Fetch owner email from /users collection for email reminders
    let ownerEmail = req.user.email || '';
    try {
      const userDoc = await db.collection('users').doc(ownerUid).get();
      if (userDoc.exists) ownerEmail = userDoc.data().email || ownerEmail;
    } catch (_) { /* use fallback email */ }

    const bizRef = db.collection('businesses').doc();
    const syntheticData = generateSyntheticRegTechData({ name, type, state, cin });

    // Batch: create business + all tasks atomically
    const batch = db.batch();

    batch.set(bizRef, {
      businessId: bizRef.id,
      ownerUid,
      ownerEmail,
      name,
      type,
      state,
      cin: cin || syntheticData.company.cin,
      gstRegistered: true,
      employeeCount: syntheticData.company.employees,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      syntheticData // Append the rich monolithic array natively into the DB!
    });

    for (const item of syntheticData.checklist) {
      const taskRef = bizRef.collection('tasks').doc();
      batch.set(taskRef, {
        taskId: taskRef.id,
        name: item.task,
        category: item.category,
        dueDate: item.due,
        status: item.status === 'Missed' ? 'overdue' : item.status.toLowerCase(),
      });
    }

    await batch.commit();

    // Mark onboarding complete for user
    // Mark onboarding complete and link businessId to user
    await db.collection('users').doc(ownerUid).set({ 
      onboardingDone: true,
      businessId: bizRef.id 
    }, { merge: true });

    return res.status(201).json({
      message: 'Business created',
      businessId: bizRef.id,
      healthScore: syntheticData.summary.compliance_health,
      scoreLabel: syntheticData.summary.status,
    });
  } catch (err) {
    const path = require('path');
    const logPath = path.resolve(__dirname, '..', '..', 'juris_create_error.log');
    require('fs').writeFileSync(logPath, `${new Date().toISOString()} - ${err.stack}\n`);
    console.error('[Business] Create error:', err);
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
      const syntheticData = generateSyntheticRegTechData(newData);

      // Delete existing tasks, write new checklist, and update monolithic synthetic data
      const existingTasks = await bizRef.collection('tasks').get();
      const taskBatch = db.batch();
      existingTasks.docs.forEach((d) => taskBatch.delete(d.ref));
      
      taskBatch.update(bizRef, {
        healthScore: syntheticData.summary.compliance_health,
        scoreLabel: syntheticData.summary.status,
        syntheticData 
      });

      for (const item of syntheticData.checklist) {
        const taskRef = bizRef.collection('tasks').doc();
        taskBatch.set(taskRef, {
          taskId: taskRef.id,
          name: item.task,
          category: item.category,
          dueDate: item.due,
          status: item.status === 'Missed' ? 'overdue' : item.status.toLowerCase(),
        });
      }
      await taskBatch.commit();
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

/**
 * DELETE /api/businesses/:id
 * Deletes a business profile and all its associated tasks.
 */
router.delete('/:id', verify, async (req, res) => {
  const { id } = req.params;
  try {
    const bizRef = db.collection('businesses').doc(id);
    const doc = await bizRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Business not found' });
    if (doc.data().ownerUid !== req.user.uid) return res.status(403).json({ error: 'Forbidden' });

    // Delete all associated compliance tasks in the sub-collection
    const existingTasks = await bizRef.collection('tasks').get();
    const batch = db.batch();
    existingTasks.docs.forEach((d) => batch.delete(d.ref));

    // Delete the physical business entity document
    batch.delete(bizRef);

    await batch.commit();

    return res.json({ message: 'Business deleted successfully' });
  } catch (err) {
    console.error('[Business] Delete error:', err.message);
    return res.status(500).json({ error: 'Failed to delete business' });
  }
});

module.exports = router;
