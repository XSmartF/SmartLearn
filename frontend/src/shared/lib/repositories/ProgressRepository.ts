import { getDb, getFirebaseAuth } from '@/shared/lib/firebase/client';
import type { IProgressRepository } from '@/shared/services/contracts';
import type { UserLibraryProgressDoc, UserLibraryProgressSummary } from '@/shared/types';
import { invalidateCache, cached } from '@/shared/lib/cache';
import {
  query, collection, where, limit,
  getDocs, updateDoc, doc, serverTimestamp, addDoc,
} from 'firebase/firestore';

const PROGRESS = 'progress';
const db = getDb();

const num = (v: unknown) => (typeof v === 'number' ? v : 0);

type ProgressRaw = Record<string, unknown> & {
  userId: string; libraryId: string;
  engineState?: Record<string, unknown>;
  updatedAt?: { toMillis?: () => number };
};

function mapDocToProgress(docSnap: import('firebase/firestore').QueryDocumentSnapshot): UserLibraryProgressDoc {
  const d = docSnap.data() as ProgressRaw;
  return {
    id: docSnap.id,
    userId: d.userId,
    libraryId: d.libraryId,
    engineState: (d.engineState as Record<string, unknown> | undefined) ?? null,
    updatedAt: d.updatedAt?.toMillis ? new Date(d.updatedAt.toMillis()).toISOString() : '',
  };
}

export class ProgressRepository implements IProgressRepository {
  async getUserLibraryProgress(libraryId: string): Promise<UserLibraryProgressDoc | null> {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    return cached([`progress:${user.uid}:${libraryId}`], async () => {
      const q = query(collection(db, PROGRESS), where('userId', '==', user.uid), where('libraryId', '==', libraryId), limit(1));
      const snap = await getDocs(q);
      if (!snap || snap.empty) return null;
      return mapDocToProgress(snap.docs[0]);
    });
  }

  async upsertUserLibraryProgress(libraryId: string, engineState: Record<string, unknown>) {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    const existing = await this.getUserLibraryProgress(libraryId);
    if (existing) {
      await updateDoc(doc(db, PROGRESS, existing.id), { engineState, updatedAt: serverTimestamp() });
      invalidateCache(`progress:${user.uid}:${libraryId}`);
      return existing.id;
    }
    const ref = await addDoc(collection(db, PROGRESS), {
      userId: user.uid, libraryId, engineState,
      updatedAt: serverTimestamp(), createdAt: serverTimestamp(),
    });
    invalidateCache(`progress:${user.uid}:${libraryId}`);
    return ref.id;
  }

  async computeBasicProgressStats(libraryId: string) {
    const prog = await this.getUserLibraryProgress(libraryId);
    const state = (prog?.engineState || {}) as Record<string, unknown>;
    return {
      mastered: num(state.masteredCount),
      learning: num(state.learningCount),
      due: num(state.dueCount),
      total: num(state.totalCount),
    };
  }

  async getAllUserProgressForLibrary(libraryId: string): Promise<UserLibraryProgressDoc[]> {
    return cached([`all-progress:${libraryId}`], async () => {
      const q = query(collection(db, PROGRESS), where('libraryId', '==', libraryId));
      const snap = await getDocs(q);
      const results: UserLibraryProgressDoc[] = [];
      snap.forEach(s => results.push(mapDocToProgress(s)));
      return results;
    });
  }

  async getAllUserProgressSummariesForLibrary(libraryId: string): Promise<UserLibraryProgressSummary[]> {
    return cached([`progress-summaries:${libraryId}`], async () => {
      const q = query(collection(db, PROGRESS), where('libraryId', '==', libraryId));
      const snap = await getDocs(q);
      const results: UserLibraryProgressSummary[] = [];

      snap.forEach(s => {
        if (!s.id.endsWith('__summary')) return;
        const d = s.data() as Record<string, unknown> & {
          userId: string; libraryId: string;
          total?: number; mastered?: number; learning?: number; due?: number;
          percentMastered?: number; updatedAt?: { toMillis?: () => number };
        };
        results.push({
          userId: d.userId,
          libraryId: d.libraryId,
          total: num(d.total),
          mastered: num(d.mastered),
          learning: num(d.learning),
          due: num(d.due),
          percentMastered: num(d.percentMastered),
          updatedAt: d.updatedAt?.toMillis ? new Date(d.updatedAt.toMillis()).toISOString() : '',
        });
      });
      return results;
    });
  }
}

export const progressRepository = new ProgressRepository();
