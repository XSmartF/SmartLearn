import type { FieldValue } from 'firebase/firestore';
import { getDb, getFirebaseAuth } from '@/shared/lib/firebaseClient';
import type { NoteMeta } from '@/features/notes/types';
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
  onSnapshot
} from 'firebase/firestore';

const NOTES = 'notes';
const db = getDb();

export interface CreateNoteInput {
  title: string;
  content?: string;
  tags?: string[];
  visibility?: 'private' | 'public';
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  tags?: string[];
  visibility?: 'private' | 'public';
}

export class NoteRepository {
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
      updatedAt: now
    });

    invalidateCache('notes:');
    return ref.id;
  }

  async updateNote(id: string, data: UpdateNoteInput) {
    const patch: { [key: string]: string | string[] | FieldValue | undefined } = {};
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
      if (!snap.exists()) return null;

      const data = snap.data();
      if (data.__deleted === true) return null;

      return {
        id: snap.id,
        ownerId: data.ownerId,
        title: data.title,
        content: data.content,
        tags: data.tags ?? [],
        visibility: data.visibility,
        createdAt: data.createdAt?.toMillis ? new Date(data.createdAt.toMillis()).toISOString() : '',
        updatedAt: data.updatedAt?.toMillis ? new Date(data.updatedAt.toMillis()).toISOString() : ''
      } as NoteMeta;
    });
  }

  async deleteNote(id: string) {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    await updateDoc(doc(db, NOTES, id), {
      __deleted: true,
      updatedAt: serverTimestamp()
    });

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

      const qOwned = query(collection(db, NOTES), where('ownerId', '==', user.uid));
      unsub = onSnapshot(qOwned, snap => {
        const arr: NoteMeta[] = [];
        if (snap) {
          snap.forEach(docSnap => {
            const d = docSnap.data();
            if (d.__deleted !== true) {
              arr.push({
                id: docSnap.id,
                ownerId: d.ownerId,
                title: d.title,
                content: d.content,
                tags: d.tags ?? [],
                visibility: d.visibility,
                createdAt: d.createdAt?.toMillis ? new Date(d.createdAt.toMillis()).toISOString() : '',
                updatedAt: d.updatedAt?.toMillis ? new Date(d.updatedAt.toMillis()).toISOString() : ''
              });
            }
          });
        }
        cb(arr);
      });
    })();

    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }

  // Favorites methods - using localStorage for simplicity
  async addFavorite(noteId: string) {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    const key = `note_favorites_${user.uid}`;
    const favorites = JSON.parse(localStorage.getItem(key) || '[]');
    if (!favorites.includes(noteId)) {
      const newFavorites = [...favorites, noteId];
      localStorage.setItem(key, JSON.stringify(newFavorites));
      // Trigger storage event for cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: JSON.stringify(newFavorites),
        oldValue: JSON.stringify(favorites)
      }));
      // Also dispatch custom event for same-tab sync
      window.dispatchEvent(new CustomEvent('customStorage', { 
        detail: { key, newValue: JSON.stringify(newFavorites) } 
      }));
    }
  }

  async removeFavorite(noteId: string) {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    const key = `note_favorites_${user.uid}`;
    const favorites = JSON.parse(localStorage.getItem(key) || '[]');
    if (favorites.includes(noteId)) {
      const newFavorites = favorites.filter((id: string) => id !== noteId);
      localStorage.setItem(key, JSON.stringify(newFavorites));
      // Trigger storage event for cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: JSON.stringify(newFavorites),
        oldValue: JSON.stringify(favorites)
      }));
      // Also dispatch custom event for same-tab sync
      window.dispatchEvent(new CustomEvent('customStorage', { 
        detail: { key, newValue: JSON.stringify(newFavorites) } 
      }));
    }
  }

  async getFavoriteNoteIds(): Promise<string[]> {
    const user = getFirebaseAuth().currentUser;
    if (!user) return [];

    const key = `note_favorites_${user.uid}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  listenFavoriteNoteIds(cb: (noteIds: string[]) => void) {
    const user = getFirebaseAuth().currentUser;
    if (!user) {
      cb([]);
      return () => {};
    }

    const key = `note_favorites_${user.uid}`;
    
    // Initial call
    cb(JSON.parse(localStorage.getItem(key) || '[]'));

    // Listen for storage changes (works across tabs and manual dispatches)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        cb(JSON.parse(e.newValue || '[]'));
      }
    };

    // Also listen for custom events dispatched from same tab
    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === key) {
        cb(JSON.parse(e.detail.newValue || '[]'));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('customStorage', handleCustomStorageChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customStorage', handleCustomStorageChange as EventListener);
    };
  }
}

export const noteRepository = new NoteRepository();