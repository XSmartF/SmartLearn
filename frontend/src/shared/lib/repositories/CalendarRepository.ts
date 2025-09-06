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
import { getDb, getFirebaseAuth } from '@/shared/lib/firebaseClient';
import type { StudyEvent, CreateStudyEventInput } from '../../../features/study/types/calendar';

const COLLECTION = 'calendar_events';
const db = getDb();

// Helper function to safely convert date fields
function convertToDate(dateField: unknown): Date {
  if (!dateField) return new Date();

  // If it's already a Date object
  if (dateField instanceof Date) return dateField;

  // If it's a Firestore Timestamp
  if (typeof dateField === 'object' && dateField !== null && 'toDate' in dateField && typeof dateField.toDate === 'function') {
    return dateField.toDate();
  }

  // If it's a string, try to parse it
  if (typeof dateField === 'string') {
    const parsed = new Date(dateField);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  // If it's a number (timestamp), convert it
  if (typeof dateField === 'number') {
    return new Date(dateField);
  }

  // Fallback
  return new Date();
}

export class CalendarRepository {
  static async createEvent(input: CreateStudyEventInput): Promise<StudyEvent> {
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

  static async updateEvent(id: string, updates: Partial<CreateStudyEventInput>): Promise<void> {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    const eventRef = doc(db, COLLECTION, id);
    await updateDoc(eventRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  static async deleteEvent(id: string): Promise<void> {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    const eventRef = doc(db, COLLECTION, id);
    await deleteDoc(eventRef);
  }

  static async getUserEvents(): Promise<StudyEvent[]> {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    // Alternative: Get all user events and sort in memory to avoid composite index
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', user.uid)
    );

    const querySnapshot = await getDocs(q);
    const events = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startTime: convertToDate(doc.data().startTime),
      endTime: convertToDate(doc.data().endTime)
    })) as StudyEvent[];

    // Sort by startTime in memory
    return events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  static listenUserEvents(callback: (events: StudyEvent[]) => void): () => void {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    // Alternative: Listen to all user events and sort in memory
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', user.uid)
    );

    return onSnapshot(q, (querySnapshot) => {
      const events = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: convertToDate(doc.data().startTime),
        endTime: convertToDate(doc.data().endTime)
      })) as StudyEvent[];

      // Sort by startTime in memory
      const sortedEvents = events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      callback(sortedEvents);
    });
  }
}
