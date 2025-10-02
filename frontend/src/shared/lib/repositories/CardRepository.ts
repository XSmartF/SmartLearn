// Firestore functions dynamically imported to defer cost.
// Keep type-only imports if needed in future.
import { getDb } from '@/shared/lib/firebaseClient';
import type { Card as EngineCard } from '@/shared/lib/models';
import { invalidateCache, cached } from '@/shared/lib/cache';
import {
  query,
  collection,
  where,
  limit,
  getDocs,
  getDocsFromCache,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  deleteDoc,
  getDoc,
  increment,
  writeBatch
} from 'firebase/firestore';

const CARDS = 'cards';
const LIBRARIES = 'libraries';
const db = getDb();

export class CardRepository {
  async listCards(libraryId: string): Promise<EngineCard[]> {
    return cached([`cards:${libraryId}`, 'direct'], async () => {
      const qCards = query(collection(db, CARDS), where('libraryId','==', libraryId), limit(1000));
      const snap = await getDocs(qCards); const list: EngineCard[] = [];
      snap.forEach(s=> { const d = s.data(); list.push({ id: s.id, front: d.front, back: d.back, domain: d.domain ?? undefined, difficulty: d.difficulty ?? undefined }); });
      return list;
    });
  }
  async listCardsPreferCache(libraryId: string): Promise<EngineCard[]> {
    const qCards = query(collection(db, CARDS), where('libraryId','==', libraryId), limit(1000));
    try {
      const snapCache = await getDocsFromCache(qCards);
      if(!snapCache.empty) {
        const list: EngineCard[] = []; snapCache.forEach(s=> { const d = s.data(); list.push({ id: s.id, front: d.front, back: d.back, domain: d.domain ?? undefined, difficulty: d.difficulty ?? undefined }); });
        getDocs(qCards).catch(()=>{}); // background refresh
        return list;
      }
  } catch{ /* ignore cache miss */ }
    return this.listCards(libraryId);
  }
  listenLibraryCards(libraryId: string, cb: (cards: EngineCard[]) => void) {
    let unsub: (()=>void) | null = null; let cancelled = false;
    (async () => {
      if(cancelled) return;
      const qCards = query(collection(db, CARDS), where('libraryId','==', libraryId), limit(1000));
      unsub = onSnapshot(qCards, snap => { const list: EngineCard[] = []; snap.forEach(s=> { const d = s.data(); list.push({ id: s.id, front: d.front, back: d.back, domain: d.domain ?? undefined, difficulty: d.difficulty ?? undefined }); }); cb(list); });
    })();
    return () => { cancelled = true; if(unsub) unsub(); };
  }
  async getCard(cardId: string): Promise<EngineCard | null> {
    try {
      const snap = await getDoc(doc(db, CARDS, cardId));
      if (!snap.exists()) return null;
      const d = snap.data();
      return { id: snap.id, front: d.front, back: d.back, domain: d.domain ?? undefined, difficulty: d.difficulty ?? undefined };
    } catch {
      return null;
    }
  }
  async updateCard(cardId: string, data: { front?: string; back?: string; domain?: string | null; difficulty?: 'easy' | 'medium' | 'hard' | null }) {
    await updateDoc(doc(db, CARDS, cardId), { ...data, updatedAt: serverTimestamp() });
    invalidateCache('cards:');
  }
  async deleteCard(cardId: string) {
    const cardRef = doc(db, CARDS, cardId); const snap = await getDoc(cardRef); let libId: string | null = null;
    if(snap.exists()) { const d = snap.data() as { libraryId?: string }; if(d.libraryId) libId = d.libraryId; }
    await deleteDoc(cardRef);
    if(libId) { try { await updateDoc(doc(db, LIBRARIES, libId), { cardCount: increment(-1), updatedAt: serverTimestamp() }); } catch{ /* ignore */ } invalidateCache(`cards:${libId}`); invalidateCache(`library:${libId}`); }
  }
  async deleteCardsBulk(cardIds: string[]): Promise<number> {
    if(!cardIds.length) return 0; const toDelete: { id: string; libraryId: string }[] = [];
    for (const id of cardIds) { try { const ref = doc(db, CARDS, id); const snap = await getDoc(ref); if(snap.exists()) { const d = snap.data() as { libraryId?: string }; if(d.libraryId) toDelete.push({ id, libraryId: d.libraryId }); } } catch{ /* ignore */ } }
    if(!toDelete.length) return 0; const libraryId = toDelete[0].libraryId; const batch = writeBatch(db); for (const c of toDelete) batch.delete(doc(db, CARDS, c.id)); await batch.commit();
    try { await updateDoc(doc(db, LIBRARIES, libraryId), { cardCount: increment(-toDelete.length), updatedAt: serverTimestamp() }); } catch{ /* ignore */ }
    invalidateCache(`cards:${libraryId}`); invalidateCache(`library:${libraryId}`); return toDelete.length;
  }
}
export const cardRepository = new CardRepository();
