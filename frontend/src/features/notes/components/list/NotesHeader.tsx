import { PenSquare } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface NotesHeaderProps {
  summary: string;
  onCreateNote: () => void;
}

export function NotesHeader({ summary, onCreateNote }: NotesHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">{summary}</p>
      <Button onClick={onCreateNote}>
        <PenSquare className="mr-2 h-4 w-4" />
        Tạo ghi chép mới
      </Button>
    </div>
  );
}
