import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import type { LibraryEditorDraft, LibraryEditorState } from '../../hooks/useLibraryListView';
import type { LibraryVisibility } from '@/shared/lib/models';
import { VisibilitySelectItem } from '../shared/VisibilityBadge';

interface LibraryEditorDialogProps {
  state: LibraryEditorState;
  onClose: () => void;
  onUpdateDraft: (patch: Partial<LibraryEditorDraft>) => void;
  onSubmit: () => void;
}

export function LibraryEditorDialog({ state, onClose, onUpdateDraft, onSubmit }: LibraryEditorDialogProps) {
  const { open, submitting, mode, draft } = state;
  const dialogTitle = mode === 'create' ? 'Tạo thư viện mới' : 'Chỉnh sửa thư viện';

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Thiết lập thư viện flashcard mới để quản lý kiến thức của bạn.'
              : 'Cập nhật thông tin thư viện hiện tại.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tiêu đề</label>
            <Input
              value={draft?.title ?? ''}
              onChange={(event) => onUpdateDraft({ title: event.target.value })}
              placeholder="Ví dụ: Ngữ pháp tiếng Anh" 
            />
          </div>

          <div>
            <label className="text-sm font-medium">Mô tả</label>
            <Textarea
              value={draft?.description ?? ''}
              onChange={(event) => onUpdateDraft({ description: event.target.value })}
              placeholder="Tóm tắt nội dung thư viện"
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Quyền riêng tư</label>
            <Select
              value={draft?.visibility ?? 'private'}
              onValueChange={(value) => onUpdateDraft({ visibility: value as LibraryVisibility })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn quyền riêng tư" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">
                  <VisibilitySelectItem value="private" />
                </SelectItem>
                <SelectItem value="public">
                  <VisibilitySelectItem value="public" />
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={onSubmit} disabled={submitting || !draft?.title.trim()}>
            {submitting ? 'Đang lưu...' : mode === 'create' ? 'Tạo thư viện' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
