/**
 * Status Updater Cron Job
 * Runs daily at 08:00 IST (02:30 UTC).
 * - Scans all tasks across all businesses.
 * - Transitions statuses: pending → due_soon → overdue.
 * - Fires reminder emails at 7-day, 3-day, 1-day, and overdue thresholds.
 * - Refreshes each business's healthScore.
 */

const cron    = require('node-cron');
const { db }  = require('../lib/firebaseAdmin');
const { calculateScore }      = require('../services/scoreService');
const { sendReminderEmail }   = require('../services/emailService');

// Helpers
const msInDay = 24 * 60 * 60 * 1000;

function daysUntil(firestoreTimestamp) {
  const due = firestoreTimestamp?.toDate ? firestoreTimestamp.toDate() : new Date(firestoreTimestamp);
  return Math.ceil((due - Date.now()) / msInDay);
}

// ── Main job ──────────────────────────────────────────────────────────────────
async function runStatusUpdate() {
  console.log('[Cron] Status updater started at', new Date().toISOString());

  try {
    const bizSnap = await db.collection('businesses').get();

    for (const bizDoc of bizSnap.docs) {
      const biz     = bizDoc.data();
      const bizRef  = bizDoc.ref;
      const tasksSnap = await bizRef.collection('tasks').get();

      if (tasksSnap.empty) continue;

      // Fetch owner email once per business
      let ownerEmail = '';
      try {
        const userDoc = await db.collection('users').doc(biz.ownerUid).get();
        ownerEmail = userDoc.data()?.email || '';
      } catch (_) { /* ignore */ }

      const batch = db.batch();
      const allTasks = [];

      for (const taskDoc of tasksSnap.docs) {
        const task    = taskDoc.data();
        const taskRef = taskDoc.ref;

        if (!task.isApplicable || task.status === 'done') {
          allTasks.push(task);
          continue;
        }

        const days         = daysUntil(task.dueDate);
        const notifiedAt   = task.notifiedAt || {};
        let newStatus      = task.status;
        const updates      = {};

        // Determine new status
        if (days < 0) {
          newStatus = 'overdue';
        } else if (days <= 7) {
          newStatus = 'due_soon';
        }

        if (newStatus !== task.status) {
          updates.status = newStatus;
        }

        // Send reminder emails at thresholds (fire once per threshold)
        if (days <= 1 && !notifiedAt.oneDay) {
          await sendReminderEmail(ownerEmail, biz.name, task, '1-day');
          updates['notifiedAt.oneDay'] = new Date();
        } else if (days <= 3 && !notifiedAt.threeDay) {
          await sendReminderEmail(ownerEmail, biz.name, task, '3-day');
          updates['notifiedAt.threeDay'] = new Date();
        } else if (days <= 7 && !notifiedAt.sevenDay) {
          await sendReminderEmail(ownerEmail, biz.name, task, '7-day');
          updates['notifiedAt.sevenDay'] = new Date();
        } else if (days < 0 && !notifiedAt.overdue) {
          await sendReminderEmail(ownerEmail, biz.name, task, 'overdue');
          updates['notifiedAt.overdue'] = new Date();
        }

        if (Object.keys(updates).length > 0) {
          batch.update(taskRef, updates);
        }

        allTasks.push({ ...task, status: newStatus });
      }

      // Recalculate score
      const { score, label } = calculateScore(allTasks);
      batch.update(bizRef, { healthScore: score, scoreLabel: label, updatedAt: new Date() });

      await batch.commit();
      console.log(`[Cron] Business "${biz.name}" updated — score: ${score} (${label})`);
    }

    console.log('[Cron] Status updater complete.');
  } catch (err) {
    console.error('[Cron] Unexpected error:', err.message);
  }
}

// ── Schedule: 08:00 IST = 02:30 UTC ──────────────────────────────────────────
cron.schedule('30 2 * * *', runStatusUpdate, {
  timezone: 'Asia/Kolkata',
});

// Optional: for development/testing — expose a manual trigger
module.exports = { runStatusUpdate };
