import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import type { NoteEditorDraft, NoteEditorState } from '../../hooks/useNotesListView';

interface NoteEditorDialogProps {
  state: NoteEditorState;
  onClose: () => void;
  onUpdateDraft: (patch: Partial<NoteEditorDraft>) => void;
  onSubmit: () => void;
}

export function NoteEditorDialog({ state, onClose, onUpdateDraft, onSubmit }: NoteEditorDialogProps) {
  const { open, submitting, mode, draft } = state;
  const dialogTitle = mode === 'create' ? 'Tạo ghi chép mới' : 'Chỉnh sửa ghi chép';

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Tạo mới một ghi chép để lưu trữ kiến thức của bạn.'
              : 'Cập nhật nội dung và thông tin ghi chép hiện tại.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tiêu đề</label>
            <Input
              value={draft?.title ?? ''}
              onChange={(event) => onUpdateDraft({ title: event.target.value })}
              placeholder="Nhập tiêu đề..."
            />
          </div>

          <div>
            <label className="text-sm font-medium">Nội dung</label>
            <Textarea
              value={draft?.content ?? ''}
              onChange={(event) => onUpdateDraft({ content: event.target.value })}
              placeholder="Nhập nội dung..."
              rows={6}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tags (phân cách bằng dấu phẩy)</label>
            <Input
              value={draft?.tags ?? ''}
              onChange={(event) => onUpdateDraft({ tags: event.target.value })}
              placeholder="react, frontend, ..."
            />
          </div>

          <div>
            <label className="text-sm font-medium">Quyền riêng tư</label>
            <Select
              value={draft?.visibility ?? 'private'}
              onValueChange={(value: 'private' | 'public') => onUpdateDraft({ visibility: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn quyền riêng tư" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Riêng tư</SelectItem>
                <SelectItem value="public">Công khai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={onSubmit} disabled={submitting || !draft}>
            {submitting ? 'Đang lưu...' : mode === 'create' ? 'Tạo ghi chép' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
