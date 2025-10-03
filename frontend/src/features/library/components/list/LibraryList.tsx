import type { LibraryListItem } from '../../types';
import { FlashcardListItem } from '../shared/FlashcardListItem';

const getAuthorLabel = (item: LibraryListItem, currentUserId: string) => {
  if (item.library.ownerId === currentUserId) {
    return 'Bạn';
  }
  return (
    item.owner?.displayName ||
    item.owner?.email ||
    item.owner?.id?.slice(0, 6) ||
    '—'
  );
};

interface LibraryListProps {
  items: LibraryListItem[];
  currentUserId: string;
}

export function LibraryList({ items, currentUserId }: LibraryListProps) {
  if (!items.length) return null;

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <FlashcardListItem
          key={item.library.id}
          flashcard={item.library}
          role={item.role}
          owner={item.owner ?? undefined}
          authorLabel={getAuthorLabel(item, currentUserId)}
        />
      ))}
    </div>
  );
}
