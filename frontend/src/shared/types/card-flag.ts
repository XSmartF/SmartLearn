// Domain types for card flags — backend-agnostic

export interface CardFlagDoc {
  userId: string;
  libraryId: string;
  cardId: string;
  starred?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  updatedAt?: unknown;
}

export interface CardFlag extends CardFlagDoc {
  id: string;
}

export type FlagMap = Record<string, { starred?: boolean; difficulty?: 'easy' | 'medium' | 'hard' }>;
