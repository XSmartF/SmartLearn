import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[120px] w-full rounded-md border border-border/50 bg-input/50 backdrop-blur-sm px-4 py-3 text-sm shadow-[var(--neu-shadow-inset)] placeholder:text-muted-foreground transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary focus-visible:shadow-[var(--neu-shadow-sm)]',
          'hover:border-primary/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:border-white/10 dark:bg-input dark:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_rgba(255,255,255,0.04)]',
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';
