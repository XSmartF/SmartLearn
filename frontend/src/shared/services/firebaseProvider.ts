import { getFirebaseAuth, preloadFirestore } from '@/shared/lib/firebase/client';
import { FirebaseAuthAdapter } from '@/shared/lib/firebase/auth-adapter';
import {
  loadProgress,
  saveProgress,
  loadProgressSummary,
  listenProgressSummary,
} from '@/shared/lib/firebase/progress-service';
import { cardFlagRepository } from '@/shared/lib/repositories/CardFlagRepository';
import { cardRepository } from '@/shared/lib/repositories/CardRepository';
import { calendarRepository } from '@/shared/lib/repositories/CalendarRepository';
import { libraryRepository } from '@/shared/lib/repositories/LibraryRepository';
import { noteRepository } from '@/shared/lib/repositories/NoteRepository';
import { progressRepository } from '@/shared/lib/repositories/ProgressRepository';
import { shareRepository } from '@/shared/lib/repositories/ShareRepository';
import { userRepository } from '@/shared/lib/repositories/UserRepository';
import type { DataServices } from './contracts';

export const firebaseDataServices: DataServices = {
  libraryRepository,
  cardRepository,
  shareRepository,
  userRepository,
  progressRepository,
  noteRepository,
  cardFlagRepository,
  calendarRepository,
  createAuthAdapter: () => new FirebaseAuthAdapter(),
  preloadFirestore,
  getCurrentUserId: () => getFirebaseAuth().currentUser?.uid ?? null,
  loadProgress,
  saveProgress,
  loadProgressSummary,
  listenProgressSummary,
};
