import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';
import { P } from '@/shared/components/ui/typography';

interface NotesEmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function NotesEmptyState({ icon, title, description, action, className }: NotesEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/40 bg-background/50 py-10 text-center',
        className,
      )}
    >
      <div className="text-muted-foreground">{icon}</div>
      <P className="text-lg font-semibold">{title}</P>
      <P className="text-sm text-muted-foreground max-w-md">{description}</P>
      {action}
    </div>
  );
}
