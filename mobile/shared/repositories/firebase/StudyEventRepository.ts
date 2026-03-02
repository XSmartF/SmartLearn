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
import type { MobileStudyEvent, StudyEventStatus } from '@/shared/models/app';
import { getDb } from '@/shared/firebase/client';
import { COLLECTIONS, mapStudyEvent, requireUserId } from './helpers';
import type { IStudyEventRepository } from '@/shared/services/contracts';

const db = getDb();

export class FirebaseStudyEventRepository implements IStudyEventRepository {
  async listStudyEvents(): Promise<MobileStudyEvent[]> {
    const userId = requireUserId();
    const snap = await getDocs(
      query(collection(db, COLLECTIONS.events), where('userId', '==', userId)),
    );
    const items: MobileStudyEvent[] = [];
    snap.forEach((item) => {
      items.push(mapStudyEvent(item.id, item.data() as Record<string, unknown>));
    });
    return items.sort((a, b) => a.startAt.localeCompare(b.startAt));
  }

  async createStudyEvent(input: {
    title: string;
    startAt: string;
    endAt: string;
    libraryId?: string;
  }): Promise<MobileStudyEvent> {
    const userId = requireUserId();
    const ref = await addDoc(collection(db, COLLECTIONS.events), {
      userId,
      title: input.title.trim(),
      description: '',
      startTime: input.startAt,
      endTime: input.endAt,
      type: 'study',
      status: 'upcoming',
      libraryId: input.libraryId ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const snap = await getDoc(doc(db, COLLECTIONS.events, ref.id));
    return mapStudyEvent(ref.id, snap.data() as Record<string, unknown>);
  }

  async updateStudyEventStatus(
    eventId: string,
    status: StudyEventStatus,
  ): Promise<MobileStudyEvent | null> {
    await updateDoc(doc(db, COLLECTIONS.events, eventId), {
      status,
      updatedAt: serverTimestamp(),
    });
    const snap = await getDoc(doc(db, COLLECTIONS.events, eventId));
    if (!snap.exists()) return null;
    return mapStudyEvent(snap.id, snap.data() as Record<string, unknown>);
  }
}

export const firebaseStudyEventRepository = new FirebaseStudyEventRepository();
