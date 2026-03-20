const express  = require('express');
const router   = express.Router();
const { db }   = require('../lib/firebaseAdmin');
const verify   = require('../middleware/verifyFirebaseToken');
const { sendReminderEmail } = require('../services/emailService');

/**
 * POST /api/notifications/send
 * Manually trigger a reminder email for a specific task.
 * Body: { businessId, taskId, type } — type: '7-day' | '3-day' | '1-day' | 'overdue' | 'done'
 */
router.post('/send', verify, async (req, res) => {
  const { businessId, taskId, type } = req.body;

  if (!businessId || !taskId || !type) {
    return res.status(400).json({ error: 'businessId, taskId, and type are required' });
  }

  try {
    const bizDoc  = await db.collection('businesses').doc(businessId).get();
    if (!bizDoc.exists) return res.status(404).json({ error: 'Business not found' });
    if (bizDoc.data().ownerUid !== req.user.uid) return res.status(403).json({ error: 'Forbidden' });

    const taskDoc = await bizDoc.ref.collection('tasks').doc(taskId).get();
    if (!taskDoc.exists) return res.status(404).json({ error: 'Task not found' });

    // Fetch owner email from /users collection
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const ownerEmail = userDoc.data()?.email || req.user.email;

    await sendReminderEmail(ownerEmail, bizDoc.data().name, taskDoc.data(), type);
    return res.json({ message: `Reminder email (${type}) sent` });
  } catch (err) {
    console.error('[Notifications] Send error:', err.message);
    return res.status(500).json({ error: 'Failed to send email' });
  }
});

module.exports = router;
