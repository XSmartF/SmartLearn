import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import type { AuthAdapter } from './auth';
import type { UserProfile } from './models';
import { getFirebaseAuth, getDb } from './firebaseClient';

export class FirebaseAuthAdapter implements AuthAdapter {
  private auth = getFirebaseAuth();
  private db = getDb();
  private googleProvider = new GoogleAuthProvider();

  async getCurrentUser(): Promise<UserProfile | null> {
    const u = this.auth.currentUser;
    if (!u) return null;
    return this.mapUser(u);
  }

  private mapUser(u: FirebaseUser): UserProfile {
    return {
      id: u.uid,
  email: u.email ?? '',
      displayName: u.displayName ?? undefined,
      avatarUrl: u.photoURL ?? undefined,
      createdAt: u.metadata?.creationTime ?? new Date().toISOString(),
      updatedAt: u.metadata?.lastSignInTime ?? new Date().toISOString(),
    };
  }

  async signInEmailPassword(email: string, password: string): Promise<UserProfile> {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    return this.mapUser(cred.user);
  }

  async signUpEmailPassword(email: string, password: string, displayName?: string): Promise<UserProfile> {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    // store profile doc
    await setDoc(doc(this.db, 'users', cred.user.uid), {
      email,
      displayName: displayName ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return this.mapUser(cred.user);
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
  }

  async signInWithGoogle(): Promise<UserProfile> {
    const cred = await signInWithPopup(this.auth, this.googleProvider);
    // ensure profile doc exists (idempotent overwrite minimal fields)
    await setDoc(doc(this.db, 'users', cred.user.uid), {
      email: cred.user.email ?? '',
      displayName: cred.user.displayName ?? null,
      avatarUrl: cred.user.photoURL ?? null,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return this.mapUser(cred.user);
  }

  onAuthStateChanged(cb: (user: UserProfile | null) => void): () => void {
    return onAuthStateChanged(this.auth, (u) => cb(u ? this.mapUser(u) : null));
  }
}
