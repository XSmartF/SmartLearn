import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { MoreHorizontal, Star } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import type { NoteMeta } from '../types'
import { getNoteDetailPath } from '@/shared/constants/routes'

interface NoteCardProps {
  note: NoteMeta;
  isFav: boolean;
  onToggleFavorite: (id: string, isFav: boolean) => void;
  onEdit?: (note: NoteMeta) => void;
  onDelete?: (note: NoteMeta) => void;
  currentUserId: string;
  favUpdating: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isFav,
  onToggleFavorite,
  onEdit,
  onDelete,
  currentUserId,
  favUpdating
}) => {
  return (
    <Link to={getNoteDetailPath(note.id)} className="h-full">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer group h-full flex flex-col">
        <CardHeader className="pb-2 sm:pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                {note.title}
              </CardTitle>
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {note.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{note.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  onToggleFavorite(note.id, isFav);
                }}
                disabled={favUpdating}
                className="h-8 w-8 p-0"
              >
                <Star className={`h-4 w-4 ${isFav ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
              </Button>
              {(note.ownerId === currentUserId) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => e.preventDefault()}
                      className="h-8 w-8 p-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={(e) => { e.preventDefault(); onEdit(note); }}>
                        Chỉnh sửa
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={(e) => { e.preventDefault(); onDelete(note); }}
                        className="text-destructive"
                      >
                        Xóa
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1">
          <div className="text-sm text-muted-foreground line-clamp-3">
            {note.content ? 'Có nội dung' : 'Chưa có nội dung'}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            Cập nhật: {new Date(note.updatedAt).toLocaleDateString('vi-VN')}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};