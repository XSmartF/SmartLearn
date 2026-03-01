// ─── Service contracts ───────────────────────────────────────────────
// All interfaces are backend-agnostic.  Each provider (Firebase, REST API,
// mock, ...) must implement `DataServices` so the rest of the app stays
// decoupled from any persistence detail.
// ─────────────────────────────────────────────────────────────────────

import type { AuthAdapter } from '@/shared/lib/auth';
import type { SerializedState } from '@/features/study/utils/learnEngine';
import type { CreateStudyEventInput, StudyEvent } from '@/features/study/types/calendar';
import type { LibraryMeta, LibraryVisibility, ShareRole, LibraryShare, Card } from '@/shared/lib/models';
import type { NoteMeta } from '@/features/notes/types';

import type {
  UserSettings,
  UserSettingsUpdate,
  NotificationDoc,
  AccessRequestDoc,
  CreateNoteInput,
  UpdateNoteInput,
  CreateLibraryInput,
  CreateCardInput,
  UserLibraryProgressDoc,
  UserLibraryProgressSummary,
  ProgressSummaryLite,
  CardFlag,
  FlagMap,
} from '@/shared/types';

// ─── Repository interfaces ──────────────────────────────────────────

export interface ILibraryRepository {
  createLibrary(input: CreateLibraryInput): Promise<string>;
  updateLibrary(id: string, data: { title?: string; description?: string; visibility?: LibraryVisibility; tags?: string[]; subject?: string; difficulty?: string }): Promise<void>;
  getLibraryMeta(id: string): Promise<LibraryMeta | null>;
  createCard(input: CreateCardInput): Promise<void>;
  createCardsBulk(libraryId: string, items: { front: string; back: string; domain?: string }[]): Promise<number>;
  fetchLibrariesByIds(ids: string[]): Promise<LibraryMeta[]>;
  listenUserLibraries(cb: (libs: LibraryMeta[]) => void): () => void;
  recalcLibraryCardCount(libraryId: string): Promise<number>;
  deleteLibrary(id: string): Promise<void>;
}

export interface ICardRepository {
  listCards(libraryId: string): Promise<Card[]>;
  listCardsPreferCache(libraryId: string): Promise<Card[]>;
  listenLibraryCards(libraryId: string, cb: (cards: Card[]) => void): () => void;
  getCard(cardId: string): Promise<Card | null>;
  updateCard(cardId: string, data: { front?: string; back?: string; domain?: string | null; difficulty?: 'easy' | 'medium' | 'hard' | null }): Promise<void>;
  deleteCard(cardId: string): Promise<void>;
  deleteCardsBulk(cardIds: string[]): Promise<number>;
}

export interface IShareRepository {
  addShare(libraryId: string, targetUserId: string, role: ShareRole): Promise<void>;
  listShares(libraryId: string): Promise<LibraryShare[]>;
  removeShare(shareId: string): Promise<void>;
  updateShareRole(shareId: string, role: ShareRole): Promise<void>;
  listenUserSharedLibraries(cb: (shares: { libraryId: string; role: ShareRole }[]) => void): () => void;
  listenCurrentUserShareForLibrary(libraryId: string, cb: (share: { id: string; role: ShareRole } | null) => void): () => void;
}

