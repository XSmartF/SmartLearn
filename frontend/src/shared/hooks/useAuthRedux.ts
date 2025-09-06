import { useAppSelector, useAppDispatch } from '@/shared/store/hooks';
import { signIn, signUp, signOut, signInWithGoogle } from '../store/authSlice';
import type { RootState } from '../store/store';
import type { AuthState } from '../store/authSlice';

export function useAuth() {
  const { user, loading, error, initializing } = useAppSelector((s: RootState) => s.auth as AuthState);
  const dispatch = useAppDispatch();
  return {
    user,
    loading: loading || initializing,
    initializing,
    error,
    signIn: (email: string, password: string) => dispatch(signIn({ email, password })).unwrap(),
    signUp: (email: string, password: string, displayName?: string) => dispatch(signUp({ email, password, displayName })).unwrap(),
    signOut: () => dispatch(signOut()).unwrap(),
    signInWithGoogle: () => dispatch(signInWithGoogle()).unwrap(),
  };
}
