import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { MobileNote } from '@/shared/models/app';
import { getDb } from '@/shared/firebase/client';
import { COLLECTIONS, mapNote, requireUserId } from './helpers';
import type { INoteRepository } from '@/shared/services/contracts';

const db = getDb();

export class FirebaseNoteRepository implements INoteRepository {
  async listNotes(): Promise<MobileNote[]> {
    const userId = requireUserId();
    const snap = await getDocs(
      query(collection(db, COLLECTIONS.notes), where('ownerId', '==', userId)),
    );
    const items: MobileNote[] = [];
    snap.forEach((item) => {
      const data = item.data() as Record<string, unknown>;
      if (data.__deleted === true) return;
      items.push(mapNote(item.id, data));
    });
    return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getNote(noteId: string): Promise<MobileNote | null> {
    const snap = await getDoc(doc(db, COLLECTIONS.notes, noteId));
    if (!snap.exists()) return null;
    const data = snap.data() as Record<string, unknown>;
    if (data.__deleted === true) return null;
    return mapNote(snap.id, data);
  }

  async createNote(input: { title: string; content?: string; tags?: string[] }): Promise<MobileNote> {
    const userId = requireUserId();
    const now = serverTimestamp();
    const ref = await addDoc(collection(db, COLLECTIONS.notes), {
      ownerId: userId,
      title: input.title.trim(),
      content: input.content ?? '',
      tags: input.tags ?? [],
      visibility: 'private',
      createdAt: now,
      updatedAt: now,
    });
    const snap = await getDoc(doc(db, COLLECTIONS.notes, ref.id));
    return mapNote(ref.id, snap.data() as Record<string, unknown>);
  }

  async updateNote(
    noteId: string,
    input: { title?: string; content?: string; tags?: string[] },
  ): Promise<MobileNote | null> {
    const patch: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };
    if (input.title !== undefined) patch.title = input.title.trim();
    if (input.content !== undefined) patch.content = input.content;
    if (input.tags !== undefined) patch.tags = input.tags;
    await updateDoc(doc(db, COLLECTIONS.notes, noteId), patch);
    return this.getNote(noteId);
  }
}

export const firebaseNoteRepository = new FirebaseNoteRepository();
