// Domain types for progress tracking — backend-agnostic

export interface UserLibraryProgressDoc {
  id: string;
  userId: string;
  libraryId: string;
  engineState: Record<string, unknown> | null;
  updatedAt: string;
}

export interface UserLibraryProgressSummary {
  userId: string;
  libraryId: string;
  total: number;
  mastered: number;
  learning: number;
  due: number;
  percentMastered: number;
  updatedAt: string;
}

export interface ProgressSummaryLite {
  total: number;
  mastered: number;
  learning: number;
  due: number;
  percentMastered: number;
  accuracyOverall?: number;
  sessionCount?: number;
  lastAccessed?: string;
  updatedAt?: string;
}
