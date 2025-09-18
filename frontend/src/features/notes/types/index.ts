export type NoteID = string;

export interface NoteMeta {
  id: NoteID;
  ownerId: string;
  title: string;
  content?: string; // Blocknote JSON content
  tags?: string[];
  visibility: 'private' | 'public';
  createdAt: string; // ISO
  updatedAt: string; // ISO
}