import { resolveDataServices } from './provider';

export type { DataServices } from './contracts';
export type {
  ILibraryRepository,
  ICardRepository,
  IShareRepository,
  IUserRepository,
  IProgressRepository,
  INoteRepository,
  ICardFlagRepository,
  ICalendarRepository,
} from './contracts';
export { resolveDataServices };

const dataServices = resolveDataServices();

export const {
  libraryRepository,
  cardRepository,
  shareRepository,
  userRepository,
  progressRepository,
  noteRepository,
  cardFlagRepository,
  calendarRepository,
  createAuthAdapter,
  preloadFirestore,
  getCurrentUserId,
  loadProgress,
  saveProgress,
  loadProgressSummary,
  listenProgressSummary,
} = dataServices;

// Re-export domain types from shared/types so consumers keep importing from '@/shared/services'
export {
  defaultUserSettings,
  mergeUserSettings,
} from '@/shared/types';

export type {
  AccessRequestDoc,
  NotificationDoc,
  UserFavoriteRecord,
  UserSettings,
  UserSettingsUpdate,
  CreateNoteInput,
  UpdateNoteInput,
  CreateLibraryInput,
  CreateCardInput,
  UserLibraryProgressDoc,
  UserLibraryProgressSummary,
  ProgressSummaryLite,
  CardFlag,
  CardFlagDoc,
  FlagMap,
} from '@/shared/types';
