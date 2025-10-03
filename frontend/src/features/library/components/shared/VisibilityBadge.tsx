import { Lock, Globe } from 'lucide-react';
import type { LibraryVisibility } from '@/shared/lib/models';
import { cn } from '@/shared/lib/utils';

interface VisibilityBadgeProps {
  visibility: LibraryVisibility;
  className?: string;
  showLabel?: boolean;
}

export function VisibilityBadge({ visibility, className, showLabel = true }: VisibilityBadgeProps) {
  const isPrivate = visibility === 'private';
  const label = isPrivate ? 'Chỉ mình tôi' : 'Mọi người';

  return (
    <span
      className={cn('inline-flex items-center gap-1 text-xs font-medium', className)}
      title={showLabel ? undefined : label}
      aria-label={showLabel ? undefined : label}
    >
      {isPrivate ? (
        <Lock className="h-3 w-3 text-orange-500" />
      ) : (
        <Globe className="h-3 w-3 text-green-500" />
      )}
      {showLabel ? <span>{label}</span> : <span className="sr-only">{label}</span>}
    </span>
  );
}

interface VisibilitySelectItemProps {
  value: LibraryVisibility;
}

export function VisibilitySelectItem({ value }: VisibilitySelectItemProps) {
  if (value === 'private') {
    return (
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-orange-500" />
        <span>Chỉ mình tôi</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-green-500" />
      <span>Mọi người</span>
    </div>
  );
}
