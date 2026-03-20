/**
 * Firestore Service
 * Common Firestore helpers used across routes to reduce duplication.
 */

const { db } = require('../lib/firebaseAdmin');

/**
 * Get a user document by UID.
 * @param {string} uid - Firebase Auth UID
 * @returns {object|null} User data or null if not found
 */
const getUserDoc = async (uid) => {
  const doc = await db.collection('users').doc(uid).get();
  return doc.exists ? doc.data() : null;
};

/**
 * Get a business document by its ID.
 * Optionally verifies ownership.
 * @param {string} businessId
 * @param {string} [ownerUid] - If provided, throws if ownerUid doesn't match
 * @returns {{ ref: FirebaseFirestore.DocumentReference, data: object }}
 */
const getBusinessById = async (businessId, ownerUid) => {
  const ref = db.collection('businesses').doc(businessId);
  const doc = await ref.get();

  if (!doc.exists) {
    const err = new Error('Business not found');
    err.status = 404;
    throw err;
  }

  if (ownerUid && doc.data().ownerUid !== ownerUid) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  return { ref, data: doc.data() };
};

/**
 * Get the first business owned by a given user UID.
 * @param {string} ownerUid
 * @returns {{ ref: FirebaseFirestore.DocumentReference, data: object }|null}
 */
const getBusinessByOwner = async (ownerUid) => {
  const snap = await db.collection('businesses')
    .where('ownerUid', '==', ownerUid)
    .limit(1)
    .get();

  if (snap.empty) return null;

  const doc = snap.docs[0];
  return { ref: doc.ref, data: doc.data() };
};

/**
 * Update a business's health score and label.
 * @param {FirebaseFirestore.DocumentReference} bizRef
 * @param {number} score
 * @param {string} label
 */
const updateBusinessScore = async (bizRef, score, label) => {
  await bizRef.update({
    healthScore: score,
    scoreLabel: label,
    updatedAt: new Date(),
  });
};

/**
 * Get all tasks for a business.
 * @param {FirebaseFirestore.DocumentReference} bizRef
 * @param {boolean} [applicableOnly=false] - If true, filter to isApplicable tasks
 * @returns {Array<object>} Array of task data objects
 */
const getBusinessTasks = async (bizRef, applicableOnly = false) => {
  const snap = await bizRef.collection('tasks').get();
  let tasks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (applicableOnly) {
    tasks = tasks.filter((t) => t.isApplicable);
  }
  return tasks;
};

module.exports = {
  getUserDoc,
  getBusinessById,
  getBusinessByOwner,
  updateBusinessScore,
  getBusinessTasks,
};
