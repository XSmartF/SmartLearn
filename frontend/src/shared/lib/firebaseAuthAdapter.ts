// Convert to on-demand dynamic imports so auth bundle only loads when adapter used
import type { User as FirebaseUser, AuthProvider } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { AuthAdapter } from './auth';
import type { UserProfile } from './models';
import { getFirebaseAuth, getDb } from './firebaseClient';
import { queueSetDoc } from './firestoreQueue';
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export class FirebaseAuthAdapter implements AuthAdapter {
  private auth = getFirebaseAuth();
  private db: Firestore | null = null; // lazy
  // GoogleAuthProvider loaded dynamically; store minimal shape
  private googleProvider: AuthProvider | null = null;

  private ensureDb(): Firestore {
    if (!this.db) this.db = getDb();
    return this.db;
  }

  private async ensureGoogleProvider(): Promise<AuthProvider> {
    if (!this.googleProvider) {
      this.googleProvider = new GoogleAuthProvider();
    }
    return this.googleProvider;
  }

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
    if (displayName) await updateProfile(cred.user, { displayName });
    try {
      await setDoc(doc(this.ensureDb(), 'users', cred.user.uid), {
        email,
        displayName: displayName ?? null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch {
      queueSetDoc(`users/${cred.user.uid}`, {
        email,
        displayName: displayName ?? null,
        createdAt: '__SERVER_TIMESTAMP__',
        updatedAt: '__SERVER_TIMESTAMP__'
      })
    }
    return this.mapUser(cred.user);
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
  }

  async signInWithGoogle(): Promise<UserProfile> {
    const provider = await this.ensureGoogleProvider();
    const cred = await signInWithPopup(this.auth, provider);
    try {
      await setDoc(doc(this.ensureDb(), 'users', cred.user.uid), {
        email: cred.user.email ?? '',
        displayName: cred.user.displayName ?? null,
        avatarUrl: cred.user.photoURL ?? null,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch {
      queueSetDoc(`users/${cred.user.uid}`, {
        email: cred.user.email ?? '',
        displayName: cred.user.displayName ?? null,
        avatarUrl: cred.user.photoURL ?? null,
        updatedAt: '__SERVER_TIMESTAMP__'
      }, true)
    }
    return this.mapUser(cred.user);
  }

  onAuthStateChanged(cb: (user: UserProfile | null) => void): () => void {
    // Keep static import small by dynamically loading listener only when first subscribed
  let unsub: (() => void) | null = null
  ;(async () => {
      unsub = onAuthStateChanged(this.auth, (u) => cb(u ? this.mapUser(u) : null))
    })()
  return () => { if (unsub) { unsub() } }
  }
}
