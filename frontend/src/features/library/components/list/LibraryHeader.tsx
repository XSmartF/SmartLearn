import { BookOpen, PenSquare } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { PageHeader } from '@/shared/components/PageHeader';

interface LibraryHeaderProps {
  summaryText: string;
  onCreate: () => void;
}

export function LibraryHeader({ summaryText, onCreate }: LibraryHeaderProps) {
  return (
    <PageHeader
      title="Thư viện của tôi"
      eyebrow="Thư viện cá nhân"
      description={summaryText}
      icon={<BookOpen className="h-6 w-6 text-primary" />}
      actions={
        <Button onClick={onCreate} size="lg">
          <PenSquare className="mr-2 h-4 w-4" />
          Tạo thư viện mới
        </Button>
      }
    />
  );
}
