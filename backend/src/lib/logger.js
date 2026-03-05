const util = require('util');

function redactString(s) {
  if (typeof s !== 'string') return s;
  // redact emails
  s = s.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[REDACTED_EMAIL]');
  // redact long hex-like ids (uid tokens)
  s = s.replace(/\b[0-9a-fA-F]{8,}\b/g, '[REDACTED_ID]');
  return s;
}

function redact(obj) {
  if (obj == null) return obj;
  if (typeof obj === 'string') return redactString(obj);
  try {
    const str = typeof obj === 'object' ? JSON.stringify(obj) : String(obj);
    return redactString(str);
  } catch (e) {
    return String(obj);
  }
}

function formatLog(level, msg, meta) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message: redact(msg),
  };
  if (meta !== undefined) {
    entry.meta = redact(meta);
  }
  return JSON.stringify(entry);
}

module.exports = {
  info: (msg, meta) => console.log(formatLog('info', msg, meta)),
  warn: (msg, meta) => console.warn(formatLog('warn', msg, meta)),
  error: (msg, meta) => console.error(formatLog('error', msg, meta)),
  redact,
};
