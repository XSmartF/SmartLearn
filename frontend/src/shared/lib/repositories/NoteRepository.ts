import type { FieldValue } from 'firebase/firestore';
import { getDb, getFirebaseAuth } from '@/shared/lib/firebase/client';
import type { NoteMeta } from '@/features/notes/types';
import type { INoteRepository } from '@/shared/services/contracts';
import type { CreateNoteInput, UpdateNoteInput } from '@/shared/types';
import { invalidateCache, cached } from '@/shared/lib/cache';
import {
  serverTimestamp, addDoc, collection, updateDoc,
  doc, getDoc, query, where, onSnapshot,
} from 'firebase/firestore';

const NOTES = 'notes';
const db = getDb();

function mapDocToNote(s: import('firebase/firestore').DocumentSnapshot | import('firebase/firestore').QueryDocumentSnapshot): NoteMeta | null {
  if (!s.exists()) return null;
  const d = s.data();
  if (d.__deleted === true) return null;
  return {
    id: s.id,
    ownerId: d.ownerId,
    title: d.title,
    content: d.content,
    tags: d.tags ?? [],
    visibility: d.visibility,
    createdAt: d.createdAt?.toMillis ? new Date(d.createdAt.toMillis()).toISOString() : '',
    updatedAt: d.updatedAt?.toMillis ? new Date(d.updatedAt.toMillis()).toISOString() : '',
  } as NoteMeta;
}

/** Persists favorite IDs to localStorage and dispatches sync events. */
function persistFavorites(key: string, oldFavs: string[], newFavs: string[]) {
  localStorage.setItem(key, JSON.stringify(newFavs));
  window.dispatchEvent(new StorageEvent('storage', {
    key, newValue: JSON.stringify(newFavs), oldValue: JSON.stringify(oldFavs),
  }));
  window.dispatchEvent(new CustomEvent('customStorage', {
    detail: { key, newValue: JSON.stringify(newFavs) },
  }));
}

export class NoteRepository implements INoteRepository {
  async createNote(input: CreateNoteInput): Promise<string> {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    const now = serverTimestamp();
    const ref = await addDoc(collection(db, NOTES), {
      ownerId: user.uid,
      title: input.title,
      content: input.content ?? '',
      tags: input.tags ?? [],
      visibility: input.visibility ?? 'private',
      createdAt: now,
      updatedAt: now,
    });
    invalidateCache('notes:');
    return ref.id;
  }

  async updateNote(id: string, data: UpdateNoteInput) {
    const patch: Record<string, string | string[] | FieldValue | undefined> = {};
    if (data.title !== undefined) patch.title = data.title;
    if (data.content !== undefined) patch.content = data.content;
    if (data.tags !== undefined) patch.tags = data.tags;
    if (data.visibility !== undefined) patch.visibility = data.visibility;
    patch.updatedAt = serverTimestamp();
    await updateDoc(doc(db, NOTES, id), patch);
    invalidateCache(`note:${id}`);
    invalidateCache('notes:');
  }

  async getNote(id: string): Promise<NoteMeta | null> {
    return cached([`note:${id}`], async () => {
      const snap = await getDoc(doc(db, NOTES, id));
      return mapDocToNote(snap);
    });
  }

  async deleteNote(id: string) {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');
    await updateDoc(doc(db, NOTES, id), { __deleted: true, updatedAt: serverTimestamp() });
    invalidateCache(`note:${id}`);
    invalidateCache('notes:');
  }

  listenUserNotes(cb: (notes: NoteMeta[]) => void) {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    let unsub: (() => void) | null = null;
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      const q = query(collection(db, NOTES), where('ownerId', '==', user.uid));
      unsub = onSnapshot(q, snap => {
        const arr: NoteMeta[] = [];
        snap?.forEach(s => {
          const note = mapDocToNote(s);
          if (note) arr.push(note);
        });
        cb(arr);
      });
    })();
    return () => { cancelled = true; unsub?.(); };
  }

  async addFavorite(noteId: string) {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');
    const key = `note_favorites_${user.uid}`;
    const favorites: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    if (!favorites.includes(noteId)) {
      persistFavorites(key, favorites, [...favorites, noteId]);
    }
  }

  async removeFavorite(noteId: string) {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');
    const key = `note_favorites_${user.uid}`;
    const favorites: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    if (favorites.includes(noteId)) {
      persistFavorites(key, favorites, favorites.filter(id => id !== noteId));
    }
  }

  async getFavoriteNoteIds(): Promise<string[]> {
    const user = getFirebaseAuth().currentUser;
    if (!user) return [];
    return JSON.parse(localStorage.getItem(`note_favorites_${user.uid}`) || '[]');
  }

  listenFavoriteNoteIds(cb: (noteIds: string[]) => void) {
    const user = getFirebaseAuth().currentUser;
    if (!user) { cb([]); return () => {}; }

    const key = `note_favorites_${user.uid}`;
    cb(JSON.parse(localStorage.getItem(key) || '[]'));

    const handleStorage = (e: StorageEvent) => {
      if (e.key === key) cb(JSON.parse(e.newValue || '[]'));
    };
    const handleCustom = (e: CustomEvent) => {
      if (e.detail?.key === key) cb(JSON.parse(e.detail.newValue || '[]'));
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('customStorage', handleCustom as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('customStorage', handleCustom as EventListener);
    };
  }
}

export const noteRepository = new NoteRepository();
