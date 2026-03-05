const express  = require('express');
const router   = express.Router();
const { db }   = require('../lib/firebaseAdmin');
const verify   = require('../middleware/verifyFirebaseToken');

/**
 * GET /api/score/:businessId
 * Returns the current health score and label for a business.
 */
router.get('/:businessId', verify, async (req, res) => {
  const { businessId } = req.params;
  try {
    const doc = await db.collection('businesses').doc(businessId).get();
    if (!doc.exists) return res.status(404).json({ error: 'Business not found' });
    if (doc.data().ownerUid !== req.user.uid) return res.status(403).json({ error: 'Forbidden' });

    const { healthScore, scoreLabel } = doc.data();
    return res.json({ healthScore, scoreLabel });
  } catch (err) {
    console.error('[Score] Get error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch score' });
  }
});

module.exports = router;
