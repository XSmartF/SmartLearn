import { doc, getDoc, serverTimestamp, writeBatch, onSnapshot } from 'firebase/firestore';
import { getDb, getFirebaseAuth } from '@/shared/lib/firebase/client';
import type { SerializedState } from '@/features/study/utils/learnEngine';
import type { ProgressSummaryLite } from '@/shared/types';

const PROGRESS_COLLECTION = 'progress';
const progressDb = getDb();

export interface ProgressDoc {
  userId: string;
  libraryId: string;
  engineState: SerializedState;
  updatedAt: unknown;
}

function key(userId: string, libraryId: string) {
  return `${userId}__${libraryId}`;
}

type TSLike = { toMillis?: () => number; seconds?: number; nanoseconds?: number };

const num = (v: unknown) => (typeof v === 'number' ? v : 0);

function tsToIso(v: unknown): string | undefined {
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
}

function mapSummaryDoc(d: Record<string, unknown>): ProgressSummaryLite {
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

export async function loadProgress(libraryId: string): Promise<SerializedState | null> {
  const user = getFirebaseAuth().currentUser;
  if (!user) return null;
  const ref = doc(progressDb, PROGRESS_COLLECTION, key(user.uid, libraryId));
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return (snap.data() as ProgressDoc).engineState || null;
}

export async function saveProgress(libraryId: string, engineState: SerializedState) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error('Not authenticated');

  const ref = doc(progressDb, PROGRESS_COLLECTION, key(user.uid, libraryId));

  // Derive lightweight stats for dashboard
  const total = engineState.states.length;
  let mastered = 0, learning = 0, due = 0;
  const M = engineState.params.M;
  for (const s of engineState.states) {
    if (s.mastery >= M) mastered++;
    else if (s.seenCount > 0) learning++;
    if (s.nextDue <= engineState.sessionIndex) due++;
  }

  const summaryRef = doc(progressDb, PROGRESS_COLLECTION, key(user.uid, libraryId) + '__summary');

  let sessionCount = 1;
  try {
    const existing = await getDoc(summaryRef);
    if (existing.exists()) {
      const data = existing.data() as Record<string, unknown>;
      const prevCount = typeof data.sessionCount === 'number' ? data.sessionCount : 0;
      sessionCount = data.lastSessionStartedAt !== engineState.startedAt ? prevCount + 1 : (prevCount || 1);
    }
  } catch { /* ignore */ }

  const accuracyOverall = engineState.asked ? engineState.correct / engineState.asked : 0;

  const batch = writeBatch(progressDb);
  batch.set(ref, { userId: user.uid, libraryId, engineState, updatedAt: serverTimestamp() });
  batch.set(summaryRef, {
    userId: user.uid, libraryId,
    total, mastered, learning, due,
    percentMastered: total ? Math.round((mastered / total) * 1000) / 10 : 0,
    accuracyOverall, sessionCount,
    lastSessionStartedAt: engineState.startedAt,
    updatedAt: serverTimestamp(),
    lastAccessed: serverTimestamp(),
  });
  await batch.commit();
}

export async function loadProgressSummary(libraryId: string): Promise<ProgressSummaryLite | null> {
  const user = getFirebaseAuth().currentUser;
  if (!user) return null;
  const ref = doc(progressDb, PROGRESS_COLLECTION, key(user.uid, libraryId) + '__summary');
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return mapSummaryDoc(snap.data() as Record<string, unknown>);
}

export function listenProgressSummary(libraryId: string, cb: (summary: ProgressSummaryLite | null) => void) {
  const user = getFirebaseAuth().currentUser;
  if (!user) return () => {};
  const summaryRef = doc(progressDb, PROGRESS_COLLECTION, key(user.uid, libraryId) + '__summary');
  return onSnapshot(summaryRef, snap => {
    if (!snap.exists()) { cb(null); return; }
    cb(mapSummaryDoc(snap.data() as Record<string, unknown>));
  });
}
