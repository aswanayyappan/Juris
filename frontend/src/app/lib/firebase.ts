import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace placeholders with real values from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDPakqYoUq931MkzemlhfQOnCyCIAzpU1Q",
  authDomain: "real-juris.firebaseapp.com",
  projectId: "real-juris",
  storageBucket: "real-juris.firebasestorage.app",
  messagingSenderId: "10910411904",
  appId: "1:10910411904:web:7c0a79c83fa81fe8920a65",
  measurementId: "G-W18E52Z813"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
