import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Star, FileText, Calendar, Eye, Trash2, Edit3, BookOpen } from "lucide-react"
import type { NoteMeta } from '../types'
import { getNoteDetailPath } from '@/shared/constants/routes'
import { cn } from '@/shared/lib/utils'

interface NoteCardProps {
  note: NoteMeta;
  isFav: boolean;
  onToggleFavorite: (id: string, isFav: boolean) => void;
  onEdit?: (note: NoteMeta) => void;
  onDelete?: (note: NoteMeta) => void;
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

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isFav,
  onToggleFavorite,
  onEdit,
  onDelete,
  currentUserId,
  favUpdating
}) => {
  // Generate consistent gradient based on note ID
  const gradientIndex = note.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % CARD_GRADIENTS.length
  const cardGradient = CARD_GRADIENTS[gradientIndex]

  // Extract text content from BlockNote JSON
  const extractTextFromContent = (content: string): string => {
    try {
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) {
        return parsed
          .map((block: { content?: unknown[] }) => {
            if (block.content && Array.isArray(block.content)) {
              return block.content
                .map((item: unknown) => {
                  if (typeof item === 'object' && item !== null && 'text' in item) {
                    return String((item as { text: unknown }).text)
                  }
                  return ''
                })
                .join('')
            }
            return ''
          })
          .filter(Boolean)
          .join(' ')
          .trim()
      }
      return ''
    } catch {
      return content.substring(0, 150)
    }
  }

  const contentPreview = note.content ? extractTextFromContent(note.content) : ''

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

  <Link to={getNoteDetailPath(note.id)} className="flex-1 flex flex-col min-w-0">
          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2.5 flex-1 min-w-0">
                {/* Title with icon */}
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-2 rounded-lg bg-white/60 dark:bg-white/10 backdrop-blur-sm shadow-sm">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base sm:text-lg font-bold group-hover:text-primary transition-colors line-clamp-2 flex-1">
                    {note.title}
                  </CardTitle>
                </div>

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {note.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs font-medium bg-white/60 dark:bg-white/10 backdrop-blur-sm">
                        {tag}
                      </Badge>
                    ))}
                    {note.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs font-medium bg-white/60 dark:bg-white/10 backdrop-blur-sm">
                        +{note.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0 flex-1 flex flex-col justify-between relative z-10">
            {/* Content preview */}
            <div className="mb-4 flex-1">
              {contentPreview ? (
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {contentPreview}
                </p>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground/60 italic">
                  <FileText className="h-4 w-4" />
                  <span>Chưa có nội dung</span>
                </div>
              )}
            </div>

            {/* Footer info */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="p-1 rounded-md bg-primary/10">
                  <Calendar className="h-3 w-3 text-primary" />
                </div>
                <span className="font-medium">
                  {new Date(note.updatedAt).toLocaleDateString('vi-VN', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              {note.visibility && (
                <Badge 
                  variant={note.visibility === 'private' ? 'default' : 'outline'} 
                  className="text-xs font-medium gap-1"
                >
                  <Eye className="h-3 w-3" />
                  {note.visibility === 'private' ? 'Riêng tư' : 'Công khai'}
                </Badge>
              )}
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
              onToggleFavorite(note.id, isFav);
            }}
            disabled={favUpdating}
            className="h-9 w-9 p-0 shadow-lg hover:shadow-xl backdrop-blur-sm bg-white/90 dark:bg-gray-900/90"
            title={isFav ? 'Bỏ yêu thích' : 'Yêu thích'}
          >
            <Star className={`h-4 w-4 ${isFav ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </Button>
          {(note.ownerId === currentUserId) && (
            <>
              {onEdit && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onEdit(note);
                  }}
                  className="h-9 w-9 p-0 shadow-lg hover:shadow-xl backdrop-blur-sm bg-white/90 dark:bg-gray-900/90"
                  title="Chỉnh sửa"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete(note);
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
};