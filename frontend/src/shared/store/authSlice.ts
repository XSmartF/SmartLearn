import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { UserProfile } from 'firebase/auth';
import { createAuthAdapter, preloadFirestore } from '@/shared/services';
import { flushFirestoreQueue } from '../lib/firestoreQueue';

const adapter = createAuthAdapter();

type AuthUser = UserProfile & Record<string, unknown>;

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  initializing: boolean;
}

const initialState: AuthState = { user: null, loading: false, error: null, initializing: true };

export const signIn = createAsyncThunk('auth/signIn', (p: { email: string; password: string }) =>
  adapter.signInEmailPassword(p.email, p.password),
);
export const signUp = createAsyncThunk('auth/signUp', (p: { email: string; password: string; displayName?: string }) =>
  adapter.signUpEmailPassword(p.email, p.password, p.displayName),
);
export const signOut = createAsyncThunk('auth/signOut', () => adapter.signOut());
export const signInWithGoogle = createAsyncThunk('auth/signInWithGoogle', () => adapter.signInWithGoogle());

function pending(s: AuthState) { s.loading = true; s.error = null; }
function fulfilled(s: AuthState, user: unknown) { s.loading = false; s.user = user as AuthUser; }
function rejected(s: AuthState, msg: string | undefined, fallback: string) {
  s.loading = false;
  s.error = msg || fallback;
}

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.initializing = false;
      if (action.payload) { preloadFirestore(); flushFirestoreQueue(); }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(signIn.pending, pending)
      .addCase(signIn.fulfilled, (s, a) => fulfilled(s, a.payload))
      .addCase(signIn.rejected, (s, a) => rejected(s, a.error.message, 'Đăng nhập thất bại'))
      .addCase(signUp.pending, pending)
      .addCase(signUp.fulfilled, (s, a) => fulfilled(s, a.payload))
      .addCase(signUp.rejected, (s, a) => rejected(s, a.error.message, 'Đăng ký thất bại'))
      .addCase(signOut.pending, pending)
      .addCase(signOut.fulfilled, s => { s.loading = false; s.user = null; })
      .addCase(signOut.rejected, (s, a) => rejected(s, a.error.message, 'Đăng xuất thất bại'))
      .addCase(signInWithGoogle.pending, pending)
      .addCase(signInWithGoogle.fulfilled, (s, a) => fulfilled(s, a.payload))
      .addCase(signInWithGoogle.rejected, (s, a) => rejected(s, a.error.message, 'Google đăng nhập thất bại'));
  },
});

export const { setUser } = slice.actions;
export const authReducer = slice.reducer;

export function initAuthListener(dispatch: (a: unknown) => void) {
  adapter.onAuthStateChanged(u => dispatch(setUser(u)));
}
