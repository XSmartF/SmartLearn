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

interface FlashcardCardProps {
  flashcard: LibraryMeta;
  isFav: boolean;
  role?: ShareRole;
  owner: { id: string; displayName?: string; email?: string; avatarUrl?: string } | undefined;
  authorLabel: string;
  onToggleFavorite: (id: string, isFav: boolean) => void;
  onEdit?: (lib: LibraryMeta) => void;
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
  currentUserId,
  favUpdating
}) => {
  return (
    <Link to={`/dashboard/library/${flashcard.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                {flashcard.title}
              </CardTitle>
              <div className="flex gap-2 items-center">
                {role ? (
                  <Badge variant="outline" className="text-[10px] px-1">Chia sẻ • {role === 'viewer' ? 'Viewer' : 'Contributor'}</Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] px-1">Sở hữu</Badge>
                )}
                <div className="flex items-center gap-1">
                  {owner?.avatarUrl ? (
                    <Avatar src={owner.avatarUrl} alt={authorLabel} size={16} className="w-4 h-4" fallback={authorLabel.slice(0,1)} />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-muted text-[8px] flex items-center justify-center uppercase">
                      {authorLabel.slice(0, 1)}
                    </div>
                  )}
                  <span className="text-[10px] text-muted-foreground">{authorLabel}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{flashcard.description?.slice(0, 60)}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
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
                    <DropdownMenuItem className="text-red-600">Xóa</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {(flashcard.tags || []).slice(0, 3).map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{flashcard.cardCount} thẻ</span>
              <span>{flashcard.visibility}</span>
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
