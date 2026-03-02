import { firebaseAuthService } from '@/shared/repositories/firebase/AuthService';
import { firebaseCardFlagRepository } from '@/shared/repositories/firebase/CardFlagRepository';
import { FirebaseDashboardRepository } from '@/shared/repositories/firebase/DashboardRepository';
import { firebaseGameRepository } from '@/shared/repositories/firebase/GameRepository';
import { firebaseLibraryRepository } from '@/shared/repositories/firebase/LibraryRepository';
import { firebaseNoteRepository } from '@/shared/repositories/firebase/NoteRepository';
import { firebaseNotificationRepository } from '@/shared/repositories/firebase/NotificationRepository';
import { firebaseStudyEventRepository } from '@/shared/repositories/firebase/StudyEventRepository';
import { firebaseTestRepository } from '@/shared/repositories/firebase/TestRepository';
import { firebaseUserRepository } from '@/shared/repositories/firebase/UserRepository';
import type { MobileDataServices } from './contracts';

export const firebaseDataServices: MobileDataServices = {
  authService: firebaseAuthService,
  libraryRepository: firebaseLibraryRepository,
  noteRepository: firebaseNoteRepository,
  studyEventRepository: firebaseStudyEventRepository,
  notificationRepository: firebaseNotificationRepository,
  userRepository: firebaseUserRepository,
  testRepository: firebaseTestRepository,
  cardFlagRepository: firebaseCardFlagRepository,
  gameRepository: firebaseGameRepository,
  dashboardRepository: new FirebaseDashboardRepository(
    firebaseLibraryRepository,
    firebaseStudyEventRepository,
    firebaseNotificationRepository,
  ),
};
