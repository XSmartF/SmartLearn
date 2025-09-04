import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { UserProfile } from '@/lib/models';
import { FirebaseAuthAdapter } from '@/lib/firebaseAuthAdapter';
import { preloadFirestore } from '@/lib/firebaseClient';
import { flushFirestoreQueue } from '@/lib/firestoreQueue';

const adapter = new FirebaseAuthAdapter();

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  initializing: boolean; // first load
}

const initialState: AuthState = { user: null, loading: false, error: null, initializing: true };

export const signIn = createAsyncThunk('auth/signIn', async (p: { email: string; password: string }) => {
  const u = await adapter.signInEmailPassword(p.email, p.password); return u;
});
export const signUp = createAsyncThunk('auth/signUp', async (p: { email: string; password: string; displayName?: string }) => {
  const u = await adapter.signUpEmailPassword(p.email, p.password, p.displayName); return u;
});
export const signOut = createAsyncThunk('auth/signOut', async () => { await adapter.signOut(); });
export const signInWithGoogle = createAsyncThunk('auth/signInWithGoogle', async () => { const u = await adapter.signInWithGoogle(); return u; });

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) { state.user = action.payload; state.initializing = false; if(action.payload) { preloadFirestore(); flushFirestoreQueue(); } }
  },
  extraReducers: builder => {
    builder
      .addCase(signIn.pending, s=> { s.loading = true; s.error = null; })
      .addCase(signIn.fulfilled, (s,a)=> { s.loading=false; s.user=a.payload; })
      .addCase(signIn.rejected, (s,a)=> { s.loading=false; s.error=a.error.message||'Đăng nhập thất bại'; })
      .addCase(signUp.pending, s=> { s.loading = true; s.error = null; })
      .addCase(signUp.fulfilled, (s,a)=> { s.loading=false; s.user=a.payload; })
      .addCase(signUp.rejected, (s,a)=> { s.loading=false; s.error=a.error.message||'Đăng ký thất bại'; })
      .addCase(signOut.pending, s=> { s.loading = true; s.error = null; })
      .addCase(signOut.fulfilled, s=> { s.loading=false; s.user=null; })
      .addCase(signOut.rejected, (s,a)=> { s.loading=false; s.error=a.error.message||'Đăng xuất thất bại'; })
      .addCase(signInWithGoogle.pending, s=> { s.loading=true; s.error=null; })
      .addCase(signInWithGoogle.fulfilled, (s,a)=> { s.loading=false; s.user=a.payload; })
      .addCase(signInWithGoogle.rejected, (s,a)=> { s.loading=false; s.error=a.error.message||'Google đăng nhập thất bại'; });
  }
});

export const { setUser } = slice.actions;
export const authReducer = slice.reducer;

export function initAuthListener(dispatch: (a: unknown)=>void) {
  adapter.onAuthStateChanged(u => { dispatch(setUser(u)); });
}
