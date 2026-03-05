/**
 * GET /api/library
 * Static legal library articles — no auth required.
 * Returns all 6 compliance articles with slug, title, and summary.
 */

const express = require('express');
const router  = express.Router();

const ARTICLES = [
  {
    slug:    'gst',
    title:   'What is GST Filing and what happens if you miss it?',
    topic:   'GST',
    summary: 'GST (Goods and Services Tax) registered businesses must file GSTR-3B monthly by the 20th. Late filing attracts Rs. 50/day (min Rs. 200). Nil returns still need to be filed.',
    duePattern: '20th of every month',
    penaltyInfo: 'Rs. 50/day late fee, minimum Rs. 200. Interest at 18% p.a. on unpaid tax.',
  },
  {
    slug:    'roc',
    title:   'What is ROC Annual Filing and why do directors care?',
    topic:   'ROC',
    summary: 'Private Limited Companies and LLPs must file annual returns with the Registrar of Companies (ROC) within 60 days of the AGM. Non-compliance leads to director disqualification.',
    duePattern: 'Within 60 days of AGM (typically Oct–Nov)',
    penaltyInfo: 'Rs. 100/day. Directors can be struck off and disqualified from future directorships.',
  },
  {
    slug:    'itr',
    title:   'Income Tax for Businesses — what every founder must know',
    topic:   'ITR',
    summary: 'Every business must file an Income Tax Return by July 31st (Oct 31st if audit required). Even loss-making companies must file to carry forward losses.',
    duePattern: 'July 31st each year (or Oct 31st with audit)',
    penaltyInfo: 'Rs. 5,000 late filing penalty. Losses cannot be carried forward if ITR is filed late.',
  },
  {
    slug:    'tds',
    title:   'What is TDS and when does your startup need to file it?',
    topic:   'TDS',
    summary: 'If your startup makes salary payments, contractor payments, or rent above thresholds, you must deduct TDS and file quarterly returns (24Q/26Q) by the 31st of Jan, Apr, Jul, Oct.',
    duePattern: '31st of Jan, Apr, Jul, Oct (quarterly)',
    penaltyInfo: '1.5% per month interest on delayed payment + Rs. 200/day penalty for late filing.',
  },
  {
    slug:    'pf-esi',
    title:   'PF and ESI explained — when it applies and what it costs',
    topic:   'PF/ESI',
    summary: 'Businesses with 10 or more employees must register for PF (Provident Fund) and ESI (Employee State Insurance). Monthly contributions are due by the 15th.',
    duePattern: '15th of every month',
    penaltyInfo: '12% p.a. interest on delayed PF contributions + damages up to 25% of arrears.',
  },
  {
    slug:    'se',
    title:   'Shops & Establishment Act — what it is and how to renew',
    topic:   'S&E',
    summary: 'Every business with a physical office or store must register under the Shops & Establishment Act of its state. The registration must be renewed annually.',
    duePattern: 'Annually (date varies by state)',
    penaltyInfo: 'Fine up to Rs. 2,500 depending on state. Some states penalise per-day non-compliance.',
  },
];

router.get('/', (_req, res) => {
  return res.json({ articles: ARTICLES });
});

router.get('/:slug', (req, res) => {
  const article = ARTICLES.find((a) => a.slug === req.params.slug);
  if (!article) return res.status(404).json({ error: 'Article not found' });
  return res.json({ article });
});

module.exports = router;
