import type { PropsWithChildren } from 'react';
import { cn } from '@/shared/lib/utils';
import { Loader } from '@/shared/components/ui/loader';

export type LoaderOverlayPlacement = 'center' | 'top';

interface LoaderOverlayProps extends PropsWithChildren {
  loading: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dimClassName?: string;
  placement?: LoaderOverlayPlacement;
  dimContent?: boolean;
}

export function LoaderOverlay({
  loading,
  label = 'Đang tải dữ liệu',
  size = 'md',
  className,
  dimClassName,
  placement = 'center',
  dimContent = true,
  children,
}: LoaderOverlayProps) {
  return (
    <div className={cn('relative', className)} aria-busy={loading} aria-live="polite">
      <div
        className={cn(
          'transition-opacity duration-200',
          loading && dimContent ? 'pointer-events-none opacity-40' : 'opacity-100',
          dimClassName,
        )}
      >
        {children}
      </div>
      {loading ? (
        <div
          className={cn(
            'pointer-events-none absolute inset-0 flex w-full justify-center transition-all duration-200',
            placement === 'top' ? 'items-start pt-6' : 'items-center',
          )}
        >
          <Loader size={size} label={label} />
        </div>
      ) : null}
    </div>
  );
}

export default LoaderOverlay;
