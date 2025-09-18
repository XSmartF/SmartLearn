import { useState, useEffect, useMemo } from 'react'
import { H1, H3 } from '@/shared/components/ui/typography';
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/shared/components/ui/dialog'
import { useUserNotes, useNoteFavorites } from '@/shared/hooks/useNotes'
import { noteRepository } from '@/shared/lib/repositories/NoteRepository'
import {
  Star,
  Search,
  BookOpen,
} from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import type { NoteMeta } from '../types'
import { NoteCard } from '../components/NoteCard'
import { Loader } from '@/shared/components/ui/loader'

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const { notes, loading, error } = useUserNotes()
  const { favorites, updating: favUpdating, toggleFavorite } = useNoteFavorites()
  const [currentUserId, setCurrentUserId] = useState<string>('')

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
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center sm:text-left">
        <H1 className="text-3xl sm:text-4xl font-bold mb-2">Ghi chép của tôi</H1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Quản lý và tổ chức ghi chép của bạn
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-muted/20 rounded-xl">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{notes.length}</div>
          <div className="text-sm text-muted-foreground">Tổng ghi chép</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{favorites.length}</div>
          <div className="text-sm text-muted-foreground">Yêu thích</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {notes.filter(note => new Date(note.updatedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).length}
          </div>
          <div className="text-sm text-muted-foreground">Cập nhật tuần này</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 bg-muted/20 rounded-xl">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Tìm kiếm ghi chép..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="oldest">Cũ nhất</SelectItem>
              <SelectItem value="title">Theo tên</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={async () => {
          try {
            await noteRepository.createNote({
              title: 'Ghi chép mới',
              content: '',
              tags: [],
              visibility: 'private'
            })
            toast.success('Đã tạo ghi chép mới')
          } catch (error) {
            console.error(error)
            toast.error('Có lỗi tạo ghi chép')
          }
        }}>
          Tạo ghi chép mới
        </Button>
      </div>

      {/* Content */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted rounded-lg">
          <TabsTrigger value="all" className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Tất cả ({sortedFiltered.length})
          </TabsTrigger>
          <TabsTrigger value="favorites" className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Yêu thích ({favoriteNotes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
            {sortedFiltered.map(note => (
              <div key={note.id} className="h-full">
                <NoteCard
                  note={note}
                  isFav={favorites.includes(note.id)}
                  onToggleFavorite={toggleFavorite}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                  currentUserId={currentUserId}
                  favUpdating={favUpdating}
                />
              </div>
            ))}
          </div>
          {sortedFiltered.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <H3 className="text-xl font-semibold mb-2">Chưa có ghi chép</H3>
              <p className="text-muted-foreground">Tạo ghi chép đầu tiên để bắt đầu.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          {favoriteNotes.length === 0 ? (
            <div className="text-center py-8">
              <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <H3 className="text-lg font-semibold mb-2">Chưa có ghi chép yêu thích</H3>
              <p className="text-muted-foreground">
                Đánh dấu các ghi chép bạn thích để dễ dàng truy cập
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 items-stretch">
              {favoriteNotes.map(note => (
                <div key={note.id} className="h-full">
                  <NoteCard
                    key={note.id}
                    note={note}
                    isFav={true}
                    onToggleFavorite={toggleFavorite}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                    currentUserId={currentUserId}
                    favUpdating={favUpdating}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {loading && <Loader className="py-8" />}
      {hasError && (
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Lỗi: {errorMessage}</div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </div>
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