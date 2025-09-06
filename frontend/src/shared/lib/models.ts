// Domain models & DTOs for SmartLearn personalization & sharing
// These are backend-agnostic interfaces so you can plug any persistence (Supabase/Firebase/Custom API)

import type { SerializedState, Card } from '../../features/study/utils/learnEngine';
export type { Card };

export type UserID = string;
export type LibraryID = string;
export type FlashcardID = string;

export interface UserProfile {
  id: UserID;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type LibraryVisibility = 'private' | 'public';

export interface LibraryMeta {
  id: LibraryID;
  ownerId: UserID;
  title: string;
  description?: string;
  // Optional subject/category for better distractor grouping
  subject?: string;
  // Optional difficulty label (easy/medium/hard...)
  difficulty?: string;
  tags?: string[];
  visibility: LibraryVisibility;
  cardCount: number; // denormalized for quick list renders
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface LibraryWithCards extends LibraryMeta {
  cards: Card[];
}

// Share roles (excluding implicit 'owner'). Renamed 'editor' -> 'contributor'.
// If legacy data still contains 'editor', service layer maps it to 'contributor'.
export type ShareRole = 'viewer' | 'contributor';

export interface LibraryShare {
  id: string; // share record id
  libraryId: LibraryID;
  grantedBy: UserID; // owner or contributor who granted
  targetUserId: UserID; // user receiving access
  role: ShareRole;
  createdAt: string; // ISO
}

// Alternative share via link
export interface LibraryShareLink {
  id: string;
  libraryId: LibraryID;
  token: string; // random 32+ chars
  role: ShareRole; // permission granted when link consumed
  expiresAt?: string; // ISO optional
  maxUses?: number; // optional cap
  useCount: number;
  createdAt: string;
}

export interface UserLibraryProgress {
  userId: UserID;
  libraryId: LibraryID;
  engineState: SerializedState; // serialized LearnEngine state
  updatedAt: string; // ISO
}

// Light DTO for list of shared libraries visible to a user
export interface AccessibleLibrary extends LibraryMeta {
  accessRole: ShareRole | 'owner';
  owner?: { id: UserID; displayName?: string; email?: string };
}

// Generic API response wrapper (optional)
export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

// Simple helper to generate ids (placeholder – replace with uuid lib or backend ids)
export function genId(prefix: string = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}
