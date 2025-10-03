import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import type { LibraryDeleteState } from '../../hooks/useLibraryListView';

interface LibraryDeleteDialogProps {
  state: LibraryDeleteState;
  onCancel: () => void;
  onConfirm: () => void;
}

export function LibraryDeleteDialog({ state, onCancel, onConfirm }: LibraryDeleteDialogProps) {
  const { open, submitting, library } = state;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onCancel(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Xác nhận xóa thư viện
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa thư viện "{library?.title}"? Hành động này sẽ xóa toàn bộ thẻ và không thể hoàn tác.
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
