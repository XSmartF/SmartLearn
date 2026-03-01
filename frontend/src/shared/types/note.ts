// Domain types for note operations — backend-agnostic

export interface CreateNoteInput {
  title: string;
  content?: string;
  tags?: string[];
  visibility?: 'private' | 'public';
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  tags?: string[];
  visibility?: 'private' | 'public';
}
