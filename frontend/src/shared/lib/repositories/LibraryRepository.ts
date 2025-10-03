// Firestore functions are now dynamically imported per method to reduce upfront cost.
import type { FieldValue } from 'firebase/firestore';
import { getDb, getFirebaseAuth } from '@/shared/lib/firebase/client';
import type { LibraryMeta, LibraryVisibility } from '@/shared/lib/models';
import { invalidateCache, cached } from '@/shared/lib/cache';
import {
  serverTimestamp,
  addDoc,
  collection,
  updateDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  writeBatch,
  increment,
  onSnapshot
} from 'firebase/firestore';

const LIBRARIES = 'libraries';
const CARDS = 'cards';
const db = getDb();

export interface CreateLibraryInput { title: string; description?: string; subject?: string; difficulty?: string; tags?: string[]; visibility?: LibraryVisibility; }
export interface CreateCardInput { libraryId: string; front: string; back: string; domain?: string; difficulty?: 'easy'|'medium'|'hard'; }

export class LibraryRepository {
  async createLibrary(input: CreateLibraryInput): Promise<string> {
    const user = getFirebaseAuth().currentUser; if(!user) throw new Error('Not authenticated');
    const now = serverTimestamp();
    const ref = await addDoc(collection(db, LIBRARIES), { ownerId: user.uid, title: input.title, description: input.description ?? '', subject: input.subject ?? '', difficulty: input.difficulty ?? 'medium', tags: input.tags ?? [], visibility: input.visibility ?? 'private', cardCount: 0, createdAt: now, updatedAt: now });
    invalidateCache('library:');
    return ref.id;
  }

  async updateLibrary(id: string, data: { title?: string; description?: string; visibility?: LibraryVisibility; tags?: string[]; subject?: string; difficulty?: string }) {
    const patch: { [key: string]: string | string[] | LibraryVisibility | FieldValue | undefined } = {};
    if (data.title !== undefined) patch.title = data.title;
    if (data.description !== undefined) patch.description = data.description;
    if (data.visibility !== undefined) patch.visibility = data.visibility;
    if (data.tags !== undefined) patch.tags = data.tags;
    if (data.subject !== undefined) patch.subject = data.subject;
    if (data.difficulty !== undefined) patch.difficulty = data.difficulty;
    patch.updatedAt = serverTimestamp();
    await updateDoc(doc(db, LIBRARIES, id), patch);
    invalidateCache(`library:${id}`);
  }

  async getLibraryMeta(id: string): Promise<LibraryMeta | null> {
    return cached([`library:${id}`], async () => {
      const snap = await getDoc(doc(db, LIBRARIES, id)); if(!snap.exists()) return null;
      const data = snap.data();
      if (data.__deleted === true) return null;
      return { id: snap.id, ownerId: data.ownerId, title: data.title, description: data.description, tags: data.tags ?? [], visibility: data.visibility, cardCount: data.cardCount ?? 0, subject: data.subject ?? '', createdAt: data.createdAt?.toMillis ? new Date(data.createdAt.toMillis()).toISOString() : '', updatedAt: data.updatedAt?.toMillis ? new Date(data.updatedAt.toMillis()).toISOString() : '' } as LibraryMeta;
    });
  }

  async createCard(input: CreateCardInput) {
    const user = getFirebaseAuth().currentUser; if(!user) throw new Error('Not authenticated');
    const now = serverTimestamp();
    await addDoc(collection(db, CARDS), { libraryId: input.libraryId, front: input.front, back: input.back, domain: input.domain ?? null, difficulty: input.difficulty ?? null, createdAt: now, updatedAt: now });
    await updateDoc(doc(db, LIBRARIES, input.libraryId), { cardCount: increment(1), updatedAt: serverTimestamp() });
    invalidateCache(`cards:${input.libraryId}`); invalidateCache(`library:${input.libraryId}`);
  }

