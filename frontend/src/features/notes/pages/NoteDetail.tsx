import { useCallback, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { ArrowLeft, Save, Star, Calendar, FileText, List, Lock } from 'lucide-react'
import { BlockNoteView } from '@blocknote/shadcn'
import '@blocknote/shadcn/style.css'
import './NoteDetail.css'
import { usePersistentTheme } from '@/shared/hooks/usePersistentTheme'
import { Badge } from '@/shared/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { cn } from '@/shared/lib/utils'
import { useNoteDetailView } from '@/features/notes/hooks/useNoteDetailView'
import { Loader } from '@/shared/components/ui/loader'

interface OutlineProps {
  outline: ReturnType<typeof useNoteDetailView>['outline']
  onNavigate: (blockId: string) => void
}

function OutlineList({ outline, onNavigate }: OutlineProps) {
  if (!outline.length) {
    return null
  }

  return (
    <div className="hidden xl:block fixed right-0 w-72 pointer-events-none z-20" style={{ top: '7rem', height: 'calc(100vh - 7rem)' }}>
      <div className="h-full flex flex-col p-4 pr-6 pointer-events-auto">
        <div className="flex-1 flex flex-col max-h-full rounded-lg border bg-card/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/90">
          <div className="flex-shrink-0 border-b p-4">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <List className="h-3.5 w-3.5" />
              Mục lục
            </h3>
          </div>
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-1 p-4">
              {outline.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    'w-full rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent hover:text-accent-foreground',
                    'line-clamp-2'
                  )}
                  style={{
                    paddingLeft: `${(item.level - 1) * 12 + 8}px`,
                    fontSize: item.level === 1 ? '0.8125rem' : '0.75rem',
                    fontWeight: item.level === 1 ? 600 : 400,
                  }}
                >
                  {item.text}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { resolvedTheme } = usePersistentTheme()
  const view = useNoteDetailView(id)
  const [showOutline, setShowOutline] = useState(true)

  const scrollToBlock = useCallback((blockId: string) => {
    const blockElement = document.querySelector(`[data-id="${blockId}"]`)
    if (blockElement) {
      blockElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  if (view.status === 'loading') {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader label="Đang tải ghi chép" />
      </div>
    )
  }

  if (view.status === 'error' || !view.note) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-muted-foreground">Không tìm thấy ghi chép</h2>
          <p className="mb-4 text-muted-foreground">Ghi chép này có thể đã bị xóa hoặc bạn không có quyền truy cập.</p>
          <Button onClick={() => navigate('/notes')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách ghi chép
          </Button>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    await view.save()
  }

  const handleToggleFavorite = async () => {
    await view.toggleFavorite()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/notes')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Input
              value={view.title}
              onChange={(event) => view.setTitle(event.target.value)}
              className="h-10 flex-1 border-0 bg-transparent px-2 text-xl font-semibold shadow-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Tiêu đề ghi chép..."
            />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-9" onClick={() => setShowOutline((prev) => !prev)}>
                <List className="mr-2 h-4 w-4" />
                {showOutline ? 'Ẩn' : 'Hiện'} Outline
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9">
                    <FileText className="mr-2 h-4 w-4" />
                    Thông tin
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72" align="end">
                  <div className="space-y-3 text-sm">
                    <h4 className="font-semibold">Tóm tắt ghi chép</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="h-3.5 w-3.5" />
                          Số khối
                        </span>
                        <span className="font-medium">{view.summary.totalBlocks} khối</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <List className="h-3.5 w-3.5" />
                          Số từ
                        </span>
                        <span className="font-medium">{view.summary.wordCount} từ</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="h-3.5 w-3.5" />
                          Thời gian đọc
                        </span>
                        <span className="font-medium">~{view.summary.estimatedReadTime} phút</span>
                      </div>
                      <div className="flex items-center justify-between border-t pt-2">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          Cập nhật
                        </span>
                        <span className="text-xs font-medium">{view.updatedAtLabel}</span>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                className="h-9 w-9"
              >
                <Star className={cn('h-4 w-4', view.isFavorite && 'fill-yellow-400 text-yellow-400')} />
              </Button>
              <Button onClick={handleSave} disabled={view.saving} size="sm" className="h-9">
                <Save className="mr-2 h-4 w-4" />
                {view.saving ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </div>
          </div>
          {(view.note.tags && view.note.tags.length > 0) || view.note.visibility ? (
            <div className="ml-12 mt-3 flex flex-wrap items-center gap-2">
              {view.note.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {view.note.visibility ? (
                <Badge
                  variant="secondary"
                  className={cn(
                    'inline-flex items-center gap-1 text-xs px-2 py-1 font-medium',
                    view.note.visibility === 'private' && 'px-1.5',
                    view.note.visibility === 'private'
                      ? 'bg-orange-100 text-orange-600 border border-orange-200'
                      : 'bg-green-100 text-green-600 border border-green-200'
                  )}
                  aria-label={view.note.visibility === 'private' ? 'Ghi chú riêng tư' : 'Ghi chú công khai'}
                >
                  {view.note.visibility === 'private' ? (
                    <>
                      <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="sr-only">Ghi chú riêng tư</span>
                    </>
                  ) : (
                    'Công khai'
                  )}
                </Badge>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="px-6 py-6">
            <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="min-h-[calc(100vh-12rem)] p-8">
                <BlockNoteView editor={view.editor} theme={resolvedTheme as 'light' | 'dark' | undefined} className="w-full" />
              </div>
            </div>
          </div>
        </div>
        {showOutline ? <OutlineList outline={view.outline} onNavigate={scrollToBlock} /> : null}
      </div>
    </div>
  )
}