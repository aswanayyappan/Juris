/**
 * Email Service
 * Sends compliance reminder emails using Resend.
 * Resend is lazy-initialized on first use so the server starts
 * even when RESEND_API_KEY is not yet set.
 */

const { Resend } = require('resend');

let _resend = null;
const getResend = () => {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('[Email] RESEND_API_KEY not set — emails will be skipped.');
      return null;
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
};

const FROM_EMAIL = process.env.FROM_EMAIL || 'JURIS <reminders@yourdomain.com>';

const subjects = {
  '7-day':  (label) => `Reminder: ${label} is due in 7 days — JURIS`,
  '3-day':  (label) => `Action needed: ${label} due in 3 days — JURIS`,
  '1-day':  (label) => `Urgent: ${label} is due TOMORROW — JURIS`,
  'overdue':(label) => `Overdue: ${label} was missed — JURIS`,
  'done':   (label) => `Done: ${label} marked complete. Score updated — JURIS`,
};

const sendReminderEmail = async (ownerEmail, businessName, task, type) => {
  if (!ownerEmail) return;

  const resend = getResend();
  if (!resend) return; // silently skip if no API key

  const dueDate = task.dueDate?.toDate
    ? task.dueDate.toDate().toDateString()
    : 'N/A';

  try {
    await resend.emails.send({
      from:    FROM_EMAIL,
      to:      ownerEmail,
      subject: subjects[type](task.label),
      text: `Hi ${businessName},

This is a reminder about: ${task.label}

Due Date    : ${dueDate}
Penalty     : ${task.penaltyInfo}

Log in to JURIS to manage your compliance:
${process.env.FRONTEND_URL || 'https://yourdomain.com'}/dashboard

— The JURIS Team`.trim(),
    });
      const logger = require('../lib/logger');
      logger.info('Email: sent', { to: ownerEmail, subject: subjects[type](task.label) });
  } catch (err) {
    const logger = require('../lib/logger');
    logger.error('Email send failed', { error: err.message });
  }
};

module.exports = { sendReminderEmail };

