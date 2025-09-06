// Study session orchestration per user + per library
// This service composes LearnEngine with persistence boundaries.

import { LearnEngine, type Card, type SerializedState } from '../../features/study/utils/learnEngine';
import type { UserID, LibraryID, UserLibraryProgress } from './models';

export interface SessionContext {
  engine: LearnEngine;
  userId: UserID;
  libraryId: LibraryID;
}

export interface SessionPersistenceAdapter {
  loadProgress(userId: UserID, libraryId: LibraryID): Promise<UserLibraryProgress | null>;
  saveProgress(progress: UserLibraryProgress): Promise<void>;
  loadLibraryCards(libraryId: LibraryID): Promise<Card[]>; // throws if not permitted
}

export class SessionService {
  private cache: Map<string, SessionContext> = new Map();
  private adapter: SessionPersistenceAdapter;
  constructor(adapter: SessionPersistenceAdapter) {
    this.adapter = adapter;
  }

  private key(userId: UserID, libraryId: LibraryID) {
    return `${userId}::${libraryId}`;
  }

  async getSession(userId: UserID, libraryId: LibraryID): Promise<SessionContext> {
    const k = this.key(userId, libraryId);
    const cached = this.cache.get(k);
    if (cached) return cached;

    // Load cards
    const cards = await this.adapter.loadLibraryCards(libraryId);

    // Attempt restore
    let engine: LearnEngine;
    const saved = await this.adapter.loadProgress(userId, libraryId);
    if (saved) {
      engine = new LearnEngine({ cards });
      engine.restore(saved.engineState);
    } else {
      engine = new LearnEngine({ cards });
    }

    const ctx: SessionContext = { engine, userId, libraryId };
    this.cache.set(k, ctx);
    return ctx;
  }

  async nextQuestion(userId: UserID, libraryId: LibraryID) {
    const { engine } = await this.getSession(userId, libraryId);
    return engine.nextQuestion();
  }

  async submitAnswer(userId: UserID, libraryId: LibraryID, cardId: string, answer: string | number | null, ms?: number) {
    const { engine } = await this.getSession(userId, libraryId);
    const res = engine.submitAnswer(cardId, answer, { ms });
    await this.persist(userId, libraryId, engine.serialize());
    return res;
  }

  async persist(userId: UserID, libraryId: LibraryID, engineState: SerializedState) {
    await this.adapter.saveProgress({
      userId,
      libraryId,
      engineState,
      updatedAt: new Date().toISOString(),
    });
  }

  // Force save (e.g., on tab close)
  async flush(userId: UserID, libraryId: LibraryID) {
    const ctx = this.cache.get(this.key(userId, libraryId));
    if (!ctx) return;
    await this.persist(userId, libraryId, ctx.engine.serialize());
  }

  // Remove from memory (optional)
  drop(userId: UserID, libraryId: LibraryID) {
    this.cache.delete(this.key(userId, libraryId));
  }
}
