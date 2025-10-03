import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar } from '@/shared/components/ui/avatar';
import { H3 } from '@/shared/components/ui/typography';
import type { LibraryMeta, ShareRole } from '@/shared/lib/models';
import { getLibraryDetailPath } from '@/shared/constants/routes';
import { VisibilityBadge } from './VisibilityBadge';
import { cn } from '@/shared/lib/utils';

interface FlashcardListItemProps {
  flashcard: LibraryMeta;
  role?: ShareRole | null;
  owner?: { id: string; displayName?: string; email?: string; avatarUrl?: string } | null;
  authorLabel: string;
  className?: string;
}

export function FlashcardListItem({ flashcard, role, owner, authorLabel, className }: FlashcardListItemProps) {
  return (
    <Link to={getLibraryDetailPath(flashcard.id)} className="block">
      <Card className={cn('group cursor-pointer transition-shadow hover:shadow-md', className)}>
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <H3 className="font-semibold transition-colors group-hover:text-primary">{flashcard.title}</H3>
              <p className="text-sm text-muted-foreground">
                {flashcard.cardCount} thẻ •{' '}
                <VisibilityBadge visibility={flashcard.visibility} showLabel={false} />
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                {role ? (
                  <Badge variant="outline" className="px-1 text-[10px]">
                    Chia sẻ • {role === 'viewer' ? 'Viewer' : 'Contributor'}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="px-1 text-[10px]">
                    Sở hữu
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-muted-foreground">
                  {owner?.avatarUrl ? (
                    <Avatar src={owner.avatarUrl} alt={authorLabel} size={16} className="h-4 w-4" fallback={authorLabel.slice(0, 1)} />
                  ) : (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[8px] uppercase">
                      {authorLabel.slice(0, 1)}
                    </div>
                  )}
                  <span>{authorLabel}</span>
                </div>
              </div>
            </div>
            {flashcard.tags?.length ? (
              <Badge variant="secondary" className="shrink-0">
                {flashcard.tags[0]}
              </Badge>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
