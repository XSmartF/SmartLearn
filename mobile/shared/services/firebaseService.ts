import {
  addDoc,
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  increment,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

import type {
  AppLanguage,
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
import { DEFAULT_GAME_MODES } from '@/shared/models/app';
import { getDb, getFirebaseAuth } from '@/shared/firebase/client';
import type { MobileDataService } from './contracts';

const COLLECTIONS = {
  libraries: 'libraries',
  cards: 'cards',
  notes: 'notes',
  events: 'calendar_events',
  notifications: 'notifications',
  users: 'users',
  shares: 'shares',
  progress: 'progress',
  cardFlags: 'card_flags',
} as const;

type TimestampLike = { toMillis?: () => number; seconds?: number };

function toIso(value: unknown): string {
  if (!value) return '';
  if (value instanceof Date) {
    const t = value.getTime();
    return Number.isFinite(t) ? value.toISOString() : '';
  }
  if (typeof value === 'string') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return '';
    return new Date(value).toISOString();
  }
  if (typeof value === 'object' && value !== null) {
    const ts = value as TimestampLike;
    if (typeof ts.toMillis === 'function') {
      const ms = ts.toMillis();
      return Number.isFinite(ms) ? new Date(ms).toISOString() : '';
    }
    if (typeof ts.seconds === 'number' && Number.isFinite(ts.seconds)) {
      return new Date(ts.seconds * 1000).toISOString();
    }
  }
  return '';
}

function requireUserId(): string {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.uid;
}

function safeNum(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function mapLibrary(id: string, data: Record<string, unknown>): MobileLibrary {
  return {
    id,
    title: String(data.title ?? ''),
    description: String(data.description ?? ''),
    cardCount: safeNum(data.cardCount),
    subject: typeof data.subject === 'string' ? data.subject : undefined,
    difficulty: (data.difficulty as MobileLibrary['difficulty']) ?? 'medium',
    updatedAt: toIso(data.updatedAt) || toIso(data.createdAt) || new Date(0).toISOString(),
  };
}

function mapCard(id: string, data: Record<string, unknown>): MobileCard {
  return {
    id,
    libraryId: String(data.libraryId ?? ''),
    front: String(data.front ?? ''),
    back: String(data.back ?? ''),
    difficulty: (data.difficulty as MobileCard['difficulty']) ?? 'medium',
  };
}

function mapNote(id: string, data: Record<string, unknown>): MobileNote {
  return {
    id,
    title: String(data.title ?? ''),
    content: String(data.content ?? ''),
    tags: Array.isArray(data.tags) ? data.tags.map((item) => String(item)) : [],
    updatedAt: toIso(data.updatedAt) || toIso(data.createdAt) || new Date(0).toISOString(),
  };
}

function mapStudyEvent(id: string, data: Record<string, unknown>): MobileStudyEvent {
  return {
    id,
    title: String(data.title ?? ''),
    startAt: toIso(data.startTime ?? data.startAt) || new Date().toISOString(),
    endAt: toIso(data.endTime ?? data.endAt) || new Date().toISOString(),
    status: (data.status as StudyEventStatus) ?? 'upcoming',
    libraryId: typeof data.libraryId === 'string' ? data.libraryId : undefined,
  };
}

function mapNotification(id: string, data: Record<string, unknown>): MobileNotification {
  return {
    id,
    title: String(data.title ?? ''),
    message: String(data.message ?? ''),
    createdAt: toIso(data.createdAt) || new Date(0).toISOString(),
    read: Boolean(data.read),
  };
}

async function loadAccessibleLibraryIds(userId: string): Promise<string[]> {
  const db = getDb();
  const q = query(collection(db, COLLECTIONS.shares), where('targetUserId', '==', userId));
  const snap = await getDocs(q);
  const ids: string[] = [];
  snap.forEach((item) => {
    const value = item.data() as Record<string, unknown>;
    if (typeof value.libraryId === 'string') ids.push(value.libraryId);
  });
  return ids;
}

async function loadLibrariesByIds(ids: string[]): Promise<MobileLibrary[]> {
  if (!ids.length) return [];
  const db = getDb();
  const chunks: string[][] = [];
  for (let index = 0; index < ids.length; index += 10) chunks.push(ids.slice(index, index + 10));
  const results: MobileLibrary[] = [];

  for (const chunk of chunks) {
    const q = query(collection(db, COLLECTIONS.libraries), where(documentId(), 'in', chunk));
    const snap = await getDocs(q);
    snap.forEach((item) => {
      const data = item.data() as Record<string, unknown>;
      if (data.__deleted === true) return;
      results.push(mapLibrary(item.id, data));
    });
  }

  return results;
}

export class FirebaseMobileDataService implements MobileDataService {
  private readonly db = getDb();

  async getDashboardSnapshot(): Promise<MobileDashboardSnapshot> {
    const userId = requireUserId();
    const libraries = await this.listLibraries();
    const detailList = await Promise.all(libraries.map((item) => this.getLibraryDetail(item.id)));
    const totalCards = detailList.reduce((sum, item) => sum + (item?.cards.length ?? 0), 0);

    const progressSnap = await getDocs(query(collection(this.db, COLLECTIONS.progress), where('userId', '==', userId)));
    let dueCards = 0;
    progressSnap.forEach((item) => {
      if (!item.id.endsWith('__summary')) return;
      const data = item.data() as Record<string, unknown>;
      dueCards += safeNum(data.due);
    });

    const events = await this.listStudyEvents();
    const notifications = await this.listNotifications();

    return {
      totalLibraries: libraries.length,
      totalCards,
      dueCards,
      upcomingEvents: events.filter((item) => item.status === 'upcoming').length,
      unreadNotifications: notifications.filter((item) => !item.read).length,
      streakDays: 0,
    };
  }

  async listLibraries(): Promise<MobileLibrary[]> {
    const userId = requireUserId();

    const ownedSnap = await getDocs(
      query(collection(this.db, COLLECTIONS.libraries), where('ownerId', '==', userId))
    );

    const map = new Map<string, MobileLibrary>();
    ownedSnap.forEach((item) => {
      const data = item.data() as Record<string, unknown>;
      if (data.__deleted === true) return;
      map.set(item.id, mapLibrary(item.id, data));
    });

    const sharedIds = await loadAccessibleLibraryIds(userId);
    const sharedLibraries = await loadLibrariesByIds(sharedIds);
    sharedLibraries.forEach((item) => {
      if (!map.has(item.id)) map.set(item.id, item);
    });

    return Array.from(map.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async createLibrary(input: { title: string; description?: string }): Promise<MobileLibrary> {
    const userId = requireUserId();
    const now = serverTimestamp();
    const ref = await addDoc(collection(this.db, COLLECTIONS.libraries), {
      ownerId: userId,
      title: input.title.trim(),
      description: input.description?.trim() ?? '',
      subject: '',
      difficulty: 'medium',
      tags: [],
      visibility: 'private',
      cardCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    const snap = await getDoc(doc(this.db, COLLECTIONS.libraries, ref.id));
    const data = snap.data() as Record<string, unknown>;
    return mapLibrary(ref.id, data);
  }

  async getLibraryDetail(libraryId: string): Promise<MobileLibraryDetail | null> {
    const librarySnap = await getDoc(doc(this.db, COLLECTIONS.libraries, libraryId));
    if (!librarySnap.exists()) return null;
    const libraryData = librarySnap.data() as Record<string, unknown>;
    if (libraryData.__deleted === true) return null;
    const library = mapLibrary(librarySnap.id, libraryData);

    const cardsSnap = await getDocs(
      query(collection(this.db, COLLECTIONS.cards), where('libraryId', '==', libraryId), limit(2000))
    );
    const cards: MobileCard[] = [];
    cardsSnap.forEach((item) => cards.push(mapCard(item.id, item.data() as Record<string, unknown>)));

    return { library, cards };
  }

  async addCard(libraryId: string, input: { front: string; back: string }): Promise<MobileCard> {
    requireUserId();
    const now = serverTimestamp();
    const ref = await addDoc(collection(this.db, COLLECTIONS.cards), {
      libraryId,
      front: input.front.trim(),
      back: input.back.trim(),
      difficulty: 'medium',
      domain: null,
      createdAt: now,
      updatedAt: now,
    });

    await updateDoc(doc(this.db, COLLECTIONS.libraries, libraryId), {
      cardCount: increment(1),
      updatedAt: serverTimestamp(),
    });

    const snap = await getDoc(doc(this.db, COLLECTIONS.cards, ref.id));
    return mapCard(ref.id, snap.data() as Record<string, unknown>);
  }

  async listNotes(): Promise<MobileNote[]> {
    const userId = requireUserId();
    const snap = await getDocs(query(collection(this.db, COLLECTIONS.notes), where('ownerId', '==', userId)));
    const items: MobileNote[] = [];
    snap.forEach((item) => {
      const data = item.data() as Record<string, unknown>;
      if (data.__deleted === true) return;
      items.push(mapNote(item.id, data));
    });
    return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getNote(noteId: string): Promise<MobileNote | null> {
    const snap = await getDoc(doc(this.db, COLLECTIONS.notes, noteId));
    if (!snap.exists()) return null;
    const data = snap.data() as Record<string, unknown>;
    if (data.__deleted === true) return null;
    return mapNote(snap.id, data);
  }

  async createNote(input: { title: string; content?: string; tags?: string[] }): Promise<MobileNote> {
    const userId = requireUserId();
    const now = serverTimestamp();
    const ref = await addDoc(collection(this.db, COLLECTIONS.notes), {
      ownerId: userId,
      title: input.title.trim(),
      content: input.content ?? '',
      tags: input.tags ?? [],
      visibility: 'private',
      createdAt: now,
      updatedAt: now,
    });
    const snap = await getDoc(doc(this.db, COLLECTIONS.notes, ref.id));
    return mapNote(ref.id, snap.data() as Record<string, unknown>);
  }

  async updateNote(
    noteId: string,
    input: { title?: string; content?: string; tags?: string[] }
  ): Promise<MobileNote | null> {
    const patch: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };
    if (input.title !== undefined) patch.title = input.title.trim();
    if (input.content !== undefined) patch.content = input.content;
    if (input.tags !== undefined) patch.tags = input.tags;
    await updateDoc(doc(this.db, COLLECTIONS.notes, noteId), patch);
    return this.getNote(noteId);
  }

  async listStudyEvents(): Promise<MobileStudyEvent[]> {
    const userId = requireUserId();
    const snap = await getDocs(query(collection(this.db, COLLECTIONS.events), where('userId', '==', userId)));
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
    const ref = await addDoc(collection(this.db, COLLECTIONS.events), {
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

    const snap = await getDoc(doc(this.db, COLLECTIONS.events, ref.id));
    return mapStudyEvent(ref.id, snap.data() as Record<string, unknown>);
  }

  async updateStudyEventStatus(eventId: string, status: StudyEventStatus): Promise<MobileStudyEvent | null> {
    await updateDoc(doc(this.db, COLLECTIONS.events, eventId), {
      status,
      updatedAt: serverTimestamp(),
    });
    const snap = await getDoc(doc(this.db, COLLECTIONS.events, eventId));
    if (!snap.exists()) return null;
    return mapStudyEvent(snap.id, snap.data() as Record<string, unknown>);
  }

  async listNotifications(): Promise<MobileNotification[]> {
    const userId = requireUserId();
    const snap = await getDocs(query(collection(this.db, COLLECTIONS.notifications), where('userId', '==', userId)));
    const items: MobileNotification[] = [];
    snap.forEach((item) => items.push(mapNotification(item.id, item.data() as Record<string, unknown>)));
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async markAllNotificationsRead(): Promise<void> {
    const userId = requireUserId();
    const snap = await getDocs(
      query(
        collection(this.db, COLLECTIONS.notifications),
        where('userId', '==', userId),
        where('read', '==', false),
        limit(200)
      )
    );
    const tasks: Promise<void>[] = [];
    snap.forEach((item) => {
      tasks.push(updateDoc(doc(this.db, COLLECTIONS.notifications, item.id), { read: true }) as unknown as Promise<void>);
    });
    await Promise.all(tasks);
  }

  async listGameModes(): Promise<MobileGameMode[]> {
    return DEFAULT_GAME_MODES;
  }

  async getProfile(): Promise<MobileProfile> {
    const userId = requireUserId();
    const currentAuth = getFirebaseAuth().currentUser;
    const userSnap = await getDoc(doc(this.db, COLLECTIONS.users, userId));
    const data = userSnap.exists() ? (userSnap.data() as Record<string, unknown>) : {};
    const settings = (data.settings as Record<string, unknown> | undefined) ?? {};
    const profile = (settings.profile as Record<string, unknown> | undefined) ?? {};
    const study = (settings.study as Record<string, unknown> | undefined) ?? {};

    return {
      id: userId,
      displayName:
        (typeof data.displayName === 'string' && data.displayName) ||
        (typeof profile.displayName === 'string' && profile.displayName) ||
        currentAuth?.displayName ||
        '',
      email: currentAuth?.email ?? (typeof data.email === 'string' ? data.email : ''),
      targetMinutesPerDay:
        typeof study.dailyGoalMinutes === 'number' ? study.dailyGoalMinutes : 45,
      timezone: typeof profile.timezone === 'string' ? profile.timezone : 'Asia/Ho_Chi_Minh',
    };
  }

  async updateProfile(input: Partial<Omit<MobileProfile, 'id' | 'email'>>): Promise<MobileProfile> {
    const userId = requireUserId();
    const payload: Record<string, unknown> = {};
    if (input.displayName !== undefined) payload.displayName = input.displayName;
    if (input.targetMinutesPerDay !== undefined) payload['settings.study.dailyGoalMinutes'] = input.targetMinutesPerDay;
    if (input.timezone !== undefined) payload['settings.profile.timezone'] = input.timezone;
    if (input.displayName !== undefined) payload['settings.profile.displayName'] = input.displayName;
    payload.updatedAt = serverTimestamp();

    await setDoc(doc(this.db, COLLECTIONS.users, userId), payload, { merge: true });
    return this.getProfile();
  }

  async getSettings(): Promise<MobileSettings> {
    const userId = requireUserId();
    const userSnap = await getDoc(doc(this.db, COLLECTIONS.users, userId));
    const data = userSnap.exists() ? (userSnap.data() as Record<string, unknown>) : {};
    const settings = (data.settings as Record<string, unknown> | undefined) ?? {};
    const notifications = (settings.notifications as Record<string, unknown> | undefined) ?? {};
    const study = (settings.study as Record<string, unknown> | undefined) ?? {};
    const appearance = (settings.appearance as Record<string, unknown> | undefined) ?? {};
    const profile = (settings.profile as Record<string, unknown> | undefined) ?? {};
    const rawLanguage = profile.language;
    const language: AppLanguage = rawLanguage === 'en' ? 'en' : 'vi';

    return {
      remindersEnabled:
        typeof notifications.studyReminders === 'boolean' ? notifications.studyReminders : true,
      dailyGoalMinutes: typeof study.dailyGoalMinutes === 'number' ? study.dailyGoalMinutes : 45,
      darkMode: appearance.theme === 'dark',
      language,
    };
  }

  async updateSettings(input: Partial<MobileSettings>): Promise<MobileSettings> {
    const userId = requireUserId();
    const existing = await this.getSettings();
    const next: MobileSettings = {
      remindersEnabled: input.remindersEnabled ?? existing.remindersEnabled,
      dailyGoalMinutes: input.dailyGoalMinutes ?? existing.dailyGoalMinutes,
      darkMode: input.darkMode ?? existing.darkMode,
      language: input.language ?? existing.language,
    };

    await setDoc(
      doc(this.db, COLLECTIONS.users, userId),
      {
        settings: {
          notifications: {
            studyReminders: next.remindersEnabled,
          },
          study: {
            dailyGoalMinutes: next.dailyGoalMinutes,
          },
          appearance: {
            theme: next.darkMode ? 'dark' : 'light',
          },
          profile: {
            language: next.language,
          },
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return next;
  }

  async buildTestSession(libraryId: string, questionCount: number): Promise<MobileTestQuestion[]> {
    const snap = await getDocs(
      query(collection(this.db, COLLECTIONS.cards), where('libraryId', '==', libraryId), limit(200))
    );
    const pool: MobileCard[] = [];
    snap.forEach((item) => pool.push(mapCard(item.id, item.data() as Record<string, unknown>)));
    pool.sort(() => Math.random() - 0.5);
    const count = Math.min(Math.max(questionCount, 1), pool.length);
    return pool.slice(0, count).map((item) => ({
      id: `q_${item.id}`,
      libraryId,
      prompt: item.front,
      answer: item.back,
    }));
  }

  // ── Card Flags ────────────────────────────────────────────────

  private flagDocId(userId: string, cardId: string) {
    return `${userId}__${cardId}`;
  }

  async toggleCardStar(cardId: string, libraryId: string, starred: boolean): Promise<void> {
    const userId = requireUserId();
    const ref = doc(this.db, COLLECTIONS.cardFlags, this.flagDocId(userId, cardId));
    const snapshot = await getDoc(ref);
    const existing = snapshot.exists() ? (snapshot.data() as Record<string, unknown>) : undefined;

    if (!starred) {
      if (snapshot.exists()) {
        if (existing?.difficulty === 'hard') {
          await setDoc(ref, { userId, libraryId, cardId, starred: false, updatedAt: serverTimestamp() }, { merge: true });
        } else {
          const { deleteDoc: del } = await import('firebase/firestore');
          await del(ref);
        }
      }
      return;
    }

    const payload: Record<string, unknown> = { userId, libraryId, cardId, starred: true, updatedAt: serverTimestamp() };
    if (existing?.difficulty) payload.difficulty = existing.difficulty;
    await setDoc(ref, payload, { merge: true });
  }

  async setCardDifficulty(cardId: string, libraryId: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<void> {
    const userId = requireUserId();
    const ref = doc(this.db, COLLECTIONS.cardFlags, this.flagDocId(userId, cardId));
    const snapshot = await getDoc(ref);
    const existing = snapshot.exists() ? (snapshot.data() as Record<string, unknown>) : undefined;
    const hasStar = existing?.starred === true;

    if (difficulty === 'hard' || hasStar) {
      const payload: Record<string, unknown> = { userId, libraryId, cardId, difficulty, updatedAt: serverTimestamp() };
      if (typeof existing?.starred === 'boolean') payload.starred = existing.starred;
      await setDoc(ref, payload, { merge: true });
      return;
    }

    if (snapshot.exists()) {
      const { deleteDoc: del } = await import('firebase/firestore');
      await del(ref);
    }
  }

  async getLibraryFlags(libraryId: string): Promise<MobileFlagMap> {
    const userId = requireUserId();
    const q = query(
      collection(this.db, COLLECTIONS.cardFlags),
      where('userId', '==', userId),
      where('libraryId', '==', libraryId),
    );
    const snap = await getDocs(q);
    const map: MobileFlagMap = {};
    snap.forEach((d) => {
      const data = d.data() as Record<string, unknown>;
      const cid = String(data.cardId ?? '');
      if (cid) map[cid] = { starred: data.starred === true, difficulty: (data.difficulty as MobileCardFlag['difficulty']) };
    });
    return map;
  }

  async listReviewFlags(): Promise<MobileCardFlag[]> {
    const userId = requireUserId();
    const q = query(collection(this.db, COLLECTIONS.cardFlags), where('userId', '==', userId));
    const snap = await getDocs(q);
    const list: MobileCardFlag[] = [];
    snap.forEach((d) => {
      const data = d.data() as Record<string, unknown>;
      if (data.starred === true || data.difficulty === 'hard') {
        list.push({
          id: d.id,
          userId: String(data.userId ?? ''),
          libraryId: String(data.libraryId ?? ''),
          cardId: String(data.cardId ?? ''),
          starred: data.starred === true,
          difficulty: (data.difficulty as MobileCardFlag['difficulty']),
        });
      }
    });
    return list;
  }
}

export const firebaseMobileDataService = new FirebaseMobileDataService();
