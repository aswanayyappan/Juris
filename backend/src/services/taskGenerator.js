/**
 * Task Generator Service
 * Given a business profile, returns an array of applicable compliance tasks
 * with pre-calculated due dates based on Indian compliance calendar.
 */

const { Timestamp } = require('firebase-admin/firestore');

// --- Date Helpers ---

/** Next occurrence of a specific day-of-month (e.g. 20th) */
function nextMonthly(dayOfMonth) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
  if (d <= now) d.setMonth(d.getMonth() + 1);
  return Timestamp.fromDate(d);
}

/** Quarterly due date — TDS is due on the 31st of Jan, Apr, Jul, Oct */
function nextQuarterly() {
  const now = new Date();
  const qMonths = [0, 3, 6, 9]; // Jan, Apr, Jul, Oct
  for (const m of qMonths) {
    const d = new Date(now.getFullYear(), m, 31);
    if (d > now) return Timestamp.fromDate(d);
  }
  // Wrap to next year
  return Timestamp.fromDate(new Date(now.getFullYear() + 1, 0, 31));
}

/** Next July 31st for ITR */
function nextJuly31() {
  const now = new Date();
  let year = now.getFullYear();
  const d = new Date(year, 6, 31); // month 6 = July
  if (d <= now) d.setFullYear(year + 1);
  return Timestamp.fromDate(d);
}

/** N days from now (e.g. ROC = 60 days, S&E = 365 days) */
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return Timestamp.fromDate(d);
}

// --- Task Generator ---

const generateTasks = (business) => {
  const { type, gstRegistered, employeeCount } = business;
  const tasks = [];

  const base = {
    status: 'pending',
    isApplicable: true,
    completedAt: null,
    notes: '',
    notifiedAt: { sevenDay: null, threeDay: null, oneDay: null, overdue: null },
  };

  // 1️⃣ GST — only if GST registered
  if (gstRegistered === true || gstRegistered === 'true') {
    tasks.push({
      ...base,
      complianceType: 'gst',
      label: 'GST Return (GSTR-3B)',
      dueDate: nextMonthly(20),
      penaltyInfo: 'Rs. 50/day late fee (minimum Rs. 200)',
    });
  }

  // 2️⃣ ROC — only Pvt Ltd and LLP
  if (['pvt_ltd', 'llp'].includes(type)) {
    tasks.push({
      ...base,
      complianceType: 'roc',
      label: 'ROC Annual Filing',
      dueDate: daysFromNow(60),
      penaltyInfo: 'Rs. 100/day. Directors can be disqualified.',
    });
  }

  // 3️⃣ ITR — all business types
  tasks.push({
    ...base,
    complianceType: 'itr',
    label: 'Income Tax Return',
    dueDate: nextJuly31(),
    penaltyInfo: 'Rs. 5,000 late filing penalty',
  });

  // 4️⃣ TDS — all business types
  tasks.push({
    ...base,
    complianceType: 'tds',
    label: 'TDS Filing (24Q / 26Q)',
    dueDate: nextQuarterly(),
    penaltyInfo: '1.5% per month interest + Rs. 200/day penalty',
  });

  // 5️⃣ PF/ESI — only if 10+ employees
  if (employeeCount === '10_plus') {
    tasks.push({
      ...base,
      complianceType: 'pf_esi',
      label: 'PF/ESI Monthly Contribution',
      dueDate: nextMonthly(15),
      penaltyInfo: '12% p.a. interest on delayed PF + damages',
    });
  }

  // 6️⃣ Shops & Establishment — all types
  tasks.push({
    ...base,
    complianceType: 'se',
    label: 'Shops & Establishment Renewal',
    dueDate: daysFromNow(365),
    penaltyInfo: 'Fine up to Rs. 2,500 depending on state',
  });

  return tasks;
};

module.exports = { generateTasks };
