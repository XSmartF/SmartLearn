import { doc, getDoc, serverTimestamp, writeBatch, onSnapshot } from 'firebase/firestore';
import { getDb } from './firebaseClient';
import type { SerializedState } from './learnEngine';
import { getFirebaseAuth } from './firebaseClient';

// Collection: progress (doc id: userId__libraryId)
const COLLECTION = 'progress';
const db = getDb();

export interface ProgressDoc {
  userId: string;
  libraryId: string;
  engineState: SerializedState;
  updatedAt: unknown; // serverTimestamp
}

function key(userId: string, libraryId: string) {
  return `${userId}__${libraryId}`;
}

export async function loadProgress(libraryId: string): Promise<SerializedState | null> {
  const user = getFirebaseAuth().currentUser; if (!user) return null;
  const ref = doc(db, COLLECTION, key(user.uid, libraryId));
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as ProgressDoc;
  return data.engineState || null;
}

export async function saveProgress(libraryId: string, engineState: SerializedState) {
  const user = getFirebaseAuth().currentUser; if (!user) throw new Error('Not authenticated');
  const ref = doc(db, COLLECTION, key(user.uid, libraryId));
  // derive lightweight stats for fast dashboard (mastered/learning/due)
  const total = engineState.states.length;
  let mastered = 0; let learning = 0; let due = 0;
  const M = engineState.params.M;
  const sessionIndex = engineState.sessionIndex;
  for (const s of engineState.states) {
    if (s.mastery >= M) mastered++; else if (s.seenCount > 0) learning++; // simple classification
    if (s.nextDue <= sessionIndex) due++;
  }
  const summaryRef = doc(db, COLLECTION, key(user.uid, libraryId) + '__summary');
  // Load existing summary to determine sessionCount increment logic
  let sessionCount = 1;
  try {
    const existing = await getDoc(summaryRef);
    if (existing.exists()) {
      const data = existing.data() as Record<string, unknown>;
      const prevCount = typeof data.sessionCount === 'number' ? data.sessionCount : 0;
      const prevStartedAt = data.lastSessionStartedAt;
      // Increment sessionCount when we detect a new engine session (different startedAt)
      if (prevStartedAt !== engineState.startedAt) sessionCount = prevCount + 1; else sessionCount = prevCount || 1;
    }
  } catch { /* ignore */ }
  const accuracyOverall = engineState.asked ? engineState.correct / engineState.asked : 0;
  const batch = writeBatch(db);
  batch.set(ref, {
    userId: user.uid,
    libraryId,
    engineState,
    updatedAt: serverTimestamp(),
  });
  batch.set(summaryRef, {
    userId: user.uid,
    libraryId,
    total,
    mastered,
    learning,
    due,
    percentMastered: total ? Math.round((mastered/total)*1000)/10 : 0,
    accuracyOverall,
    sessionCount,
    lastSessionStartedAt: engineState.startedAt,
    updatedAt: serverTimestamp(),
    lastAccessed: serverTimestamp(),
  });
  await batch.commit();
}

// Fast summary loader for dashboard
export interface ProgressSummaryLite { total: number; mastered: number; learning: number; due: number; percentMastered: number; accuracyOverall?: number; sessionCount?: number; lastAccessed?: string; updatedAt?: string; }
export async function loadProgressSummary(libraryId: string): Promise<ProgressSummaryLite | null> {
  const user = getFirebaseAuth().currentUser; if (!user) return null;
  const ref = doc(db, COLLECTION, key(user.uid, libraryId) + '__summary');
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const d = snap.data() as Record<string, unknown>;
  const num = (v: unknown) => typeof v === 'number' ? v : 0;
  type TSLike = { toMillis?: () => number; seconds?: number; nanoseconds?: number };
  const tsToIso = (v: unknown) => {
    if (v && typeof v === 'object') {
      const obj = v as TSLike;
      if ('toMillis' in obj && typeof obj.toMillis === 'function') {
        try { return new Date(obj.toMillis()).toISOString(); } catch { return undefined; }
      }
      if (typeof obj.seconds === 'number') {
        try { return new Date(obj.seconds * 1000).toISOString(); } catch { return undefined; }
      }
    }
    if (typeof v === 'string') return v;
    return undefined;
  };
  return {
    total: num(d.total),
    mastered: num(d.mastered),
    learning: num(d.learning),
    due: num(d.due),
    percentMastered: num(d.percentMastered),
    accuracyOverall: typeof d.accuracyOverall === 'number' ? d.accuracyOverall : undefined,
    sessionCount: typeof d.sessionCount === 'number' ? d.sessionCount : undefined,
    lastAccessed: tsToIso(d.lastAccessed),
    updatedAt: tsToIso(d.updatedAt),
  };
}

// Realtime listener helper
export function listenProgressSummary(libraryId: string, cb: (summary: ProgressSummaryLite | null) => void) {
  const user = getFirebaseAuth().currentUser; if (!user) return () => {};
  const summaryRef = doc(db, COLLECTION, key(user.uid, libraryId) + '__summary');
  return onSnapshot(summaryRef, (snap) => {
    if (!snap.exists()) { cb(null); return; }
    const d = snap.data() as Record<string, unknown>;
    type TSLike = { toMillis?: () => number; seconds?: number; nanoseconds?: number };
    const tsToIso = (v: unknown) => {
      if (v && typeof v === 'object') {
        const obj = v as TSLike;
        if ('toMillis' in obj && typeof obj.toMillis === 'function') {
          try { return new Date(obj.toMillis()).toISOString(); } catch { return undefined; }
        }
        if (typeof obj.seconds === 'number') {
          try { return new Date(obj.seconds * 1000).toISOString(); } catch { return undefined; }
        }
      }
      if (typeof v === 'string') return v;
      return undefined;
    };
    const num = (v: unknown) => typeof v === 'number' ? v : 0;
    cb({
      total: num(d.total),
      mastered: num(d.mastered),
      learning: num(d.learning),
      due: num(d.due),
      percentMastered: num(d.percentMastered),
      accuracyOverall: typeof d.accuracyOverall === 'number' ? d.accuracyOverall : undefined,
      sessionCount: typeof d.sessionCount === 'number' ? d.sessionCount : undefined,
      lastAccessed: tsToIso(d.lastAccessed),
      updatedAt: tsToIso(d.updatedAt),
    });
  });
}
