import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { getDb, getFirebaseAuth } from '@/shared/lib/firebase/client';
import type { ICalendarRepository } from '@/shared/services/contracts';
import type { StudyEvent, CreateStudyEventInput } from '@/features/study/types/calendar';

const COLLECTION = 'calendar_events';
const db = getDb();

// Helper function to safely convert date fields
function convertToDate(dateField: unknown): Date {
  if (!dateField) return new Date();
  if (dateField instanceof Date) return dateField;
  if (typeof dateField === 'object' && dateField !== null && 'toDate' in dateField && typeof (dateField as { toDate?: () => Date }).toDate === 'function') {
    return (dateField as { toDate: () => Date }).toDate();
  }
  if (typeof dateField === 'string') {
    const parsed = new Date(dateField);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }
  if (typeof dateField === 'number') return new Date(dateField);
  return new Date();
}

function convertToIsoString(dateField: unknown): string {
  return convertToDate(dateField).toISOString();
}

function mapDocToEvent(docSnap: { id: string; data: () => Record<string, unknown> }): StudyEvent {
  const data = docSnap.data() as Record<string, unknown>;
  return {
    id: docSnap.id,
    userId: String(data.userId ?? ''),
    title: String(data.title ?? ''),
    description: String(data.description ?? ''),
    startTime: convertToDate(data.startTime),
    endTime: convertToDate(data.endTime),
    type: (data.type as StudyEvent['type']) ?? 'study',
    flashcardSet: String(data.flashcardSet ?? ''),
    cardCount: typeof data.cardCount === 'number' ? data.cardCount : 0,
    status: (data.status as StudyEvent['status']) ?? 'upcoming',
    createdAt: convertToIsoString(data.createdAt),
    updatedAt: convertToIsoString(data.updatedAt),
    cardId: typeof data.cardId === 'string' ? data.cardId : undefined,
    libraryId: typeof data.libraryId === 'string' ? data.libraryId : undefined,
    autoScheduled: typeof data.autoScheduled === 'boolean' ? data.autoScheduled : undefined,
    lastChoice: data.lastChoice as StudyEvent['lastChoice'],
    completedAt: data.completedAt ? convertToIsoString(data.completedAt) : undefined
  };
}

export class CalendarRepository implements ICalendarRepository {
  async createEvent(input: CreateStudyEventInput): Promise<StudyEvent> {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    const eventData = {
      ...input,
      userId: user.uid,
      status: 'upcoming' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COLLECTION), eventData);

    return {
      id: docRef.id,
      ...input,
      userId: user.uid,
      status: 'upcoming',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async updateEvent(id: string, updates: Partial<CreateStudyEventInput>): Promise<void> {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    const eventRef = doc(db, COLLECTION, id);
    await updateDoc(eventRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  async deleteEvent(id: string): Promise<void> {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    const eventRef = doc(db, COLLECTION, id);
    await deleteDoc(eventRef);
  }

  async getUserEvents(): Promise<StudyEvent[]> {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', user.uid)
    );

    const querySnapshot = await getDocs(q);
    const events = querySnapshot.docs.map(mapDocToEvent);
    return events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  listenUserEvents(callback: (events: StudyEvent[]) => void): () => void {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', user.uid)
    );

    return onSnapshot(q, (querySnapshot) => {
      const events: StudyEvent[] = querySnapshot
        ? querySnapshot.docs.map(mapDocToEvent)
        : [];
      callback(events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime()));
    });
  }

  async updateEventStatus(id: string, status: StudyEvent['status']): Promise<void> {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    const eventRef = doc(db, COLLECTION, id);
    await updateDoc(eventRef, {
      status,
      updatedAt: serverTimestamp()
    });
  }
}

export const calendarRepository = new CalendarRepository();
