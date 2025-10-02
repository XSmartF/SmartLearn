import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { Star, Layers, Users, Edit3, Trash2, Share2 } from "lucide-react"
import type { LibraryMeta, ShareRole } from '@/shared/lib/models'
import { getLibraryDetailPath } from '@/shared/constants/routes'
import { VisibilityBadge } from './VisibilityDisplay'
import { cn } from '@/shared/lib/utils'

interface FlashcardCardProps {
  flashcard: LibraryMeta;
  isFav: boolean;
  role?: ShareRole;
  owner: { id: string; displayName?: string; email?: string; avatarUrl?: string } | undefined;
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
]

export const FlashcardCard: React.FC<FlashcardCardProps> = ({
  flashcard,
  isFav,
  role,
  owner,
  authorLabel,
  onToggleFavorite,
  onEdit,
  onDelete,
  currentUserId,
  favUpdating
}) => {
  // Generate consistent gradient based on flashcard ID
  const gradientIndex = flashcard.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % CARD_GRADIENTS.length
  const cardGradient = CARD_GRADIENTS[gradientIndex]

  return (
    <div className="h-full group">
      <Card className={cn(
        "h-full w-full flex flex-col relative overflow-hidden transition-all duration-300",
        "supports-[hover:hover]:hover:shadow-2xl supports-[hover:hover]:hover:scale-[1.03] supports-[hover:hover]:hover:-translate-y-2",
        "bg-gradient-to-br border-2",
        cardGradient
      )}>
        {/* Favorite star indicator */}
        {isFav && (
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-yellow-400 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-950 rounded-full p-1.5 shadow-lg">
              <Star className="h-3.5 w-3.5 fill-current" />
            </div>
          </div>
        )}

        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/40 to-transparent dark:from-white/10 rounded-bl-full transform translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-500" />

  <Link to={getLibraryDetailPath(flashcard.id)} className="flex-1 flex flex-col min-w-0">
          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2.5 flex-1 min-w-0">
                {/* Title with icon */}
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-2 rounded-lg bg-white/60 dark:bg-white/10 backdrop-blur-sm shadow-sm">
                    <Layers className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base sm:text-lg font-bold group-hover:text-primary transition-colors line-clamp-2 flex-1">
                    {flashcard.title}
                  </CardTitle>
                </div>

                {/* Role & Owner badges */}
                <div className="flex flex-wrap gap-2 items-center">
                  {role ? (
                    <Badge variant="default" className="text-xs font-semibold gap-1 shadow-sm">
                      <Users className="h-3 w-3" />
                      Chia sẻ • {role === 'viewer' ? 'Viewer' : 'Contributor'}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs font-semibold shadow-sm">
                      Sở hữu
                    </Badge>
                  )}
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-sm">
                    {owner?.avatarUrl ? (
                      <Avatar src={owner.avatarUrl} alt={authorLabel} size={16} className="w-4 h-4" fallback={authorLabel.slice(0,1)} />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-primary/20 text-[8px] flex items-center justify-center uppercase font-bold text-primary">
                        {authorLabel.slice(0, 1)}
                      </div>
                    )}
                    <span className="text-[10px] font-medium text-foreground/80 truncate max-w-[100px]">{authorLabel}</span>
                  </div>
                </div>

                {/* Description */}
                {flashcard.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {flashcard.description}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0 flex-1 flex flex-col justify-between relative z-10">
            {/* Tags */}
            {flashcard.tags && flashcard.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {flashcard.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs font-medium bg-white/60 dark:bg-white/10 backdrop-blur-sm">
                    {tag}
                  </Badge>
                ))}
                {flashcard.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs font-medium bg-white/60 dark:bg-white/10 backdrop-blur-sm">
                    +{flashcard.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Footer stats */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                </div>
                <span>{flashcard.cardCount} thẻ</span>
              </div>
              <VisibilityBadge visibility={flashcard.visibility} showLabel={false} />
            </div>
          </CardContent>
        </Link>

        {/* Action buttons overlay */}
        <div
          className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-100 transition-all duration-300 z-20 supports-[hover:hover]:opacity-0 supports-[hover:hover]:pointer-events-none supports-[hover:hover]:group-hover:opacity-100 supports-[hover:hover]:group-hover:pointer-events-auto"
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(flashcard.id, isFav);
            }}
            disabled={favUpdating}
            className="h-9 w-9 p-0 shadow-lg hover:shadow-xl backdrop-blur-sm bg-white/90 dark:bg-gray-900/90"
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
                  onClick={(e) => {
                    e.preventDefault();
                    onEdit(flashcard);
                  }}
                  className="h-9 w-9 p-0 shadow-lg hover:shadow-xl backdrop-blur-sm bg-white/90 dark:bg-gray-900/90"
                  title="Chỉnh sửa"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
              {flashcard.visibility !== 'public' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    // Share functionality
                  }}
                  className="h-9 w-9 p-0 shadow-lg hover:shadow-xl backdrop-blur-sm bg-white/90 dark:bg-gray-900/90"
                  title="Chia sẻ"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
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
  )
}
