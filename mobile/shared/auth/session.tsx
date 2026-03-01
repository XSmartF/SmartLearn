import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService, type MobileAuthUser } from '@/shared/services';

interface SessionContextValue {
  user: MobileAuthUser | null;
  loading: boolean;
  signInEmailPassword: (email: string, password: string) => Promise<void>;
  signUpEmailPassword: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MobileAuthUser | null>(authService.getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = authService.listenAuthState((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      loading,
      signInEmailPassword: async (email: string, password: string) => {
        await authService.signInEmailPassword(email, password);
      },
      signUpEmailPassword: async (email: string, password: string, displayName?: string) => {
        await authService.signUpEmailPassword(email, password, displayName);
      },
      signOut: async () => {
        await authService.signOut();
      },
    }),
    [loading, user]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside SessionProvider');
  return value;
}
