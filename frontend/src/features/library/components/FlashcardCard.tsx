import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import type { LibraryMeta, ShareRole } from '@/shared/lib/models'
import { getLibraryDetailPath } from '@/shared/constants/routes'
import { VisibilityBadge } from './VisibilityDisplay'

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
  return (
    <Link to={getLibraryDetailPath(flashcard.id)} className="h-full">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer group h-full flex flex-col">
        <CardHeader className="pb-2 sm:pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                {flashcard.title}
              </CardTitle>
              <div className="flex flex-wrap gap-1 sm:gap-2 items-center">
                {role ? (
                  <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1">Chia sẻ • {role === 'viewer' ? 'Viewer' : 'Contributor'}</Badge>
                ) : (
                  <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-1">Sở hữu</Badge>
                )}
                <div className="flex items-center gap-1">
                  {owner?.avatarUrl ? (
                    <Avatar src={owner.avatarUrl} alt={authorLabel} size={16} className="w-3 h-3 sm:w-4 sm:h-4" fallback={authorLabel.slice(0,1)} />
                  ) : (
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-muted text-[7px] sm:text-[8px] flex items-center justify-center uppercase">
                      {authorLabel.slice(0, 1)}
                    </div>
                  )}
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground truncate">{authorLabel}</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{flashcard.description?.slice(0, 60)}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0 opacity-100 md:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled={favUpdating} onClick={(e) => { e.preventDefault(); onToggleFavorite(flashcard.id, isFav); }}>
                  {isFav ? 'Bỏ yêu thích' : 'Yêu thích'}
                </DropdownMenuItem>
                {flashcard.ownerId === currentUserId && onEdit && (
                  <>
                    <DropdownMenuItem onClick={(e) => { e.preventDefault(); onEdit(flashcard); }}>Chỉnh sửa</DropdownMenuItem>
                    {flashcard.visibility !== 'public' && (
                      <DropdownMenuItem>Chia sẻ</DropdownMenuItem>
                    )}
                    {onDelete && <DropdownMenuItem className="text-red-600" onClick={(e) => { e.preventDefault(); onDelete(flashcard); }}>Xóa</DropdownMenuItem>}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 flex-grow">
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            {(flashcard.tags || []).slice(0, 3).map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
          </div>

          <div className="space-y-1 sm:space-y-2">
            <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
              <span>{flashcard.cardCount} thẻ</span>
              <VisibilityBadge visibility={flashcard.visibility} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-1">
              {(flashcard.tags || []).slice(0, 2).map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {(flashcard.tags && flashcard.tags.length > 2) && (
                <Badge variant="outline" className="text-xs">
                  +{(flashcard.tags?.length || 0) - 2}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
