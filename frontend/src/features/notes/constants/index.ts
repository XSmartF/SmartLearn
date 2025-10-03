import type { NoteMeta, NoteSortOption, NoteTabOption } from '../types';

export const NOTE_SORT_OPTIONS: NoteSortOption[] = [
  {
    id: 'newest',
    label: 'Mới nhất',
  comparator: (a: NoteMeta, b: NoteMeta) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  },
  {
    id: 'oldest',
    label: 'Cũ nhất',
  comparator: (a: NoteMeta, b: NoteMeta) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
  },
  {
    id: 'title',
    label: 'Theo tên',
  comparator: (a: NoteMeta, b: NoteMeta) => a.title.localeCompare(b.title),
  },
];

export const NOTE_TAB_OPTIONS: NoteTabOption[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'favorites', label: 'Yêu thích' },
];
