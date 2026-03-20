const admin = require("firebase-admin");

let db   = null;
let auth = null;

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      }),
    });
  }
  db   = admin.firestore();
  auth = admin.auth();
  console.log("[Firebase] Admin SDK initialized ✅");
} catch (err) {
  console.warn("[Firebase] ⚠️  Admin SDK NOT initialized — missing credentials.");
  console.warn("           Create backend/.env from .env.example and fill in your values.");
  console.warn("           Detail:", err.message);
}

module.exports = { admin, db, auth };

