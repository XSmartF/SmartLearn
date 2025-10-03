import { NoteCard } from '../NoteCard';
import type { NoteID, NoteMeta } from '../../types';

interface NotesGridProps {
  notes: NoteMeta[];
  favoriteIds: Set<NoteID>;
  currentUserId: string;
  favoritesUpdating: boolean;
  onToggleFavorite: (noteId: NoteID, currentlyFavorite: boolean) => void;
  onEdit: (note: NoteMeta) => void;
  onDelete: (note: NoteMeta) => void;
}

export function NotesGrid({
  notes,
  favoriteIds,
  currentUserId,
  favoritesUpdating,
  onToggleFavorite,
  onEdit,
  onDelete,
}: NotesGridProps) {
  return (
    <div className="grid items-stretch gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full max-w-full overflow-x-hidden">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          isFav={favoriteIds.has(note.id)}
          onToggleFavorite={onToggleFavorite}
          onEdit={onEdit}
          onDelete={onDelete}
          currentUserId={currentUserId}
          favUpdating={favoritesUpdating}
        />
      ))}
    </div>
  );
}
