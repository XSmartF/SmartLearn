import type {
  MobileCard,
  MobileCardFlag,
  MobileDashboardSnapshot,
  MobileFlagMap,
  MobileGameMode,
  MobileLibrary,
  MobileLibraryDetail,
  MobileNote,
  MobileNotification,
  MobileProfile,
  MobileSettings,
  MobileStudyEvent,
  MobileTestQuestion,
  StudyEventStatus,
} from '@/shared/models/app';

export interface MobileDataService {
  getDashboardSnapshot(): Promise<MobileDashboardSnapshot>;
  listLibraries(): Promise<MobileLibrary[]>;
  createLibrary(input: { title: string; description?: string }): Promise<MobileLibrary>;
  getLibraryDetail(libraryId: string): Promise<MobileLibraryDetail | null>;
  addCard(libraryId: string, input: { front: string; back: string }): Promise<MobileCard>;

  listNotes(): Promise<MobileNote[]>;
  getNote(noteId: string): Promise<MobileNote | null>;
  createNote(input: { title: string; content?: string; tags?: string[] }): Promise<MobileNote>;
  updateNote(noteId: string, input: { title?: string; content?: string; tags?: string[] }): Promise<MobileNote | null>;

  listStudyEvents(): Promise<MobileStudyEvent[]>;
  createStudyEvent(input: { title: string; startAt: string; endAt: string; libraryId?: string }): Promise<MobileStudyEvent>;
  updateStudyEventStatus(eventId: string, status: StudyEventStatus): Promise<MobileStudyEvent | null>;

  listNotifications(): Promise<MobileNotification[]>;
  markAllNotificationsRead(): Promise<void>;

  listGameModes(): Promise<MobileGameMode[]>;

  getProfile(): Promise<MobileProfile>;
  updateProfile(input: Partial<Omit<MobileProfile, 'id' | 'email'>>): Promise<MobileProfile>;
  getSettings(): Promise<MobileSettings>;
  updateSettings(input: Partial<MobileSettings>): Promise<MobileSettings>;

  buildTestSession(libraryId: string, questionCount: number): Promise<MobileTestQuestion[]>;

  toggleCardStar(cardId: string, libraryId: string, starred: boolean): Promise<void>;
  setCardDifficulty(cardId: string, libraryId: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<void>;
  getLibraryFlags(libraryId: string): Promise<MobileFlagMap>;
  listReviewFlags(): Promise<MobileCardFlag[]>;
}
