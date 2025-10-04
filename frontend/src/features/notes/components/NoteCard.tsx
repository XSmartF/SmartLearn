import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Star, FileText, Calendar, Trash2, Edit3, BookOpen, Lock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { NoteMeta } from '../types'
import { getNoteDetailPath } from '@/shared/constants/routes'
import { cn } from '@/shared/lib/utils'

const CARD_GRADIENTS = [
  'from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-950/40 dark:via-blue-950/40 dark:to-cyan-950/40 border-indigo-200 dark:border-indigo-800',
  'from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/40 dark:via-purple-950/40 dark:to-fuchsia-950/40 border-violet-200 dark:border-violet-800',
  'from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-cyan-950/40 border-emerald-200 dark:border-emerald-800',
  'from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-red-950/40 border-amber-200 dark:border-amber-800',
  'from-rose-50 via-pink-50 to-fuchsia-50 dark:from-rose-950/40 dark:via-pink-950/40 dark:to-fuchsia-950/40 border-rose-200 dark:border-rose-800',
  'from-sky-50 via-blue-50 to-indigo-50 dark:from-sky-950/40 dark:via-blue-950/40 dark:to-indigo-950/40 border-sky-200 dark:border-sky-800',
]

interface VisibilityConfig {
  label: string
  className: string
  ariaLabel: string
  icon?: LucideIcon
}

const VISIBILITY_CONFIG: Record<NonNullable<NoteMeta['visibility']>, VisibilityConfig> = {
  private: {
    label: '',
    className: 'bg-orange-100 text-orange-600 border border-orange-200',
    ariaLabel: 'Ghi chú riêng tư',
    icon: Lock,
  },
  public: {
    label: 'Công khai',
    className: 'bg-green-100 text-green-600 border border-green-200',
    ariaLabel: 'Ghi chú công khai',
  },
}

const NOTE_PREVIEW_LENGTH = 150

interface NoteCardProps {
  note: NoteMeta
  isFav: boolean
  onToggleFavorite: (id: string, isFav: boolean) => void
  onEdit?: (note: NoteMeta) => void
  onDelete?: (note: NoteMeta) => void
  currentUserId: string
  favUpdating: boolean
}

function getCardGradient(noteId: string) {
  const seed = noteId.split('').reduce((total, char) => total + char.charCodeAt(0), 0)
  return CARD_GRADIENTS[seed % CARD_GRADIENTS.length]
}

function extractInlineText(block: { content?: unknown[] }) {
  if (!Array.isArray(block.content)) {
    return ''
  }

  return block.content
    .map((item) => (typeof item === 'object' && item && 'text' in item ? String((item as { text: unknown }).text) : ''))
    .join('')
}

function buildPreview(rawContent: string | null | undefined) {
  if (!rawContent) {
    return ''
  }

  try {
    const parsed = JSON.parse(rawContent)
    if (Array.isArray(parsed)) {
      return parsed.map(extractInlineText).join(' ').trim()
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Failed to parse note content', error)
    }
  }

  return rawContent.slice(0, NOTE_PREVIEW_LENGTH)
}

