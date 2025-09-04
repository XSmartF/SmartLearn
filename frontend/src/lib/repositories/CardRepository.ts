// Firestore functions dynamically imported to defer cost.
// Keep type-only imports if needed in future.
import { getDb } from '@/lib/firebaseClient';
import type { Card as EngineCard } from '@/lib/models';
import { invalidateCache, cached } from '@/lib/cache';

const CARDS = 'cards';
const LIBRARIES = 'libraries';
const db = getDb();
let _fsMod: Promise<typeof import('firebase/firestore')> | null = null;
function fs() { return _fsMod ??= import('firebase/firestore'); }

export class CardRepository {
  async listCards(libraryId: string): Promise<EngineCard[]> {
    return cached([`cards:${libraryId}`, 'direct'], async () => {
      const { query, collection, where, limit, getDocs } = await fs();
      const qCards = query(collection(db, CARDS), where('libraryId','==', libraryId), limit(1000));
      const snap = await getDocs(qCards); const list: EngineCard[] = [];
      snap.forEach(s=> { const d = s.data(); list.push({ id: s.id, front: d.front, back: d.back, domain: d.domain ?? undefined, difficulty: d.difficulty ?? undefined }); });
      return list;
    });
  }
  async listCardsPreferCache(libraryId: string): Promise<EngineCard[]> {
    const { query, collection, where, limit, getDocs, getDocsFromCache } = await fs();
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
    fs().then(({ query, collection, where, limit, onSnapshot }) => {
      if(cancelled) return;
      const qCards = query(collection(db, CARDS), where('libraryId','==', libraryId), limit(1000));
      unsub = onSnapshot(qCards, snap => { const list: EngineCard[] = []; snap.forEach(s=> { const d = s.data(); list.push({ id: s.id, front: d.front, back: d.back, domain: d.domain ?? undefined, difficulty: d.difficulty ?? undefined }); }); cb(list); });
    });
    return () => { cancelled = true; if(unsub) unsub(); };
  }
  async updateCard(cardId: string, data: { front?: string; back?: string; domain?: string | null; difficulty?: 'easy' | 'medium' | 'hard' | null }) {
    const { updateDoc, doc, serverTimestamp } = await fs();
    await updateDoc(doc(db, CARDS, cardId), { ...data, updatedAt: serverTimestamp() });
    invalidateCache('cards:');
  }
  async deleteCard(cardId: string) {
    const { doc, getDoc, deleteDoc, updateDoc, serverTimestamp, increment } = await fs();
    const cardRef = doc(db, CARDS, cardId); const snap = await getDoc(cardRef); let libId: string | null = null;
    if(snap.exists()) { const d = snap.data() as { libraryId?: string }; if(d.libraryId) libId = d.libraryId; }
    await deleteDoc(cardRef);
    if(libId) { try { await updateDoc(doc(db, LIBRARIES, libId), { cardCount: increment(-1), updatedAt: serverTimestamp() }); } catch{ /* ignore */ } invalidateCache(`cards:${libId}`); invalidateCache(`library:${libId}`); }
  }
  async deleteCardsBulk(cardIds: string[]): Promise<number> {
    if(!cardIds.length) return 0; const toDelete: { id: string; libraryId: string }[] = [];
  const { doc, getDoc, writeBatch, updateDoc, increment, serverTimestamp } = await fs();
    for (const id of cardIds) { try { const ref = doc(db, CARDS, id); const snap = await getDoc(ref); if(snap.exists()) { const d = snap.data() as { libraryId?: string }; if(d.libraryId) toDelete.push({ id, libraryId: d.libraryId }); } } catch{ /* ignore */ } }
    if(!toDelete.length) return 0; const libraryId = toDelete[0].libraryId; const batch = writeBatch(db); for (const c of toDelete) batch.delete(doc(db, CARDS, c.id)); await batch.commit();
    try { await updateDoc(doc(db, LIBRARIES, libraryId), { cardCount: increment(-toDelete.length), updatedAt: serverTimestamp() }); } catch{ /* ignore */ }
    invalidateCache(`cards:${libraryId}`); invalidateCache(`library:${libraryId}`); return toDelete.length;
  }
}
export const cardRepository = new CardRepository();
