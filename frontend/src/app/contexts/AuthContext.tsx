import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { mapAuthUser, signOut as authSignOut, AuthState, UserProfile, AUTH_CHANNEL } from '../utils/auth';

interface AuthContextType extends AuthState {
  loading: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Persistent listener — fires on every login/logout automatically
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const state = await mapAuthUser(firebaseUser);
      setAuthState(state);
      setLoading(false);
    });

    // Cross-tab sign-out: listen for SIGN_OUT from other tabs
    const channel = new BroadcastChannel(AUTH_CHANNEL);
    channel.onmessage = (event) => {
      if (event.data?.type === 'SIGN_OUT') {
        firebaseSignOut(auth).catch(() => {});
        localStorage.removeItem('fb_id_token');
        setAuthState({ isAuthenticated: false, user: null, accessToken: null });
      }
    };

    return () => {
      unsubscribe();
      channel.close();
    };
  }, []);

  const refreshAuth = async () => {
    const { getAuthState } = await import('../utils/auth');
    const state = await getAuthState();
    setAuthState(state);
  };

  const signOut = async () => {
    await authSignOut();
    setAuthState({ isAuthenticated: false, user: null, accessToken: null });
  };

  return (
    <AuthContext.Provider value={{ ...authState, loading, signOut, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
