import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithCredential,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDb, getFirebaseAuth } from '@/shared/firebase/client';

export interface MobileAuthUser {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

function mapUser(user: User | null): MobileAuthUser | null {
  if (!user) return null;
  return {
    id: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? undefined,
    avatarUrl: user.photoURL ?? undefined,
  };
}

export class FirebaseMobileAuthService {
  private readonly auth = getFirebaseAuth();
  private readonly db = getDb();

  getCurrentUser(): MobileAuthUser | null {
    return mapUser(this.auth.currentUser);
  }

  listenAuthState(callback: (user: MobileAuthUser | null) => void): () => void {
    return onAuthStateChanged(this.auth, (user) => callback(mapUser(user)));
  }

  async signInEmailPassword(email: string, password: string): Promise<MobileAuthUser> {
    const credential = await signInWithEmailAndPassword(this.auth, email.trim(), password);
    const mapped = mapUser(credential.user);
    if (!mapped) throw new Error('Unable to map signed in user');
    return mapped;
  }

  async signUpEmailPassword(email: string, password: string, displayName?: string): Promise<MobileAuthUser> {
    const credential = await createUserWithEmailAndPassword(this.auth, email.trim(), password);

    if (displayName?.trim()) {
      await updateProfile(credential.user, { displayName: displayName.trim() });
    }

    await setDoc(
      doc(this.db, 'users', credential.user.uid),
      {
        email: credential.user.email ?? email.trim().toLowerCase(),
        displayName: displayName?.trim() ?? null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    const mapped = mapUser(credential.user);
    if (!mapped) throw new Error('Unable to map signed up user');
    return mapped;
  }

  async signInWithGoogle(idToken: string, accessToken?: string | null): Promise<MobileAuthUser> {
    const credential = GoogleAuthProvider.credential(idToken, accessToken ?? undefined);
    const result = await signInWithCredential(this.auth, credential);

    // ensure user document exists/updated
    await setDoc(
      doc(this.db, 'users', result.user.uid),
      {
        email: result.user.email ?? null,
        displayName: result.user.displayName ?? null,
        avatarUrl: result.user.photoURL ?? null,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    const mapped = mapUser(result.user);
    if (!mapped) throw new Error('Unable to map Google signed in user');
    return mapped;
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
  }
}

export const authService = new FirebaseMobileAuthService();