  async createCardsBulk(libraryId: string, items: { front: string; back: string; domain?: string }[]): Promise<number> {
    if(!items.length) return 0; const user = getFirebaseAuth().currentUser; if(!user) throw new Error('Not authenticated');
    const CHUNK = 450; let created = 0; const now = serverTimestamp();
    for (let i=0;i<items.length;i+=CHUNK) {
      const slice = items.slice(i, i+CHUNK); const batch = writeBatch(db);
      for (const it of slice) { const ref = doc(collection(db, CARDS)); batch.set(ref, { libraryId, front: it.front, back: it.back, domain: it.domain ?? null, difficulty: null, createdAt: now, updatedAt: now }); }
      await batch.commit(); created += slice.length;
    }
    try { await updateDoc(doc(db, LIBRARIES, libraryId), { cardCount: increment(created), updatedAt: serverTimestamp() }); } catch{ /* ignore */ }
    invalidateCache(`cards:${libraryId}`); invalidateCache(`library:${libraryId}`);
    return created;
  }

  async fetchLibrariesByIds(ids: string[]): Promise<LibraryMeta[]> {
    if(!ids.length) return [];
    const chunks: string[][] = []; for (let i=0;i<ids.length;i+=10) chunks.push(ids.slice(i,i+10));
    const results: LibraryMeta[] = [];
    for (const chunk of chunks) {
      const qLibs = query(collection(db, LIBRARIES), where('__name__','in', chunk)); const snap = await getDocs(qLibs);
      snap.forEach(docSnap => { 
        const d = docSnap.data(); 
        if (d.__deleted !== true) {
          results.push({ id: docSnap.id, ownerId: d.ownerId, title: d.title, description: d.description, tags: d.tags ?? [], visibility: d.visibility, cardCount: d.cardCount ?? 0, subject: d.subject ?? '', createdAt: d.createdAt?.toMillis ? new Date(d.createdAt.toMillis()).toISOString() : '', updatedAt: d.updatedAt?.toMillis ? new Date(d.updatedAt.toMillis()).toISOString() : '' } as LibraryMeta); 
        }
      });
    }
    return results.sort((a,b)=> ids.indexOf(a.id) - ids.indexOf(b.id));
  }

  listenUserLibraries(cb: (libs: LibraryMeta[]) => void) {
    const user = getFirebaseAuth().currentUser; if(!user) throw new Error('Not authenticated');
    let unsub: (()=>void) | null = null; let cancelled = false;
    (async () => {
      if(cancelled) return;
      const qOwned = query(collection(db, LIBRARIES), where('ownerId','==', user.uid));
      unsub = onSnapshot(qOwned, snap => {
        const arr: LibraryMeta[] = [];
        if (snap) {
          snap.forEach(docSnap => { 
            const d = docSnap.data(); 
            if (d.__deleted !== true) {
              arr.push({ id: docSnap.id, ownerId: d.ownerId, title: d.title, description: d.description, tags: d.tags ?? [], visibility: d.visibility, cardCount: d.cardCount ?? 0, subject: d.subject ?? '', createdAt: d.createdAt?.toMillis ? new Date(d.createdAt.toMillis()).toISOString() : '', updatedAt: d.updatedAt?.toMillis ? new Date(d.updatedAt.toMillis()).toISOString() : '' });
            }
          });
        }
        cb(arr);
      });
    })();
    return () => { cancelled = true; if(unsub) unsub(); };
  }

  async recalcLibraryCardCount(libraryId: string): Promise<number> {
    const qCards = query(collection(db, CARDS), where('libraryId','==', libraryId));
    const snap = await getDocs(qCards);
    await updateDoc(doc(db, LIBRARIES, libraryId), { cardCount: snap.size, updatedAt: serverTimestamp() });
    invalidateCache(`library:${libraryId}`);
    return snap.size;
  }

  async deleteLibrary(id: string) {
    const user = getFirebaseAuth().currentUser; if(!user) throw new Error('Not authenticated');
    // First, delete all cards in the library
    const qCards = query(collection(db, CARDS), where('libraryId','==', id));
    const snap = await getDocs(qCards);
    const batch = writeBatch(db);
    snap.forEach(docSnap => batch.delete(docSnap.ref));
    await batch.commit();
    // Then delete the library
    await updateDoc(doc(db, LIBRARIES, id), { __deleted: true, updatedAt: serverTimestamp() });
    invalidateCache(`library:${id}`);
    invalidateCache(`cards:${id}`);
    invalidateCache('library:');
  }
}

export const libraryRepository = new LibraryRepository();
