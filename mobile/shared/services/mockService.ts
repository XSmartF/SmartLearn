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
import { DEFAULT_GAME_MODES } from '@/shared/models/app';
import type { MobileDataService } from './contracts';

type MockStore = {
  libraries: MobileLibrary[];
  cards: MobileCard[];
  notes: MobileNote[];
  events: MobileStudyEvent[];
  notifications: MobileNotification[];
  profile: MobileProfile;
  settings: MobileSettings;
  cardFlags: MobileCardFlag[];
};

function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function addHours(iso: string, hours: number): string {
  return new Date(new Date(iso).getTime() + hours * 60 * 60 * 1000).toISOString();
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const initialNow = nowIso();

const store: MockStore = {
  libraries: [
    {
      id: 'lib_toeic',
      title: 'TOEIC Core Vocabulary',
      description: 'Bộ từ vựng cần nhớ cho mục tiêu 800+',
      cardCount: 4,
      subject: 'English',
      difficulty: 'medium',
      updatedAt: initialNow,
    },
    {
      id: 'lib_js',
      title: 'JavaScript Interview',
      description: 'Các câu hỏi JS/TS phản ứng nhanh',
      cardCount: 3,
      subject: 'Programming',
      difficulty: 'hard',
      updatedAt: initialNow,
    },
  ],
  cards: [
    { id: 'c1', libraryId: 'lib_toeic', front: 'abandon', back: 'to leave behind', difficulty: 'medium' },
    { id: 'c2', libraryId: 'lib_toeic', front: 'adapt', back: 'to adjust to new conditions', difficulty: 'easy' },
    { id: 'c3', libraryId: 'lib_toeic', front: 'asset', back: 'valuable resource', difficulty: 'medium' },
    { id: 'c4', libraryId: 'lib_toeic', front: 'boost', back: 'to improve', difficulty: 'easy' },
    { id: 'c5', libraryId: 'lib_js', front: 'Closure', back: 'Function + lexical scope', difficulty: 'hard' },
    { id: 'c6', libraryId: 'lib_js', front: 'Hoisting', back: 'Declaration moved before execution', difficulty: 'medium' },
    { id: 'c7', libraryId: 'lib_js', front: 'Event loop', back: 'Coordinates call stack and callback queue', difficulty: 'hard' },
  ],
  notes: [
    {
      id: 'n1',
      title: 'Kế hoạch ôn tập tuần này',
      content: '- TOEIC 30 phút/ngày\n- 2 buổi review JS\n- 1 mock test thứ 7',
      tags: ['plan', 'weekly'],
      updatedAt: initialNow,
    },
  ],
  events: [
    {
      id: 'e1',
      title: 'Review TOEIC set 1',
      startAt: addHours(initialNow, 4),
      endAt: addHours(initialNow, 5),
      status: 'upcoming',
      libraryId: 'lib_toeic',
    },
    {
      id: 'e2',
      title: 'Mini test JavaScript',
      startAt: addHours(initialNow, 20),
      endAt: addHours(initialNow, 21),
      status: 'upcoming',
      libraryId: 'lib_js',
    },
  ],
  notifications: [
    {
      id: 'no1',
      title: 'Nhắc nhở học tập',
      message: 'Bạn có 12 thẻ cần ôn tập hôm nay.',
      createdAt: initialNow,
      read: false,
    },
    {
      id: 'no2',
      title: 'Hoàn thành mục tiêu',
      message: 'Bạn đã đạt streak 7 ngày liên tiếp.',
      createdAt: addHours(initialNow, -8),
      read: true,
    },
  ],
  profile: {
    id: 'u_demo',
    displayName: 'SmartLearner',
    email: 'mobile-demo@smartlearn.local',
    targetMinutesPerDay: 45,
    timezone: 'Asia/Ho_Chi_Minh',
  },
  settings: {
    remindersEnabled: true,
    dailyGoalMinutes: 45,
    darkMode: false,
    language: 'vi',
  },
  cardFlags: [
    { id: 'flag_c5', userId: 'mock', libraryId: 'lib_js', cardId: 'c5', starred: true, difficulty: 'hard' },
    { id: 'flag_c7', userId: 'mock', libraryId: 'lib_js', cardId: 'c7', difficulty: 'hard' },
    { id: 'flag_c1', userId: 'mock', libraryId: 'lib_toeic', cardId: 'c1', starred: true },
  ],
};

function recalcLibraryCardCount(libraryId: string): void {
  const count = store.cards.filter((item) => item.libraryId === libraryId).length;
  const index = store.libraries.findIndex((item) => item.id === libraryId);
  if (index < 0) return;
  store.libraries[index] = {
    ...store.libraries[index],
    cardCount: count,
    updatedAt: nowIso(),
  };
}

function libraryDetailOf(library: MobileLibrary): MobileLibraryDetail {
  return {
    library: clone(library),
    cards: clone(store.cards.filter((item) => item.libraryId === library.id)),
  };
}

export class MockMobileDataService implements MobileDataService {
  async getDashboardSnapshot(): Promise<MobileDashboardSnapshot> {
    const totalCards = store.cards.length;
    const dueCards = store.cards.filter((item) => item.difficulty !== 'easy').length;
    const upcomingEvents = store.events.filter((item) => item.status === 'upcoming').length;
    const unreadNotifications = store.notifications.filter((item) => !item.read).length;
    return {
      totalLibraries: store.libraries.length,
      totalCards,
      dueCards,
      upcomingEvents,
      unreadNotifications,
      streakDays: 7,
    };
  }

  async listLibraries(): Promise<MobileLibrary[]> {
    return clone([...store.libraries].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  }

  async createLibrary(input: { title: string; description?: string }): Promise<MobileLibrary> {
    const created: MobileLibrary = {
      id: createId('lib'),
      title: input.title.trim(),
      description: input.description?.trim() || '',
      cardCount: 0,
      difficulty: 'medium',
      updatedAt: nowIso(),
    };
    store.libraries.unshift(created);
    return clone(created);
  }

  async getLibraryDetail(libraryId: string): Promise<MobileLibraryDetail | null> {
    const library = store.libraries.find((item) => item.id === libraryId);
    if (!library) return null;
    return libraryDetailOf(library);
  }

  async addCard(libraryId: string, input: { front: string; back: string }): Promise<MobileCard> {
    const card: MobileCard = {
      id: createId('card'),
      libraryId,
      front: input.front.trim(),
      back: input.back.trim(),
      difficulty: 'medium',
    };
    store.cards.unshift(card);
    recalcLibraryCardCount(libraryId);
    return clone(card);
  }

  async listNotes(): Promise<MobileNote[]> {
    return clone([...store.notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  }

  async getNote(noteId: string): Promise<MobileNote | null> {
    const found = store.notes.find((item) => item.id === noteId);
    return found ? clone(found) : null;
  }

  async createNote(input: { title: string; content?: string; tags?: string[] }): Promise<MobileNote> {
    const note: MobileNote = {
      id: createId('note'),
      title: input.title.trim() || 'Ghi chú mới',
      content: input.content?.trim() || '',
      tags: input.tags ?? [],
      updatedAt: nowIso(),
    };
    store.notes.unshift(note);
    return clone(note);
  }

  async updateNote(
    noteId: string,
    input: { title?: string; content?: string; tags?: string[] }
  ): Promise<MobileNote | null> {
    const index = store.notes.findIndex((item) => item.id === noteId);
    if (index < 0) return null;
    const current = store.notes[index];
    const updated: MobileNote = {
      ...current,
      title: input.title?.trim() ?? current.title,
      content: input.content ?? current.content,
      tags: input.tags ?? current.tags,
      updatedAt: nowIso(),
    };
    store.notes[index] = updated;
    return clone(updated);
  }

  async listStudyEvents(): Promise<MobileStudyEvent[]> {
    return clone([...store.events].sort((a, b) => a.startAt.localeCompare(b.startAt)));
  }

  async createStudyEvent(input: {
    title: string;
    startAt: string;
    endAt: string;
    libraryId?: string;
  }): Promise<MobileStudyEvent> {
    const event: MobileStudyEvent = {
      id: createId('event'),
      title: input.title.trim(),
      startAt: input.startAt,
      endAt: input.endAt,
      libraryId: input.libraryId,
      status: 'upcoming',
    };
    store.events.push(event);
    return clone(event);
  }

  async updateStudyEventStatus(eventId: string, status: StudyEventStatus): Promise<MobileStudyEvent | null> {
    const index = store.events.findIndex((item) => item.id === eventId);
    if (index < 0) return null;
    const updated = { ...store.events[index], status };
    store.events[index] = updated;
    return clone(updated);
  }

  async listNotifications(): Promise<MobileNotification[]> {
    return clone([...store.notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  async markAllNotificationsRead(): Promise<void> {
    store.notifications = store.notifications.map((item) => ({ ...item, read: true }));
  }

  async listGameModes(): Promise<MobileGameMode[]> {
    return DEFAULT_GAME_MODES;
  }

  async getProfile(): Promise<MobileProfile> {
    return clone(store.profile);
  }

  async updateProfile(input: Partial<Omit<MobileProfile, 'id' | 'email'>>): Promise<MobileProfile> {
    store.profile = {
      ...store.profile,
      ...input,
    };
    return clone(store.profile);
  }

  async getSettings(): Promise<MobileSettings> {
    return clone(store.settings);
  }

  async updateSettings(input: Partial<MobileSettings>): Promise<MobileSettings> {
    store.settings = {
      ...store.settings,
      ...input,
    };
    return clone(store.settings);
  }

  async buildTestSession(libraryId: string, questionCount: number): Promise<MobileTestQuestion[]> {
    const pool = store.cards.filter((item) => item.libraryId === libraryId);
    if (!pool.length) return [];
    const copy = [...pool];
    copy.sort(() => Math.random() - 0.5);
    const size = Math.min(Math.max(questionCount, 1), copy.length);
    const picked = copy.slice(0, size);
    return picked.map((item) => ({
      id: `q_${item.id}`,
      libraryId,
      prompt: item.front,
      answer: item.back,
    }));
  }

  async toggleCardStar(cardId: string, libraryId: string, starred: boolean): Promise<void> {
    const idx = store.cardFlags.findIndex((f) => f.cardId === cardId);
    if (starred) {
      if (idx >= 0) { store.cardFlags[idx].starred = true; }
      else { store.cardFlags.push({ id: `flag_${cardId}`, userId: 'mock', libraryId, cardId, starred: true }); }
    } else if (idx >= 0) {
      if (store.cardFlags[idx].difficulty === 'hard') { store.cardFlags[idx].starred = false; }
      else { store.cardFlags.splice(idx, 1); }
    }
  }

  async setCardDifficulty(cardId: string, libraryId: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<void> {
    const idx = store.cardFlags.findIndex((f) => f.cardId === cardId);
    if (difficulty === 'hard' || (idx >= 0 && store.cardFlags[idx].starred)) {
      if (idx >= 0) { store.cardFlags[idx].difficulty = difficulty; }
      else { store.cardFlags.push({ id: `flag_${cardId}`, userId: 'mock', libraryId, cardId, difficulty }); }
    } else if (idx >= 0) {
      store.cardFlags.splice(idx, 1);
    }
  }

  async getLibraryFlags(libraryId: string): Promise<MobileFlagMap> {
    const map: MobileFlagMap = {};
    store.cardFlags.filter((f) => f.libraryId === libraryId).forEach((f) => {
      map[f.cardId] = { starred: f.starred, difficulty: f.difficulty };
    });
    return map;
  }

  async listReviewFlags(): Promise<MobileCardFlag[]> {
    return clone(store.cardFlags.filter((f) => f.starred === true || f.difficulty === 'hard'));
  }
}

export const mockMobileDataService = new MockMobileDataService();
