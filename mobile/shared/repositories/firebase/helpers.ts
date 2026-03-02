import type {
  MobileCard,
  MobileLibrary,
  MobileNote,
  MobileNotification,
  MobileStudyEvent,
  StudyEventStatus,
} from '@/shared/models/app';
import { getFirebaseAuth } from '@/shared/firebase/client';

// ── Timestamp helpers ───────────────────────────────────────────

type TimestampLike = { toMillis?: () => number; seconds?: number };

export function toIso(value: unknown): string {
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

export function safeNum(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

// ── Auth helper ─────────────────────────────────────────────────

export function requireUserId(): string {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.uid;
}

// ── Firestore collection names ──────────────────────────────────

export const COLLECTIONS = {
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

// ── Document mappers ────────────────────────────────────────────

export function mapLibrary(id: string, data: Record<string, unknown>): MobileLibrary {
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

export function mapCard(id: string, data: Record<string, unknown>): MobileCard {
  return {
    id,
    libraryId: String(data.libraryId ?? ''),
    front: String(data.front ?? ''),
    back: String(data.back ?? ''),
    difficulty: (data.difficulty as MobileCard['difficulty']) ?? 'medium',
  };
}

export function mapNote(id: string, data: Record<string, unknown>): MobileNote {
  return {
    id,
    title: String(data.title ?? ''),
    content: String(data.content ?? ''),
    tags: Array.isArray(data.tags) ? data.tags.map((item) => String(item)) : [],
    updatedAt: toIso(data.updatedAt) || toIso(data.createdAt) || new Date(0).toISOString(),
  };
}

export function mapStudyEvent(id: string, data: Record<string, unknown>): MobileStudyEvent {
  return {
    id,
    title: String(data.title ?? ''),
    startAt: toIso(data.startTime ?? data.startAt) || new Date().toISOString(),
    endAt: toIso(data.endTime ?? data.endAt) || new Date().toISOString(),
    status: (data.status as StudyEventStatus) ?? 'upcoming',
    libraryId: typeof data.libraryId === 'string' ? data.libraryId : undefined,
  };
}

export function mapNotification(id: string, data: Record<string, unknown>): MobileNotification {
  return {
    id,
    title: String(data.title ?? ''),
    message: String(data.message ?? ''),
    createdAt: toIso(data.createdAt) || new Date(0).toISOString(),
    read: Boolean(data.read),
  };
}