function NoteVisibilityBadge({ visibility }: { visibility?: NonNullable<NoteMeta['visibility']> }) {
  if (!visibility) {
    return null
  }

  const config = VISIBILITY_CONFIG[visibility]
  const Icon = config.icon
  const showLabel = Boolean(config.label)

  return (
    <Badge
      variant="secondary"
      className={cn(
        'inline-flex items-center gap-1 text-[11px] sm:text-xs px-2 py-1 font-medium shrink-0',
        !showLabel && 'px-1.5',
        config.className,
      )}
      aria-label={config.ariaLabel}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {showLabel ? <span>{config.label}</span> : null}
      <span className="sr-only">{config.ariaLabel}</span>
    </Badge>
  )
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isFav,
  onToggleFavorite,
  onEdit,
  onDelete,
  currentUserId,
  favUpdating,
}) => {
  const cardGradient = useMemo(() => getCardGradient(note.id), [note.id])
  const contentPreview = useMemo(() => buildPreview(note.content), [note.content])
  const formattedDate = useMemo(
    () =>
      new Date(note.updatedAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    [note.updatedAt]
  )
  const tags = note.tags ?? []
  const visibleTags = tags.slice(0, 3)
  const extraTagCount = Math.max(0, tags.length - visibleTags.length)

  return (
    <div className="group h-full min-w-0 max-w-full">
      <Card
        className={cn(
          'relative flex h-full w-full max-w-full flex-col overflow-hidden transition-all duration-300',
          'supports-[hover:hover]:hover:-translate-y-2 supports-[hover:hover]:hover:scale-[1.03] supports-[hover:hover]:hover:shadow-2xl',
          'bg-gradient-to-br border sm:border-2',
          cardGradient,
        )}
      >
        {isFav ? (
          <div className="absolute right-3 top-3 z-10">
            <div className="rounded-full bg-yellow-400 p-1.5 text-yellow-900 shadow-lg dark:bg-yellow-500 dark:text-yellow-950">
              <Star className="h-3.5 w-3.5 fill-current" />
            </div>
          </div>
        ) : null}

        <div className="supports-[hover:hover]:group-hover:scale-150 absolute right-0 top-0 hidden h-24 w-24 -translate-y-12 translate-x-12 rounded-bl-full bg-gradient-to-br from-white/30 to-transparent transition-transform duration-500 dark:from-white/10 sm:block" />

        <Link to={getNoteDetailPath(note.id)} className="flex w-full max-w-full flex-1 flex-col min-w-0">
          <CardHeader className="relative z-10 pb-2 sm:pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2 sm:space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 rounded-lg bg-white/50 p-1.5 shadow-sm backdrop-blur-sm dark:bg-white/10 sm:p-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="flex-1 break-words text-sm font-bold leading-snug transition-colors line-clamp-2 sm:text-lg group-hover:text-primary">
                    {note.title}
                  </CardTitle>
                </div>

                {visibleTags.length ? (
                  <div className="hidden flex-wrap gap-1.5 sm:flex">
                    {visibleTags.map((tag) => (
                      <Badge key={tag} variant="outline" className="bg-white/50 text-[10px] font-medium backdrop-blur-sm dark:bg-white/10 sm:text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {extraTagCount > 0 ? (
                      <Badge variant="outline" className="bg-white/50 text-[10px] font-medium backdrop-blur-sm dark:bg-white/10 sm:text-xs">
                        +{extraTagCount}
                      </Badge>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 flex flex-1 flex-col justify-between pt-0">
            <div className="mb-3 flex-1 sm:mb-4">
              {contentPreview ? (
                <p className="text-[13px] leading-relaxed text-muted-foreground line-clamp-2 break-words sm:text-sm sm:line-clamp-3">
                  {contentPreview}
                </p>
              ) : (
                <div className="flex items-center gap-2 text-[13px] italic text-muted-foreground/60 sm:text-sm">
                  <FileText className="h-4 w-4" />
                  <span>Chưa có nội dung</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-y-2 border-t border-border/50 pt-2 sm:pt-3">
              <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground sm:gap-2 sm:text-xs">
                <div className="rounded-md bg-primary/10 p-1">
                  <Calendar className="h-3 w-3 text-primary" />
                </div>
                <span className="truncate font-medium">{formattedDate}</span>
              </div>
              <NoteVisibilityBadge visibility={note.visibility ?? undefined} />
            </div>
          </CardContent>
        </Link>

        <div className="supports-[hover:hover]:opacity-0 supports-[hover:hover]:pointer-events-none supports-[hover:hover]:group-hover:pointer-events-auto supports-[hover:hover]:group-hover:opacity-100 absolute bottom-3 right-3 z-20 flex items-center gap-1.5 opacity-100 transition-all duration-300">
          <Button
            variant="secondary"
            size="sm"
            onClick={(event) => {
              event.preventDefault()
              onToggleFavorite(note.id, isFav)
            }}
            disabled={favUpdating}
            className="h-9 w-9 bg-white/90 p-0 shadow-lg backdrop-blur-sm hover:shadow-xl dark:bg-gray-900/90"
            title={isFav ? 'Bỏ yêu thích' : 'Yêu thích'}
          >
            <Star className={cn('h-4 w-4', isFav && 'fill-yellow-400 text-yellow-400')} />
          </Button>
          {note.ownerId === currentUserId ? (
            <>
              {onEdit ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(event) => {
                    event.preventDefault()
                    onEdit(note)
                  }}
                  className="h-9 w-9 bg-white/90 p-0 shadow-lg backdrop-blur-sm hover:shadow-xl dark:bg-gray-900/90"
                  title="Chỉnh sửa"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              ) : null}
              {onDelete ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(event) => {
                    event.preventDefault()
                    onDelete(note)
                  }}
                  className="h-9 w-9 p-0 shadow-lg hover:shadow-xl"
                  title="Xóa"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </>
          ) : null}
        </div>
      </Card>
    </div>
  )
}