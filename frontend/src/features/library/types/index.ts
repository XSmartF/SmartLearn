import type { LibraryMeta, ShareRole } from '@/shared/lib/models';

export type LibraryViewMode = 'grid' | 'list';

export type LibrarySortId = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'cards-desc';

export type LibraryTabId = 'all' | 'favorites' | 'shared';

export interface LibrarySortOption {
  id: LibrarySortId;
  label: string;
  description?: string;
  comparator: (a: LibraryMeta, b: LibraryMeta) => number;
}

export interface LibraryTabOption {
  id: LibraryTabId;
  label: string;
  badgeTone?: 'default' | 'primary' | 'accent';
}

export interface LibraryOwnerProfile {
  id: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
}

export interface LibraryListItem {
  library: LibraryMeta;
  owner: LibraryOwnerProfile | null;
  role: ShareRole | null;
  isFavorite: boolean;
}

export interface LibrarySummary {
  ownedCount: number;
  sharedCount: number;
  favoriteCount: number;
}
