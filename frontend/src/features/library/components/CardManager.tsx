import { useState } from 'react'
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from "@/shared/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import ConfirmDialog from '@/shared/components/ConfirmDialog'
import { toast } from 'sonner'

interface CardManagerProps {
  onAddCard: (front: string, back: string) => Promise<void>
  selectedIds: string[]
  onBulkDelete: (ids: string[]) => Promise<void>
  canModify: boolean
}

export default function CardManager({
  onAddCard,
  selectedIds,
  onBulkDelete,
  canModify
}: CardManagerProps) {
  const [openAddCard, setOpenAddCard] = useState(false)
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [adding, setAdding] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleAddCard = async () => {
    if (!front.trim() || !back.trim()) return

    setAdding(true)
    try {
      await onAddCard(front.trim(), back.trim())
      setFront('')
      setBack('')
      setOpenAddCard(false)
      toast.success('Thêm thẻ thành công')
    } catch {
      toast.error('Lỗi khi thêm thẻ')
    } finally {
      setAdding(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return

    setDeleting(true)
    try {
      await onBulkDelete(selectedIds)
      toast.success(`Đã xóa ${selectedIds.length} thẻ`)
    } catch {
      toast.error('Lỗi khi xóa thẻ')
    } finally {
      setDeleting(false)
      setConfirmDeleteOpen(false)
    }
  }

  if (!canModify) return null

  return (
    <div className="flex items-center space-x-2">
      {/* Add Card Dialog */}
      <Dialog open={openAddCard} onOpenChange={setOpenAddCard}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Thêm thẻ
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm thẻ mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Mặt trước</label>
              <Input
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Nhập mặt trước của thẻ"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Mặt sau</label>
              <Textarea
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Nhập mặt sau của thẻ"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAddCard(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddCard} disabled={adding}>
              {adding ? 'Đang thêm...' : 'Thêm thẻ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete */}
      {selectedIds.length > 0 && (
        <ConfirmDialog
          open={confirmDeleteOpen}
          onOpenChange={setConfirmDeleteOpen}
          title="Xóa thẻ"
          description={`Bạn có chắc muốn xóa ${selectedIds.length} thẻ đã chọn?`}
          onConfirm={handleBulkDelete}
          confirmText={deleting ? 'Đang xóa...' : 'Xóa'}
        >
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa ({selectedIds.length})
          </Button>
        </ConfirmDialog>
      )}
    </div>
  )
}