export interface IUserRepository {
  listenUserFavoriteLibraryIds(cb: (ids: string[]) => void): () => void;
  addFavorite(libraryId: string): Promise<void>;
  removeFavorite(libraryId: string): Promise<void>;
  getUserProfile(userId: string): Promise<{ id: string; email?: string; displayName?: string; avatarUrl?: string } | null>;
  findUserByEmail(email: string): Promise<{ id: string; email?: string; displayName?: string }[]>;
  listenUserSettings(cb: (settings: UserSettings) => void): () => void;
  getUserSettings(): Promise<UserSettings>;
  updateUserSettings(patch: UserSettingsUpdate): Promise<UserSettings>;
  listenUserNotifications(cb: (items: NotificationDoc[]) => void): () => void;
  markNotificationRead(id: string): Promise<void>;
  markAllNotificationsRead(): Promise<void>;
  createNotification(userId: string, input: { type: string; title: string; message: string; data?: Record<string, unknown> }): Promise<void>;
  createAccessRequest(libraryId: string, ownerId: string): Promise<string>;
  listenPendingAccessRequestsForOwner(cb: (reqs: AccessRequestDoc[]) => void): () => void;
  actOnAccessRequest(reqId: string, approve: boolean): Promise<void>;
  listAccessRequestsForOwner(): Promise<AccessRequestDoc[]>;
  listUserAccessRequests(libraryId: string): Promise<AccessRequestDoc[]>;
}

export interface IProgressRepository {
  getUserLibraryProgress(libraryId: string): Promise<UserLibraryProgressDoc | null>;
  upsertUserLibraryProgress(libraryId: string, engineState: Record<string, unknown>): Promise<string>;
  computeBasicProgressStats(libraryId: string): Promise<{ mastered: number; learning: number; due: number; total: number }>;
  getAllUserProgressForLibrary(libraryId: string): Promise<UserLibraryProgressDoc[]>;
  getAllUserProgressSummariesForLibrary(libraryId: string): Promise<UserLibraryProgressSummary[]>;
}

export interface INoteRepository {
  createNote(input: CreateNoteInput): Promise<string>;
  updateNote(id: string, data: UpdateNoteInput): Promise<void>;
  getNote(id: string): Promise<NoteMeta | null>;
  deleteNote(id: string): Promise<void>;
  listenUserNotes(cb: (notes: NoteMeta[]) => void): () => void;
  addFavorite(noteId: string): Promise<void>;
  removeFavorite(noteId: string): Promise<void>;
  getFavoriteNoteIds(): Promise<string[]>;
  listenFavoriteNoteIds(cb: (noteIds: string[]) => void): () => void;
}

export interface ICardFlagRepository {
  toggleStar(cardId: string, libraryId: string, starred: boolean): Promise<void>;
  setDifficulty(cardId: string, libraryId: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<void>;
  listenLibraryFlags(libraryId: string, cb: (flags: FlagMap) => void): () => void;
  listenReviewFlags(cb: (flags: CardFlag[]) => void): () => void;
  listReviewFlags(): Promise<CardFlag[]>;
}

export interface ICalendarRepository {
  createEvent(input: CreateStudyEventInput): Promise<StudyEvent>;
  updateEvent(id: string, updates: Partial<CreateStudyEventInput>): Promise<void>;
  deleteEvent(id: string): Promise<void>;
  getUserEvents(): Promise<StudyEvent[]>;
  listenUserEvents(callback: (events: StudyEvent[]) => void): () => void;
  updateEventStatus(id: string, status: StudyEvent['status']): Promise<void>;
}

// ─── Aggregated service container ────────────────────────────────────

export interface DataServices {
  libraryRepository: ILibraryRepository;
  cardRepository: ICardRepository;
  shareRepository: IShareRepository;
  userRepository: IUserRepository;
  progressRepository: IProgressRepository;
  noteRepository: INoteRepository;
  cardFlagRepository: ICardFlagRepository;
  calendarRepository: ICalendarRepository;

  createAuthAdapter: () => AuthAdapter;
  preloadFirestore: () => void;
  getCurrentUserId: () => string | null;

  // Progress persistence (engine state + summary)
  loadProgress: (libraryId: string) => Promise<SerializedState | null>;
  saveProgress: (libraryId: string, engineState: SerializedState) => Promise<void>;
  loadProgressSummary: (libraryId: string) => Promise<ProgressSummaryLite | null>;
  listenProgressSummary: (libraryId: string, cb: (summary: ProgressSummaryLite | null) => void) => () => void;
}
