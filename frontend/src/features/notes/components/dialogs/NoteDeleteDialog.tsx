import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import type { NoteDeleteState } from '../../hooks/useNotesListView';

interface NoteDeleteDialogProps {
  state: NoteDeleteState;
  onCancel: () => void;
  onConfirm: () => void;
}

export function NoteDeleteDialog({ state, onCancel, onConfirm }: NoteDeleteDialogProps) {
  const { open, submitting, note } = state;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onCancel(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Xác nhận xóa ghi chép
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa ghi chép "{note?.title}"? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={submitting}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={submitting}>
            {submitting ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
