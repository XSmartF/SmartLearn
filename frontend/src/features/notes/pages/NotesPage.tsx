import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/shared/components/ui/dialog'
import { useUserNotes, useNoteFavorites } from '@/shared/hooks/useNotes'
import { noteRepository } from '@/shared/lib/repositories/NoteRepository'
import { Star, Search, BookOpen, PenSquare } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { PageSection } from '@/shared/components/PageSection'
import { StatCard } from '@/shared/components/StatCard'
import { PageHeader } from '@/shared/components/PageHeader'
import type { NoteMeta } from '../types'
import { NoteCard } from '../components/NoteCard'
import { Loader } from '@/shared/components/ui/loader'

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const { notes, loading, error } = useUserNotes()
  const { favorites, updating: favUpdating, toggleFavorite } = useNoteFavorites()
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [tab, setTab] = useState<'all' | 'favorites'>('all')

  // Edit state
  const [editOpen, setEditOpen] = useState(false)
  const [editNote, setEditNote] = useState<NoteMeta | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editTags, setEditTags] = useState('')
  const [editVisibility, setEditVisibility] = useState<'private' | 'public'>('private')
  const [editing, setEditing] = useState(false)

  // Delete state
  const [deleteNote, setDeleteNote] = useState<NoteMeta | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    // Mock current user
    setCurrentUserId('user1')
  }, [])

  const filteredNotes = useMemo(() => {
    return notes.filter(note =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    )
  }, [notes, searchQuery])

  const sortedFiltered = useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      } else if (sortBy === 'oldest') {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      }
      return 0
    })
  }, [filteredNotes, sortBy])

  const favoriteNotes = useMemo(() => {
    return notes.filter(note => favorites.includes(note.id))
  }, [notes, favorites])

  const updatedThisWeek = useMemo(() => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return notes.filter(note => new Date(note.updatedAt).getTime() > oneWeekAgo).length
  }, [notes])

  const stats = useMemo(() => ([
    { label: 'Tổng ghi chép', value: notes.length, helper: 'Bao gồm tất cả ghi chép cá nhân' },
    { label: 'Đánh dấu yêu thích', value: favorites.length, helper: 'Ghi chép bạn muốn truy cập nhanh' },
    { label: 'Cập nhật tuần này', value: updatedThisWeek, helper: 'Số ghi chép được chỉnh sửa 7 ngày qua' },
    { label: 'Tỷ lệ yêu thích', value: notes.length ? `${Math.round((favorites.length / notes.length) * 100)}%` : '0%', helper: 'Phần trăm ghi chép được yêu thích' },
  ]), [favorites.length, notes.length, updatedThisWeek])

  const highlightSummary = useMemo(() => {
    const percent = notes.length ? Math.round((favorites.length / notes.length) * 100) : 0
    return `Bạn đang quản lý ${notes.length} ghi chép với ${favorites.length} ghi chép yêu thích (${percent}%).`
  }, [favorites.length, notes.length])

  const handleCreateNote = async () => {
    try {
      await noteRepository.createNote({
        title: 'Ghi chép mới',
        content: '',
        tags: [],
        visibility: 'private'
      })
      toast.success('Đã tạo ghi chép mới')
    } catch (err) {
      console.error(err)
      toast.error('Có lỗi tạo ghi chép')
    }
  }

  const handleEditNote = (note: NoteMeta) => {
    setEditNote(note)
    setEditTitle(note.title)
    setEditContent(note.content || '')
    setEditTags(note.tags?.join(', ') || '')
    setEditVisibility(note.visibility)
    setEditOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editNote) return
    setEditing(true)
    try {
      await noteRepository.updateNote(editNote.id, {
        title: editTitle,
        content: editContent,
        tags: editTags.split(',').map(tag => tag.trim()).filter(tag => tag),
        visibility: editVisibility
      })
      setEditOpen(false)
      toast.success('Đã cập nhật ghi chép')
    } catch (error) {
      console.error(error)
      toast.error('Có lỗi xảy ra')
    } finally {
      setEditing(false)
    }
  }

  const handleDeleteNote = async (note: NoteMeta) => {
    setDeleteNote(note)
    setConfirmDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteNote) return
    setDeleting(true)
    try {
      await noteRepository.deleteNote(deleteNote.id)
      setConfirmDeleteOpen(false)
      toast.success('Đã xóa ghi chép')
    } catch (error) {
      console.error(error)
      toast.error('Có lỗi xảy ra')
    } finally {
      setDeleting(false)
    }
  }

  // Derive error message safely
  const hasError = !!error;
  const errorMessage = hasError ? (
    typeof error === 'string'
      ? error
      : (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message?: unknown }).message === 'string')
        ? (error as { message: string }).message
        : 'Đã xảy ra lỗi'
  ) : '';

  return (
    <div className="space-y-8 sm:space-y-10">
      <PageHeader
        title="Quản lý kiến thức của bạn"
        eyebrow="Ghi chép thông minh"
        description={highlightSummary}
        icon={<BookOpen className="h-6 w-6 text-primary" />}
        actions={
          <>
            <Button onClick={handleCreateNote} size="lg">
              <PenSquare className="mr-2 h-4 w-4" />
              Tạo ghi chép mới
            </Button>
            <Button onClick={() => setTab('favorites')} variant="outline" size="lg">
              <Star className="mr-2 h-4 w-4" />
              Ghi chép yêu thích
            </Button>
          </>
        }
      />

      <PageSection
        heading="Tổng quan ghi chép"
        description="Theo dõi nhanh trạng thái ghi chép của bạn."
        contentClassName="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} helper={stat.helper} />
        ))}
      </PageSection>

      <PageSection
        heading="Quản lý ghi chép"
        description="Tìm kiếm và sắp xếp ghi chép theo nhu cầu học tập của bạn."
        actions={
          <Button onClick={handleCreateNote} className="w-full sm:w-auto">
            <PenSquare className="mr-2 h-4 w-4" />
            Tạo ghi chép mới
          </Button>
        }
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <div className="relative flex-1 max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm ghi chép..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="oldest">Cũ nhất</SelectItem>
              <SelectItem value="title">Theo tên</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PageSection>

      <PageSection
        heading="Không gian ghi chép"
        description="Duyệt tất cả ghi chép hoặc tập trung vào những ghi chép đã đánh dấu yêu thích."
        contentClassName="space-y-6"
      >
        <Tabs value={tab} onValueChange={(value) => setTab(value as 'all' | 'favorites')} className="space-y-6">
          <TabsList className="w-full justify-start gap-2 rounded-xl border border-border/30 bg-card/60 p-1 shadow-[var(--neu-shadow-sm)]">
            <TabsTrigger value="all" className="flex-1 rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Tất cả ({sortedFiltered.length})
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex-1 rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Yêu thích ({favoriteNotes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="all"
            className="space-y-4 rounded-xl border border-border/30 bg-card/60 p-6 shadow-[var(--neu-shadow-sm)] backdrop-blur-sm"
          >
            {sortedFiltered.length > 0 ? (
              <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedFiltered.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    isFav={favorites.includes(note.id)}
                    onToggleFavorite={toggleFavorite}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                    currentUserId={currentUserId}
                    favUpdating={favUpdating}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/40 bg-background/50 py-12 text-center">
                <BookOpen className="h-14 w-14 text-muted-foreground" />
                <p className="text-lg font-semibold">Chưa có ghi chép nào</p>
                <p className="text-sm text-muted-foreground">Tạo ghi chép đầu tiên để bắt đầu xây dựng thư viện kiến thức.</p>
                <Button onClick={handleCreateNote} variant="outline">
                  <PenSquare className="mr-2 h-4 w-4" />
                  Tạo ghi chép
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="favorites"
            className="space-y-4 rounded-xl border border-border/30 bg-card/60 p-6 shadow-[var(--neu-shadow-sm)] backdrop-blur-sm"
          >
            {favoriteNotes.length > 0 ? (
              <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {favoriteNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    isFav
                    onToggleFavorite={toggleFavorite}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                    currentUserId={currentUserId}
                    favUpdating={favUpdating}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/40 bg-background/50 py-10 text-center">
                <Star className="h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-semibold">Chưa có ghi chép yêu thích</p>
                <p className="text-sm text-muted-foreground">Đánh dấu các ghi chép quan trọng để truy cập nhanh hơn.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </PageSection>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader size="sm" />
        </div>
      )}
      {hasError && (
        <PageSection heading="Đã xảy ra lỗi" description={errorMessage}>
          <Button variant="outline" onClick={() => window.location.reload()} className="w-full sm:w-auto">
            Thử lại
          </Button>
        </PageSection>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa ghi chép</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tiêu đề</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Nhập tiêu đề..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nội dung</label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Nhập nội dung..."
                rows={6}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tags (phân cách bằng dấu phẩy)</label>
              <Input
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="react, frontend, ..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Quyền riêng tư</label>
              <Select value={editVisibility} onValueChange={(value: 'private' | 'public') => setEditVisibility(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Riêng tư</SelectItem>
                  <SelectItem value="public">Công khai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveEdit} disabled={editing}>
              {editing ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa ghi chép "{deleteNote?.title}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}