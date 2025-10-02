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

export interface UserLibraryProgressSummary {
  userId: string;
  libraryId: string;
  total: number;
  mastered: number;
  learning: number;
  due: number;
  percentMastered: number;
  updatedAt: string;
}

export class ProgressRepository {
  async getUserLibraryProgress(libraryId: string): Promise<UserLibraryProgressDoc | null> {
    const user = getFirebaseAuth().currentUser; if (!user) throw new Error('Not authenticated');
    return cached([`progress:${user.uid}:${libraryId}`], async () => {
  const qProg = query(collection(db, PROGRESS), where('userId','==', user.uid), where('libraryId','==', libraryId), limit(1));
  const snap = await getDocs(qProg);
      if (!snap || snap.empty) return null;
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

  async getAllUserProgressForLibrary(libraryId: string): Promise<UserLibraryProgressDoc[]> {
    return cached([`all-progress:${libraryId}`], async () => {
      const qProg = query(collection(db, PROGRESS), where('libraryId', '==', libraryId));
      const snap = await getDocs(qProg);
      const results: UserLibraryProgressDoc[] = [];
      snap.forEach(docSnap => {
        const d = docSnap.data() as Record<string, unknown> & { userId: string; libraryId: string; engineState?: Record<string, unknown>; updatedAt?: { toMillis?: () => number } };
        results.push({
          id: docSnap.id,
          userId: d.userId,
          libraryId: d.libraryId,
          engineState: (d.engineState as Record<string, unknown> | undefined) ?? null,
          updatedAt: d.updatedAt?.toMillis ? new Date(d.updatedAt.toMillis()).toISOString() : ''
        });
      });
      return results;
    });
  }

  async getAllUserProgressSummariesForLibrary(libraryId: string): Promise<UserLibraryProgressSummary[]> {
    return cached([`progress-summaries:${libraryId}`], async () => {
      // Query for summary documents (they have __summary suffix)
      const qSummaries = query(collection(db, PROGRESS), where('libraryId', '==', libraryId));
      const snap = await getDocs(qSummaries);
      const results: UserLibraryProgressSummary[] = [];
      
      snap.forEach(docSnap => {
        const docId = docSnap.id;
        // Only process summary documents
        if (!docId.endsWith('__summary')) return;
        
        const d = docSnap.data() as Record<string, unknown> & { 
          userId: string; 
          libraryId: string; 
          total?: number; 
          mastered?: number; 
          learning?: number; 
          due?: number; 
          percentMastered?: number; 
          updatedAt?: { toMillis?: () => number } 
        };
        
        const num = (v: unknown) => typeof v === 'number' ? v : 0;
        
        results.push({
          userId: d.userId,
          libraryId: d.libraryId,
          total: num(d.total),
          mastered: num(d.mastered),
          learning: num(d.learning),
          due: num(d.due),
          percentMastered: num(d.percentMastered),
          updatedAt: d.updatedAt?.toMillis ? new Date(d.updatedAt.toMillis()).toISOString() : ''
        });
      });
      
      return results;
    });
  }
}

export const progressRepository = new ProgressRepository();
