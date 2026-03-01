import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  type Auth,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { Platform } from 'react-native';

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function readEnv(name: string, fallbackName?: string): string | undefined {
  return (process.env[name] || (fallbackName ? process.env[fallbackName] : undefined))?.trim();
}

export function getFirebaseApp(): FirebaseApp {
  if (appInstance) return appInstance;
  if (getApps().length) {
    appInstance = getApps()[0];
    return appInstance;
  }

  const config = {
    apiKey: readEnv('EXPO_PUBLIC_FIREBASE_API_KEY', 'VITE_FIREBASE_API_KEY'),
    authDomain: readEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: readEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_PROJECT_ID'),
    appId: readEnv('EXPO_PUBLIC_FIREBASE_APP_ID', 'VITE_FIREBASE_APP_ID'),
    storageBucket: readEnv('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', 'VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: readEnv('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_MESSAGING_SENDER_ID'),
  };

  if (!config.apiKey || !config.projectId || !config.appId) {
    throw new Error(
      '[mobile/firebase] Missing Firebase env. Required: EXPO_PUBLIC_FIREBASE_API_KEY, EXPO_PUBLIC_FIREBASE_PROJECT_ID, EXPO_PUBLIC_FIREBASE_APP_ID.'
    );
  }

  appInstance = initializeApp(config);
  return appInstance;
}

export function getFirebaseAuth(): Auth {
  if (authInstance) return authInstance;
  const app = getFirebaseApp();

  if (Platform.OS === 'web') {
    authInstance = getAuth(app);
    return authInstance;
  }

  try {
    // Try to use the react-native helper and AsyncStorage if available; fall back otherwise
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rnAuth = require('firebase/auth/react-native');
    const getRN = rnAuth?.getReactNativePersistence ?? rnAuth?.getReactNativePersistence;
    if (getRN) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const RNAsyncStorage = require('@react-native-async-storage/async-storage');
      authInstance = initializeAuth(app, {
        persistence: getRN(RNAsyncStorage),
      });
    } else {
      authInstance = initializeAuth(app);
    }
  } catch {
    authInstance = getAuth(app);
  }
  return authInstance;
}

export function getDb(): Firestore {
  if (dbInstance) return dbInstance;
  dbInstance = getFirestore(getFirebaseApp());
  return dbInstance;
}
