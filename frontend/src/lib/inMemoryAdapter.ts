// In-memory implementation of SessionPersistenceAdapter for early development / demo

import type { SessionPersistenceAdapter } from './sessionService';
import type { UserID, LibraryID, UserLibraryProgress, LibraryWithCards } from './models';
import type { Card } from './learnEngine';

interface MemoryData {
  libraries: Map<LibraryID, LibraryWithCards>;
  progress: Map<string, UserLibraryProgress>; // key: user::library
}

export class InMemoryAdapter implements SessionPersistenceAdapter {
  private data: MemoryData = {
    libraries: new Map(),
    progress: new Map(),
  };

  upsertLibrary(lib: LibraryWithCards) {
    this.data.libraries.set(lib.id, lib);
  }

  async loadLibraryCards(libraryId: LibraryID): Promise<Card[]> {
    const lib = this.data.libraries.get(libraryId);
    if (!lib) throw new Error('Library not found');
    return lib.cards;
  }

  async loadProgress(userId: UserID, libraryId: LibraryID) {
    return this.data.progress.get(`${userId}::${libraryId}`) ?? null;
  }

  async saveProgress(p: UserLibraryProgress) {
    this.data.progress.set(`${p.userId}::${p.libraryId}`, p);
  }
}
