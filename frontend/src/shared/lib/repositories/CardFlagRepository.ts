import { getDb, getFirebaseAuth } from '@/shared/lib/firebaseClient';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

const CARD_FLAGS = 'card_flags';
const db = getDb();

export interface CardFlagDoc {
  userId: string;
  libraryId: string;
  cardId: string;
  starred?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  updatedAt?: unknown;
}

export interface CardFlag extends CardFlagDoc {
  id: string;
}

type FlagMap = Record<string, { starred?: boolean; difficulty?: 'easy' | 'medium' | 'hard' }>

export class CardFlagRepository {
  private requireUserId(): string {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');
    return user.uid;
  }

  private docId(userId: string, cardId: string) {
    return `${userId}__${cardId}`;
  }

  async toggleStar(cardId: string, libraryId: string, starred: boolean): Promise<void> {
    const userId = this.requireUserId();
    const ref = doc(db, CARD_FLAGS, this.docId(userId, cardId));
    const snapshot = await getDoc(ref);
    const existing = snapshot.exists() ? (snapshot.data() as CardFlagDoc) : undefined;

    if (!starred) {
      if (snapshot.exists()) {
        if (existing?.difficulty === 'hard') {
          await setDoc(
            ref,
            {
              userId,
              libraryId,
              cardId,
              starred: false,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        } else {
          await deleteDoc(ref);
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

  async setDifficulty(cardId: string, libraryId: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<void> {
    const userId = this.requireUserId();
    const ref = doc(db, CARD_FLAGS, this.docId(userId, cardId));
    const snapshot = await getDoc(ref);
    const existing = snapshot.exists() ? (snapshot.data() as CardFlagDoc) : undefined;
    const hasStar = existing?.starred === true;

    if (difficulty === 'hard' || hasStar) {
      const payload: Record<string, unknown> = {
        userId,
        libraryId,
        cardId,
        difficulty,
        updatedAt: serverTimestamp(),
      };
      if (typeof existing?.starred === 'boolean') {
        payload.starred = existing.starred;
      }
      await setDoc(ref, payload, { merge: true });
      return;
    }

    if (snapshot.exists()) {
      await deleteDoc(ref);
    }
  }

  listenLibraryFlags(libraryId: string, cb: (flags: FlagMap) => void) {
    const userId = this.requireUserId();
    const qFlags = query(
      collection(db, CARD_FLAGS),
      where('userId', '==', userId),
      where('libraryId', '==', libraryId)
    );
    return onSnapshot(qFlags, (snap) => {
      const map: FlagMap = {};
      if (snap) {
        snap.forEach((docSnap) => {
          const data = docSnap.data() as CardFlagDoc;
          map[data.cardId] = {
            starred: data.starred === true,
            difficulty: data.difficulty,
          };
        });
      }
      cb(map);
    });
  }

  listenReviewFlags(cb: (flags: CardFlag[]) => void) {
    const userId = this.requireUserId();
    const qFlags = query(collection(db, CARD_FLAGS), where('userId', '==', userId));
    return onSnapshot(qFlags, (snap) => {
      const list: CardFlag[] = [];
      if (snap) {
        snap.forEach((docSnap) => {
          const data = docSnap.data() as CardFlagDoc;
          if (data.starred === true || data.difficulty === 'hard') {
            list.push({ id: docSnap.id, ...data });
          }
        });
      }
      cb(list);
    });
  }

  async listReviewFlags(): Promise<CardFlag[]> {
    const userId = this.requireUserId();
    const qFlags = query(collection(db, CARD_FLAGS), where('userId', '==', userId));
    const snap = await getDocs(qFlags);
    const list: CardFlag[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as CardFlagDoc;
      if (data.starred === true || data.difficulty === 'hard') {
        list.push({ id: docSnap.id, ...data });
      }
    });
    return list;
  }
}

export const cardFlagRepository = new CardFlagRepository();
