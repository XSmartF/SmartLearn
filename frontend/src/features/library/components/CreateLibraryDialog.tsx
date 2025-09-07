import { useState } from 'react'
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from "@/shared/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/components/ui/select"
import { Plus } from "lucide-react"
import { toast } from 'sonner'
import type { LibraryVisibility } from '@/shared/lib/models'

interface CreateLibraryDialogProps {
  onCreateLibrary: (title: string, description: string, visibility: LibraryVisibility) => Promise<void>
}

export default function CreateLibraryDialog({ onCreateLibrary }: CreateLibraryDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<LibraryVisibility>('private')
  const [submitting, setSubmitting] = useState(false)

  const handleCreate = async () => {
    if (!title.trim()) return

    setSubmitting(true)
    try {
      await onCreateLibrary(title.trim(), description.trim(), visibility)
      setTitle('')
      setDescription('')
      setVisibility('private')
      setOpen(false)
      toast.success('Tạo thư viện thành công')
    } catch {
      toast.error('Lỗi khi tạo thư viện')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tạo thư viện
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Tạo thư viện mới</DialogTitle>
          <DialogDescription className="text-sm">
            Tạo một thư viện flashcard mới để bắt đầu học tập.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tên thư viện</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên thư viện"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Mô tả (tùy chọn)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả về thư viện này"
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Ai có thể xem thư viện này?</label>
            <Select value={visibility} onValueChange={(value: LibraryVisibility) => setVisibility(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">🔒</span>
                    <span>Chỉ mình tôi</span>
                  </div>
                </SelectItem>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">🌐</span>
                    <span>Mọi người</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
            Hủy
          </Button>
          <Button onClick={handleCreate} disabled={submitting || !title.trim()} className="w-full sm:w-auto">
            {submitting ? 'Đang tạo...' : 'Tạo thư viện'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
