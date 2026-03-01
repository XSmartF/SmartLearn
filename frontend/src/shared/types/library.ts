// Domain types for library operations — backend-agnostic

import type { LibraryVisibility } from '@/shared/lib/models';

export interface CreateLibraryInput {
  title: string;
  description?: string;
  subject?: string;
  difficulty?: string;
  tags?: string[];
  visibility?: LibraryVisibility;
}

export interface CreateCardInput {
  libraryId: string;
  front: string;
  back: string;
  domain?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}
