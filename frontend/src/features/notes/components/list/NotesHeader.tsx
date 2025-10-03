import { BookOpen, PenSquare } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { PageHeader } from '@/shared/components/PageHeader';

interface NotesHeaderProps {
  summary: string;
  onCreateNote: () => void;
}

export function NotesHeader({ summary, onCreateNote }: NotesHeaderProps) {
  return (
    <PageHeader
      title="Quản lý kiến thức của bạn"
      eyebrow="Ghi chép thông minh"
      description={summary}
      icon={<BookOpen className="h-6 w-6 text-primary" />}
      actions={
        <Button onClick={onCreateNote} size="lg">
          <PenSquare className="mr-2 h-4 w-4" />
          Tạo ghi chép mới
        </Button>
      }
    />
  );
}
