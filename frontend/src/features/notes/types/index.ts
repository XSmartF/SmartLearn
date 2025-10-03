export type NoteID = string;

export type NoteVisibility = 'private' | 'public';

export interface NoteMeta {
  id: NoteID;
  ownerId: string;
  title: string;
  content?: string; // Blocknote JSON content
  tags?: string[];
  visibility: NoteVisibility;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type NoteSortId = 'newest' | 'oldest' | 'title';

export interface NoteSortOption {
  id: NoteSortId;
  label: string;
  comparator: (a: NoteMeta, b: NoteMeta) => number;
}

export type NoteTabId = 'all' | 'favorites';

export interface NoteTabOption {
  id: NoteTabId;
  label: string;
}