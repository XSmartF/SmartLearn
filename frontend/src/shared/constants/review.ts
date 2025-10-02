export const REVIEW_SESSION_STORAGE_KEY = 'smartlearn.reviewSession';

export interface ReviewSessionPayload {
  libraryId: string;
  cardIds: string[];
  createdAt: number;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function parsePayload(raw: string | null): ReviewSessionPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ReviewSessionPayload>;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.libraryId || !Array.isArray(parsed.cardIds)) return null;
    return {
      libraryId: String(parsed.libraryId),
      cardIds: parsed.cardIds.map((id) => String(id)).filter(Boolean),
      createdAt: typeof parsed.createdAt === 'number' ? parsed.createdAt : Date.now(),
    };
  } catch (error) {
    console.error('Không thể phân tích dữ liệu session ôn tập:', error);
    return null;
  }
}

export function setReviewSession(payload: { libraryId: string; cardIds: string[] }): void {
  if (!isBrowser()) return;
  const value: ReviewSessionPayload = {
    libraryId: payload.libraryId,
    cardIds: payload.cardIds,
    createdAt: Date.now(),
  };
  try {
    sessionStorage.setItem(REVIEW_SESSION_STORAGE_KEY, JSON.stringify(value));
  } catch (error) {
    console.error('Không thể lưu phiên ôn tập:', error);
  }
}

export function getReviewSession(): ReviewSessionPayload | null {
  if (!isBrowser()) return null;
  const raw = sessionStorage.getItem(REVIEW_SESSION_STORAGE_KEY);
  return parsePayload(raw);
}

export function clearReviewSession(): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.removeItem(REVIEW_SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Không thể xoá phiên ôn tập:', error);
  }
}

export function consumeReviewSession(libraryId: string): ReviewSessionPayload | null {
  const session = getReviewSession();
  if (!session || session.libraryId !== libraryId) {
    return null;
  }
  clearReviewSession();
  return session;
}
