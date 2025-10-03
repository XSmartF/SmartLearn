import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface LibraryEmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function LibraryEmptyState({ icon, title, description, action, className }: LibraryEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/40 bg-background/60 py-10 text-center',
        className,
      )}
    >
      <div className="text-muted-foreground">{icon}</div>
      <p className="text-lg font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground max-w-md">{description}</p>
      {action}
    </div>
  );
}
