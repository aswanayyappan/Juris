const express    = require('express');
const router     = express.Router();
const { db }     = require('../lib/firebaseAdmin');
const verify     = require('../middleware/verifyFirebaseToken');
const { calculateScore } = require('../services/scoreService');

/**
 * Helper: verify the authenticated user owns the given business.
 */
const getOwnedBusiness = async (businessId, uid) => {
  const doc = await db.collection('businesses').doc(businessId).get();
  if (!doc.exists) throw { status: 404, message: 'Business not found' };
  if (doc.data().ownerUid !== uid) throw { status: 403, message: 'Forbidden' };
  return { ref: doc.ref, data: doc.data() };
};

/**
 * GET /api/tasks/:businessId
 * Returns all applicable compliance tasks for a business.
 */
router.get('/:businessId', verify, async (req, res) => {
  const { businessId } = req.params;
  try {
    const { ref } = await getOwnedBusiness(businessId, req.user.uid);
    const snap = await ref.collection('tasks').get();
    const tasks = snap.docs.map((d) => d.data()).filter((t) => t.isApplicable);
    return res.json({ tasks });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Failed to fetch tasks' });
  }
});

/**
 * PATCH /api/tasks/:businessId/:taskId
 * Update task (e.g. mark as done). Recalculates health score after update.
 */
router.patch('/:businessId/:taskId', verify, async (req, res) => {
  const { businessId, taskId } = req.params;
  const updates = req.body; // { status, notes, ... }

  try {
    const { ref: bizRef } = await getOwnedBusiness(businessId, req.user.uid);
    const taskRef = bizRef.collection('tasks').doc(taskId);
    const taskDoc = await taskRef.get();
    if (!taskDoc.exists) return res.status(404).json({ error: 'Task not found' });

    const taskUpdate = { ...updates };
    if (updates.status === 'done') {
      taskUpdate.completedAt = new Date();
    }

    await taskRef.update(taskUpdate);

    // Recalculate score from all tasks
    const snap = await bizRef.collection('tasks').get();
    const allTasks = snap.docs.map((d) => d.data());
    const { score, label } = calculateScore(allTasks);
    await bizRef.update({ healthScore: score, scoreLabel: label, updatedAt: new Date() });

    return res.json({ message: 'Task updated', healthScore: score, scoreLabel: label });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Failed to update task' });
  }
});

module.exports = router;
