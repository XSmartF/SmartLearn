import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import type { MobileCardFlag, MobileFlagMap } from '@/shared/models/app';
import { getDb } from '@/shared/firebase/client';
import { COLLECTIONS, requireUserId } from './helpers';
import type { ICardFlagRepository } from '@/shared/services/contracts';

const db = getDb();

function flagDocId(userId: string, cardId: string) {
  return `${userId}__${cardId}`;
}

export class FirebaseCardFlagRepository implements ICardFlagRepository {
  async toggleCardStar(
    cardId: string,
    libraryId: string,
    starred: boolean,
  ): Promise<void> {
    const userId = requireUserId();
    const ref = doc(db, COLLECTIONS.cardFlags, flagDocId(userId, cardId));
    const snapshot = await getDoc(ref);
    const existing = snapshot.exists()
      ? (snapshot.data() as Record<string, unknown>)
      : undefined;

    if (!starred) {
      if (snapshot.exists()) {
        if (existing?.difficulty === 'hard') {
          await setDoc(
            ref,
            { userId, libraryId, cardId, starred: false, updatedAt: serverTimestamp() },
            { merge: true },
          );
        } else {
          const { deleteDoc: del } = await import('firebase/firestore');
          await del(ref);
        }
      }
      return;
    }

    const payload: Record<string, unknown> = {
      userId,
      libraryId,
      cardId,
      starred: true,
      updatedAt: serverTimestamp(),
    };
    if (existing?.difficulty) payload.difficulty = existing.difficulty;
    await setDoc(ref, payload, { merge: true });
  }

  async setCardDifficulty(
    cardId: string,
    libraryId: string,
    difficulty: 'easy' | 'medium' | 'hard',
  ): Promise<void> {
    const userId = requireUserId();
    const ref = doc(db, COLLECTIONS.cardFlags, flagDocId(userId, cardId));
    const snapshot = await getDoc(ref);
    const existing = snapshot.exists()
      ? (snapshot.data() as Record<string, unknown>)
      : undefined;
    const hasStar = existing?.starred === true;

    if (difficulty === 'hard' || hasStar) {
      const payload: Record<string, unknown> = {
        userId,
        libraryId,
        cardId,
        difficulty,
        updatedAt: serverTimestamp(),
      };
      if (typeof existing?.starred === 'boolean') payload.starred = existing.starred;
      await setDoc(ref, payload, { merge: true });
      return;
    }

    if (snapshot.exists()) {
      const { deleteDoc: del } = await import('firebase/firestore');
      await del(ref);
    }
  }

  async getLibraryFlags(libraryId: string): Promise<MobileFlagMap> {
    const userId = requireUserId();
    const q = query(
      collection(db, COLLECTIONS.cardFlags),
      where('userId', '==', userId),
      where('libraryId', '==', libraryId),
    );
    const snap = await getDocs(q);
    const map: MobileFlagMap = {};
    snap.forEach((d) => {
      const data = d.data() as Record<string, unknown>;
      const cid = String(data.cardId ?? '');
      if (cid)
        map[cid] = {
          starred: data.starred === true,
          difficulty: data.difficulty as MobileCardFlag['difficulty'],
        };
    });
    return map;
  }

  async listReviewFlags(): Promise<MobileCardFlag[]> {
    const userId = requireUserId();
    const q = query(
      collection(db, COLLECTIONS.cardFlags),
      where('userId', '==', userId),
    );
    const snap = await getDocs(q);
    const list: MobileCardFlag[] = [];
    snap.forEach((d) => {
      const data = d.data() as Record<string, unknown>;
      if (data.starred === true || data.difficulty === 'hard') {
        list.push({
          id: d.id,
          userId: String(data.userId ?? ''),
          libraryId: String(data.libraryId ?? ''),
          cardId: String(data.cardId ?? ''),
          starred: data.starred === true,
          difficulty: data.difficulty as MobileCardFlag['difficulty'],
        });
      }
    });
    return list;
  }
}

export const firebaseCardFlagRepository = new FirebaseCardFlagRepository();
