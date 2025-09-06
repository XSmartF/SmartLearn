import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar } from '@/shared/components/ui/avatar'
import { H3 } from '@/shared/components/ui/typography'
import type { LibraryMeta, ShareRole } from '@/shared/lib/models'
import { getLibraryDetailPath } from '@/shared/constants/routes'

interface FlashcardListItemProps {
  flashcard: LibraryMeta;
  role?: ShareRole;
  owner: { id: string; displayName?: string; email?: string; avatarUrl?: string } | undefined;
  authorLabel: string;
}

export const FlashcardListItem: React.FC<FlashcardListItemProps> = ({
  flashcard,
  role,
  owner,
  authorLabel
}) => {
  return (
    <Link to={getLibraryDetailPath(flashcard.id)}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex-1">
                <H3 className="font-semibold group-hover:text-blue-600 transition-colors">
                  {flashcard.title}
                </H3>
                <p className="text-sm text-muted-foreground truncate max-w-md">
                  {flashcard.cardCount} thẻ • {flashcard.visibility}
                </p>
                <div className="mt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {role ? (
                      <Badge variant="outline" className="text-[10px] px-1">Chia sẻ • {role === 'viewer' ? 'Viewer' : 'Contributor'}</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] px-1">Sở hữu</Badge>
                    )}
                    <div className="flex items-center gap-1">
                      {owner?.avatarUrl ? (
                        <Avatar src={owner.avatarUrl} alt={authorLabel} size={16} className="w-4 h-4" fallback={authorLabel.slice(0,1)} />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-muted text-[8px] flex items-center justify-center uppercase">
                          {authorLabel.slice(0, 1)}
                        </div>
                      )}
                      <span className="text-[10px] text-muted-foreground">{authorLabel}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Badge variant="secondary">{flashcard.tags?.[0] || 'Thẻ'}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
