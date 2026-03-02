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

// ── Auth ────────────────────────────────────────────────────────

export interface MobileAuthUser {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface IAuthService {
  getCurrentUser(): MobileAuthUser | null;
  listenAuthState(callback: (user: MobileAuthUser | null) => void): () => void;
  signInEmailPassword(email: string, password: string): Promise<MobileAuthUser>;
  signUpEmailPassword(email: string, password: string, displayName?: string): Promise<MobileAuthUser>;
  signInWithGoogle(idToken: string, accessToken?: string | null): Promise<MobileAuthUser>;
  signOut(): Promise<void>;
}

// ── Library ─────────────────────────────────────────────────────

export interface ILibraryRepository {
  listLibraries(): Promise<MobileLibrary[]>;
  createLibrary(input: { title: string; description?: string }): Promise<MobileLibrary>;
  getLibraryDetail(libraryId: string): Promise<MobileLibraryDetail | null>;
  addCard(libraryId: string, input: { front: string; back: string }): Promise<MobileCard>;
}

// ── Note ────────────────────────────────────────────────────────

export interface INoteRepository {
  listNotes(): Promise<MobileNote[]>;
  getNote(noteId: string): Promise<MobileNote | null>;
  createNote(input: { title: string; content?: string; tags?: string[] }): Promise<MobileNote>;
  updateNote(
    noteId: string,
    input: { title?: string; content?: string; tags?: string[] },
  ): Promise<MobileNote | null>;
}

// ── Study Event ─────────────────────────────────────────────────

export interface IStudyEventRepository {
  listStudyEvents(): Promise<MobileStudyEvent[]>;
  createStudyEvent(input: {
    title: string;
    startAt: string;
    endAt: string;
    libraryId?: string;
  }): Promise<MobileStudyEvent>;
  updateStudyEventStatus(
    eventId: string,
    status: StudyEventStatus,
  ): Promise<MobileStudyEvent | null>;
}

// ── Notification ────────────────────────────────────────────────

export interface INotificationRepository {
  listNotifications(): Promise<MobileNotification[]>;
  markAllNotificationsRead(): Promise<void>;
}

// ── User (Profile + Settings) ───────────────────────────────────

export interface IUserRepository {
  getProfile(): Promise<MobileProfile>;
  updateProfile(
    input: Partial<Omit<MobileProfile, 'id' | 'email'>>,
  ): Promise<MobileProfile>;
  getSettings(): Promise<MobileSettings>;
  updateSettings(input: Partial<MobileSettings>): Promise<MobileSettings>;
}

// ── Test ────────────────────────────────────────────────────────

export interface ITestRepository {
  buildTestSession(
    libraryId: string,
    questionCount: number,
  ): Promise<MobileTestQuestion[]>;
}

// ── Card Flag ───────────────────────────────────────────────────

export interface ICardFlagRepository {
  toggleCardStar(
    cardId: string,
    libraryId: string,
    starred: boolean,
  ): Promise<void>;
  setCardDifficulty(
    cardId: string,
    libraryId: string,
    difficulty: 'easy' | 'medium' | 'hard',
  ): Promise<void>;
  getLibraryFlags(libraryId: string): Promise<MobileFlagMap>;
  listReviewFlags(): Promise<MobileCardFlag[]>;
}

// ── Game ────────────────────────────────────────────────────────

export interface IGameRepository {
  listGameModes(): Promise<MobileGameMode[]>;
}

// ── Dashboard ───────────────────────────────────────────────────

export interface IDashboardRepository {
  getDashboardSnapshot(): Promise<MobileDashboardSnapshot>;
}

// ── Service Container ───────────────────────────────────────────

export interface MobileDataServices {
  authService: IAuthService;
  libraryRepository: ILibraryRepository;
  noteRepository: INoteRepository;
  studyEventRepository: IStudyEventRepository;
  notificationRepository: INotificationRepository;
  userRepository: IUserRepository;
  testRepository: ITestRepository;
  cardFlagRepository: ICardFlagRepository;
  gameRepository: IGameRepository;
  dashboardRepository: IDashboardRepository;
}
