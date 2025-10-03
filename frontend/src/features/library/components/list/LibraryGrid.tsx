import type { LibraryListItem } from '../../types';
import type { LibraryMeta } from '@/shared/lib/models';
import { FlashcardCard } from '../shared/FlashcardCard';

interface LibraryGridProps {
  items: LibraryListItem[];
  currentUserId: string;
  favoritesUpdating: boolean;
  onToggleFavorite: (libraryId: string, isFavorite: boolean) => void;
  onEdit: (library: LibraryMeta) => void;
  onDelete: (library: LibraryMeta) => void;
}

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

export function LibraryGrid({
  items,
  currentUserId,
  favoritesUpdating,
  onToggleFavorite,
  onEdit,
  onDelete,
}: LibraryGridProps) {
  if (!items.length) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => {
        const { library, owner, role, isFavorite } = item;
        const authorLabel = getAuthorLabel(item, currentUserId);

        return (
          <div key={library.id} className="h-full">
            <FlashcardCard
              flashcard={library}
              isFav={isFavorite}
              role={role ?? undefined}
              owner={owner ?? undefined}
              authorLabel={authorLabel}
              onToggleFavorite={onToggleFavorite}
              onEdit={onEdit}
              onDelete={onDelete}
              currentUserId={currentUserId}
              favUpdating={favoritesUpdating}
            />
          </div>
        );
      })}
    </div>
  );
}
