import React, { useEffect, useState } from 'react';
import type { UserProfile } from '../lib/models';
import { type AuthAdapter } from '../lib/auth';
import { FirebaseAuthAdapter } from '../lib/firebaseAuthAdapter';
import { AuthContext } from './authContext';

// Using AuthContextValue from authContext.tsx

const adapter: AuthAdapter = new FirebaseAuthAdapter();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = adapter.onAuthStateChanged(u => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn = async (email: string, password: string) => {
    await adapter.signInEmailPassword(email, password);
  };
  const signUp = async (email: string, password: string, displayName?: string) => {
    await adapter.signUpEmailPassword(email, password, displayName);
  };
  const signOut = async () => { await adapter.signOut(); };
  // Cast to concrete adapter to access google method safely
  const signInWithGoogle = async () => { await (adapter as unknown as { signInWithGoogle: () => Promise<unknown> }).signInWithGoogle(); };

  return (
  <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook moved to separate file to satisfy fast refresh constraints.
