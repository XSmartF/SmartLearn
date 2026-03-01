import { PenSquare } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface LibraryHeaderProps {
  summaryText: string;
  onCreate: () => void;
}

export function LibraryHeader({ summaryText, onCreate }: LibraryHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">{summaryText}</p>
      <Button onClick={onCreate}>
        <PenSquare className="mr-2 h-4 w-4" />
        Tạo thư viện mới
      </Button>
    </div>
  );
}
