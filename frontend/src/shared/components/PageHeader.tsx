import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';
import { H1, Lead, Small } from '@/shared/components/ui/typography';

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
  const eyebrowAlignment = align === 'center' ? 'justify-center' : 'justify-start';

  return (
    <header className={cn('flex flex-col space-y-6 sm:space-y-8', className)}>
      <div className={cn('flex flex-col space-y-3 sm:space-y-4', alignment)}>
        {(icon || eyebrow) && (
          <div className={cn('hidden sm:flex items-center gap-2 sm:gap-3 text-primary/90', eyebrowAlignment)}>
            {icon ? <span className="inline-flex items-center justify-center text-primary">{icon}</span> : null}
            {eyebrow ? (
              <Small className="uppercase tracking-[0.2em] text-primary/80">
                {eyebrow}
              </Small>
            ) : null}
          </div>
        )}
        <H1 className="text-[clamp(1.875rem,1.5rem+1.5vw,2.75rem)] font-bold tracking-tight text-foreground leading-tight break-words">
          {title}
        </H1>
        {description ? (
          <Lead className={cn('hidden sm:block text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl', descriptionWrap)}>
            {description}
          </Lead>
        ) : null}
      </div>
      {actions ? (
        <div className={cn('flex flex-wrap items-center gap-3 sm:gap-4', actionJustify)}>
          {actions}
        </div>
      ) : null}
    </header>
  );
}
