require('dotenv').config();
const { db } = require('./src/lib/firebaseAdmin');

async function test() {
  console.log('Testing Firestore connectivity...');
  const timeout = setTimeout(() => {
    console.error('Firestore request timed out after 10s');
    process.exit(1);
  }, 10000);

  try {
    const snap = await db.collection('businesses').limit(1).get();
    clearTimeout(timeout);
    console.log('Firestore OK! Found docs:', snap.size);
    process.exit(0);
  } catch (err) {
    clearTimeout(timeout);
    console.error('Firestore Error:', err.message);
    process.exit(1);
  }
}

test();
