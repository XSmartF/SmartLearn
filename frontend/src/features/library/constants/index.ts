import type { LibraryMeta } from '@/shared/lib/models';
import type { LibrarySortOption, LibraryTabOption } from '../types';

const getSafeDate = (value: string | number | Date | null | undefined) => {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

export const LIBRARY_SORT_OPTIONS: LibrarySortOption[] = [
  {
    id: 'newest',
    label: 'Mới nhất',
    description: 'Sắp xếp theo ngày tạo mới nhất',
    comparator: (a: LibraryMeta, b: LibraryMeta) => getSafeDate(b.createdAt) - getSafeDate(a.createdAt),
  },
  {
    id: 'oldest',
    label: 'Cũ nhất',
    description: 'Sắp xếp theo ngày tạo cũ nhất',
    comparator: (a: LibraryMeta, b: LibraryMeta) => getSafeDate(a.createdAt) - getSafeDate(b.createdAt),
  },
  {
    id: 'name-asc',
    label: 'Tên (A-Z)',
    comparator: (a: LibraryMeta, b: LibraryMeta) => a.title.localeCompare(b.title),
  },
  {
    id: 'name-desc',
    label: 'Tên (Z-A)',
    comparator: (a: LibraryMeta, b: LibraryMeta) => b.title.localeCompare(a.title),
  },
  {
    id: 'cards-desc',
    label: 'Nhiều thẻ nhất',
    comparator: (a: LibraryMeta, b: LibraryMeta) => (b.cardCount ?? 0) - (a.cardCount ?? 0),
  },
];

export const LIBRARY_TAB_OPTIONS: LibraryTabOption[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'favorites', label: 'Yêu thích' },
  { id: 'shared', label: 'Được chia sẻ' },
];
