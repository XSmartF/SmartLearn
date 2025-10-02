import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  icon,
  actions,
  align = 'left',
  className,
}: PageHeaderProps) {
  const alignment = align === 'center' ? 'items-center text-center' : 'items-start text-left';
  const actionJustify = align === 'center' ? 'sm:justify-center' : 'sm:justify-start';
  const descriptionWrap = align === 'center' ? 'mx-auto' : 'mx-0';

  return (
    <header className={cn('flex flex-col gap-4 sm:gap-6', className)}>
      <div className={cn('flex flex-col gap-2 sm:gap-3', alignment)}>
        {(icon || eyebrow) && (
          <div className={cn('hidden sm:flex items-center gap-2 text-sm font-medium text-primary/90', align === 'center' ? 'justify-center' : 'justify-start')}>
            {icon ? <span className="inline-flex items-center justify-center">{icon}</span> : null}
            {eyebrow ? <span className="uppercase tracking-wide text-primary/70">{eyebrow}</span> : null}
          </div>
        )}
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground break-words">{title}</h1>
        {description ? (
          <p className={cn('hidden sm:block text-lg text-muted-foreground sm:text-xl max-w-3xl', descriptionWrap)}>
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className={cn('flex flex-wrap gap-2 sm:gap-3 sm:flex-row sm:flex-wrap sm:items-center', actionJustify)}>
          {actions}
        </div>
      ) : null}
    </header>
  );
}
