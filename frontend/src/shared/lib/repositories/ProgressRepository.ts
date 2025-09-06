// Firestore functions dynamically imported per method.
import { getDb, getFirebaseAuth } from '@/shared/lib/firebaseClient';
import { invalidateCache, cached } from '@/shared/lib/cache';
import {
  query,
  collection,
  where,
  limit,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';

const PROGRESS = 'progress';
const db = getDb();

export interface UserLibraryProgressDoc {
  id: string;
  userId: string;
  libraryId: string;
  engineState: Record<string, unknown> | null;
  updatedAt: string;
}

export class ProgressRepository {
  async getUserLibraryProgress(libraryId: string): Promise<UserLibraryProgressDoc | null> {
    const user = getFirebaseAuth().currentUser; if (!user) throw new Error('Not authenticated');
    return cached([`progress:${user.uid}:${libraryId}`], async () => {
  const qProg = query(collection(db, PROGRESS), where('userId','==', user.uid), where('libraryId','==', libraryId), limit(1));
  const snap = await getDocs(qProg);
      if (snap.empty) return null;
      const docSnap = snap.docs[0];
      const d = docSnap.data() as Record<string, unknown> & { userId: string; libraryId: string; engineState?: Record<string, unknown>; updatedAt?: { toMillis?: () => number } };
      return { id: docSnap.id, userId: d.userId, libraryId: d.libraryId, engineState: (d.engineState as Record<string, unknown> | undefined) ?? null, updatedAt: d.updatedAt?.toMillis ? new Date(d.updatedAt.toMillis()).toISOString() : '' };
    });
  }

  async upsertUserLibraryProgress(libraryId: string, engineState: Record<string, unknown>) {
    const user = getFirebaseAuth().currentUser; if (!user) throw new Error('Not authenticated');
    const existing = await this.getUserLibraryProgress(libraryId);
    if (existing) {
      await updateDoc(doc(db, PROGRESS, existing.id), { engineState, updatedAt: serverTimestamp() });
      invalidateCache(`progress:${user.uid}:${libraryId}`);
      return existing.id;
    }
    const ref = await addDoc(collection(db, PROGRESS), { userId: user.uid, libraryId, engineState, updatedAt: serverTimestamp(), createdAt: serverTimestamp() });
    invalidateCache(`progress:${user.uid}:${libraryId}`);
    return ref.id;
  }

  async computeBasicProgressStats(libraryId: string): Promise<{ mastered: number; learning: number; due: number; total: number }> {
    const prog = await this.getUserLibraryProgress(libraryId);
    const state = (prog?.engineState || {}) as Record<string, unknown>;
    const num = (v: unknown) => typeof v === 'number' ? v : 0;
    const mastered = num(state.masteredCount);
    const learning = num(state.learningCount);
    const due = num(state.dueCount);
    const total = num(state.totalCount);
    return { mastered, learning, due, total };
  }
}

export const progressRepository = new ProgressRepository();
