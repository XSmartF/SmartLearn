import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Star, Layers, Users, Edit3, Trash2, Share2 } from 'lucide-react';
import type { LibraryMeta, ShareRole } from '@/shared/lib/models';
import { getLibraryDetailPath } from '@/shared/constants/routes';
import { VisibilityBadge } from './VisibilityBadge';
import { cn } from '@/shared/lib/utils';

interface FlashcardCardProps {
  flashcard: LibraryMeta;
  isFav: boolean;
  role?: ShareRole | null;
  owner?: { id: string; displayName?: string; email?: string; avatarUrl?: string } | null;
  authorLabel: string;
  onToggleFavorite: (id: string, isFav: boolean) => void;
  onEdit?: (lib: LibraryMeta) => void;
  onDelete?: (lib: LibraryMeta) => void;
  currentUserId: string;
  favUpdating: boolean;
}

const CARD_GRADIENTS = [
  'from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-950/40 dark:via-blue-950/40 dark:to-cyan-950/40 border-indigo-200 dark:border-indigo-800',
  'from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/40 dark:via-purple-950/40 dark:to-fuchsia-950/40 border-violet-200 dark:border-violet-800',
  'from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-cyan-950/40 border-emerald-200 dark:border-emerald-800',
  'from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-red-950/40 border-amber-200 dark:border-amber-800',
  'from-rose-50 via-pink-50 to-fuchsia-50 dark:from-rose-950/40 dark:via-pink-950/40 dark:to-fuchsia-950/40 border-rose-200 dark:border-rose-800',
  'from-sky-50 via-blue-50 to-indigo-50 dark:from-sky-950/40 dark:via-blue-950/40 dark:to-indigo-950/40 border-sky-200 dark:border-sky-800',
];

export function FlashcardCard({
  flashcard,
  isFav,
  role,
  owner,
  authorLabel,
  onToggleFavorite,
  onEdit,
  onDelete,
  currentUserId,
  favUpdating,
}: FlashcardCardProps) {
  const gradientIndex = flashcard.id
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % CARD_GRADIENTS.length;
  const cardGradient = CARD_GRADIENTS[gradientIndex];

  return (
    <div className="group h-full">
      <Card
        className={cn(
          'relative flex h-full w-full flex-col overflow-hidden border-2 bg-gradient-to-br transition-all duration-300 supports-[hover:hover]:hover:-translate-y-2 supports-[hover:hover]:hover:scale-[1.03] supports-[hover:hover]:hover:shadow-2xl',
          cardGradient,
        )}
      >
        {isFav && (
          <div className="absolute right-3 top-3 z-10">
            <div className="rounded-full bg-yellow-400 p-1.5 text-yellow-900 shadow-lg dark:bg-yellow-500 dark:text-yellow-950">
              <Star className="h-3.5 w-3.5 fill-current" />
            </div>
          </div>
        )}

        <div className="absolute right-0 top-0 hidden h-24 w-24 -translate-y-12 translate-x-12 rounded-bl-full bg-gradient-to-br from-white/40 to-transparent transition-transform duration-500 group-hover:scale-150 dark:from-white/10 sm:block" />

        <Link to={getLibraryDetailPath(flashcard.id)} className="flex flex-1 min-w-0 flex-col">
          <CardHeader className="relative z-10 pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 rounded-lg bg-white/60 p-2 shadow-sm backdrop-blur-sm dark:bg-white/10">
                    <Layers className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="flex-1 text-base font-bold leading-snug transition-colors line-clamp-2 group-hover:text-primary sm:text-lg">
                    {flashcard.title}
                  </CardTitle>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {role ? (
                    <Badge variant="default" className="gap-1 text-xs font-semibold shadow-sm">
                      <Users className="h-3 w-3" />
                      Chia sẻ • {role === 'viewer' ? 'Viewer' : 'Contributor'}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs font-semibold shadow-sm">
                      Sở hữu
                    </Badge>
                  )}
                  <div className="flex items-center gap-1.5 rounded-full bg-white/60 px-2 py-1 backdrop-blur-sm dark:bg-white/10">
                    {owner?.avatarUrl ? (
                      <Avatar src={owner.avatarUrl} alt={authorLabel} size={16} className="h-4 w-4" fallback={authorLabel.slice(0, 1)} />
                    ) : (
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-[8px] font-bold uppercase text-primary">
                        {authorLabel.slice(0, 1)}
                      </div>
                    )}
                    <span className="max-w-[100px] truncate text-[10px] font-medium text-foreground/80">{authorLabel}</span>
                  </div>
                </div>

                {flashcard.description && (
                  <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2 sm:text-sm">
                    {flashcard.description}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 flex flex-1 flex-col justify-between pt-0">
            {flashcard.tags && flashcard.tags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {flashcard.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs font-medium backdrop-blur-sm">
                    {tag}
                  </Badge>
                ))}
                {flashcard.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs font-medium backdrop-blur-sm">
                    +{flashcard.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border/50 pt-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                <div className="rounded-md bg-primary/10 p-1.5">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                </div>
                <span>{flashcard.cardCount} thẻ</span>
              </div>
              <VisibilityBadge visibility={flashcard.visibility} showLabel={false} />
            </div>
          </CardContent>
        </Link>

        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 opacity-100 transition-all duration-300 supports-[hover:hover]:pointer-events-none supports-[hover:hover]:opacity-0 supports-[hover:hover]:group-hover:pointer-events-auto supports-[hover:hover]:group-hover:opacity-100">
          <Button
            variant="secondary"
            size="sm"
            onClick={(event) => {
              event.preventDefault();
              onToggleFavorite(flashcard.id, isFav);
            }}
            disabled={favUpdating}
            className="h-9 w-9 bg-white/90 p-0 shadow-lg backdrop-blur-sm hover:shadow-xl dark:bg-gray-900/90"
            title={isFav ? 'Bỏ yêu thích' : 'Yêu thích'}
          >
            <Star className={`h-4 w-4 ${isFav ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </Button>
          {flashcard.ownerId === currentUserId && (
            <>
              {onEdit && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(event) => {
                    event.preventDefault();
                    onEdit(flashcard);
                  }}
                  className="h-9 w-9 bg-white/90 p-0 shadow-lg backdrop-blur-sm hover:shadow-xl dark:bg-gray-900/90"
                  title="Chỉnh sửa"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
              {flashcard.visibility !== 'public' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(event) => {
                    event.preventDefault();
                  }}
                  className="h-9 w-9 bg-white/90 p-0 shadow-lg backdrop-blur-sm hover:shadow-xl dark:bg-gray-900/90"
                  title="Chia sẻ"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(event) => {
                    event.preventDefault();
                    onDelete(flashcard);
                  }}
                  className="h-9 w-9 p-0 shadow-lg hover:shadow-xl"
                  title="Xóa"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
