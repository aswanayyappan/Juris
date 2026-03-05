import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  getIdToken,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { api } from "./api";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'legal_assistant';
  credits: number;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  accessToken: string | null;
}

/**
 * After Firebase client-side login, call backend /api/auth/login.
 * The backend verifies the token, fetches/creates the profile, and returns it.
 */
export const mapAuthUser = async (firebaseUser: User | null): Promise<AuthState> => {
  if (!firebaseUser) {
    return { isAuthenticated: false, user: null, accessToken: null };
  }

  try {
    const token = await getIdToken(firebaseUser);
    localStorage.setItem('fb_id_token', token);

    // Delegate all profile logic to the backend
    const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/login`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[Auth] Backend login failed:', response.status);
      return { isAuthenticated: false, user: null, accessToken: null };
    }

    const profile: UserProfile = await response.json();

    return {
      isAuthenticated: true,
      user: profile,
      accessToken: token,
    };
  } catch (error) {
    console.error('[Auth] mapAuthUser error:', error);
    return { isAuthenticated: false, user: null, accessToken: null };
  }
};

export const getAuthState = (): Promise<AuthState> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      const state = await mapAuthUser(user);
      resolve(state);
    });
  });
};

export const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  return userCredential.user;
};

export const signUp = async (email: string, password: string, name: string, role: 'user' | 'legal_assistant') => {
  // 1. Create user in Firebase
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // 2. Register user in local backend
  await api.post('/auth/register', {
    uid: user.uid,
    email: user.email,
    displayName: name,
    role: role
  });

  return user;
};

// Shared channel for cross-tab auth sync
export const AUTH_CHANNEL = 'juris:auth';

export const signOut = async () => {
  await firebaseSignOut(auth);
  localStorage.removeItem('fb_id_token');
};