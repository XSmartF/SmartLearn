// Firebase initialization utilities
// Expect environment variables (create .env file):
// VITE_FIREBASE_API_KEY=...
// VITE_FIREBASE_AUTH_DOMAIN=...
// VITE_FIREBASE_PROJECT_ID=...
// VITE_FIREBASE_APP_ID=...
// (optionally) VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID

import { initializeApp, type FirebaseApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore
} from 'firebase/firestore';

let app: FirebaseApp | null = null;

export function getFirebaseApp() {
  if (app) return app;
  if (getApps().length) {
    app = getApps()[0];
    return app;
  }
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  };
  app = initializeApp(config);
  return app;
}

export function getFirebaseAuth() { return getAuth(getFirebaseApp()); }

// Lazily initialize Firestore with the new recommended persistence API.
let dbInstance: Firestore | null = null;
export function getDb(): Firestore {
  if (dbInstance) return dbInstance;
  const app = getFirebaseApp();
  try {
    // Attempt persistent multi-tab cache
    dbInstance = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });
  } catch (e) {
    // If Firestore already initialized elsewhere (different options) or persistence unsupported
    console.warn('[Firestore] Persistent local cache init failed; using existing or memory instance', e);
    try {
      dbInstance = getFirestore(app);
    } catch {
      // Absolute fallback: re-init with no special options
      dbInstance = initializeFirestore(app, {});
    }
  }
  return dbInstance;
}

// Preload Firestore (e.g., after user logs in) without awaiting by caller.
export function preloadFirestore() {
  // Defer so it doesn't block current event loop / render.
  setTimeout(() => {
    try { getDb(); } catch { /* ignore */ }
  }, 0);
}
