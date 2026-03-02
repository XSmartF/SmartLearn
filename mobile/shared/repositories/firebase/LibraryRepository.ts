import {
  addDoc,
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  increment,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { MobileCard, MobileLibrary, MobileLibraryDetail } from '@/shared/models/app';
import { getDb } from '@/shared/firebase/client';
import { COLLECTIONS, mapCard, mapLibrary, requireUserId } from './helpers';
import type { ILibraryRepository } from '@/shared/services/contracts';

const db = getDb();

async function loadAccessibleLibraryIds(userId: string): Promise<string[]> {
  const q = query(collection(db, COLLECTIONS.shares), where('targetUserId', '==', userId));
  const snap = await getDocs(q);
  const ids: string[] = [];
  snap.forEach((item) => {
    const value = item.data() as Record<string, unknown>;
    if (typeof value.libraryId === 'string') ids.push(value.libraryId);
  });
  return ids;
}

async function loadLibrariesByIds(ids: string[]): Promise<MobileLibrary[]> {
  if (!ids.length) return [];
  const chunks: string[][] = [];
  for (let index = 0; index < ids.length; index += 10) chunks.push(ids.slice(index, index + 10));
  const results: MobileLibrary[] = [];

  for (const chunk of chunks) {
    const q = query(collection(db, COLLECTIONS.libraries), where(documentId(), 'in', chunk));
    const snap = await getDocs(q);
    snap.forEach((item) => {
      const data = item.data() as Record<string, unknown>;
      if (data.__deleted === true) return;
      results.push(mapLibrary(item.id, data));
    });
  }

  return results;
}

export class FirebaseLibraryRepository implements ILibraryRepository {
  async listLibraries(): Promise<MobileLibrary[]> {
    const userId = requireUserId();

    const ownedSnap = await getDocs(
      query(collection(db, COLLECTIONS.libraries), where('ownerId', '==', userId)),
    );

    const map = new Map<string, MobileLibrary>();
    ownedSnap.forEach((item) => {
      const data = item.data() as Record<string, unknown>;
      if (data.__deleted === true) return;
      map.set(item.id, mapLibrary(item.id, data));
    });

    const sharedIds = await loadAccessibleLibraryIds(userId);
    const sharedLibraries = await loadLibrariesByIds(sharedIds);
    sharedLibraries.forEach((item) => {
      if (!map.has(item.id)) map.set(item.id, item);
    });

    return Array.from(map.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async createLibrary(input: { title: string; description?: string }): Promise<MobileLibrary> {
    const userId = requireUserId();
    const now = serverTimestamp();
    const ref = await addDoc(collection(db, COLLECTIONS.libraries), {
      ownerId: userId,
      title: input.title.trim(),
      description: input.description?.trim() ?? '',
      subject: '',
      difficulty: 'medium',
      tags: [],
      visibility: 'private',
      cardCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    const snap = await getDoc(doc(db, COLLECTIONS.libraries, ref.id));
    const data = snap.data() as Record<string, unknown>;
    return mapLibrary(ref.id, data);
  }

  async getLibraryDetail(libraryId: string): Promise<MobileLibraryDetail | null> {
    const librarySnap = await getDoc(doc(db, COLLECTIONS.libraries, libraryId));
    if (!librarySnap.exists()) return null;
    const libraryData = librarySnap.data() as Record<string, unknown>;
    if (libraryData.__deleted === true) return null;
    const library = mapLibrary(librarySnap.id, libraryData);

    const cardsSnap = await getDocs(
      query(collection(db, COLLECTIONS.cards), where('libraryId', '==', libraryId), limit(2000)),
    );
    const cards: MobileCard[] = [];
    cardsSnap.forEach((item) => cards.push(mapCard(item.id, item.data() as Record<string, unknown>)));

    return { library, cards };
  }

  async addCard(libraryId: string, input: { front: string; back: string }): Promise<MobileCard> {
    requireUserId();
    const now = serverTimestamp();
    const ref = await addDoc(collection(db, COLLECTIONS.cards), {
      libraryId,
      front: input.front.trim(),
      back: input.back.trim(),
      difficulty: 'medium',
      domain: null,
      createdAt: now,
      updatedAt: now,
    });

    await updateDoc(doc(db, COLLECTIONS.libraries, libraryId), {
      cardCount: increment(1),
      updatedAt: serverTimestamp(),
    });

    const snap = await getDoc(doc(db, COLLECTIONS.cards, ref.id));
    return mapCard(ref.id, snap.data() as Record<string, unknown>);
  }
}

export const firebaseLibraryRepository = new FirebaseLibraryRepository();
