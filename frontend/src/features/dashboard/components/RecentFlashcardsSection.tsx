import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar } from '@/shared/components/ui/avatar';
import { Button } from "@/shared/components/ui/button";
import { Brain } from "lucide-react";
import type { LibraryMeta } from '@/shared/lib/models';
import { getStudyPath } from '@/shared/constants/routes';

interface RecentFlashcard {
  id: string;
  title: string;
  progress: number;
  total: number;
  mastered: number;
  lastAccessed?: string;
  accuracy?: number;
  sessions?: number;
  difficulty: string;
}

interface OwnerProfile {
  id: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
}

interface RecentFlashcardsSectionProps {
  recentFlashcards: RecentFlashcard[];
  libsLoading: boolean;
  libraries: LibraryMeta[];
  allLibraries: LibraryMeta[];
  ownerProfiles: Record<string, OwnerProfile>;
}

export function RecentFlashcardsSection({
  recentFlashcards,
  libsLoading,
  libraries,
  allLibraries,
  ownerProfiles
}: RecentFlashcardsSectionProps) {
  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Bộ flashcard gần đây</CardTitle>
          <CardDescription>Tiếp tục từ nơi bạn đã dừng lại</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {libsLoading && recentFlashcards.length === 0 && (
          <div className="text-sm text-muted-foreground">Đang tải...</div>
        )}
        {recentFlashcards.map((flashcard) => (
          <div key={flashcard.id} className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {flashcard.title}
              </p>
              <div className="flex gap-2 items-center mb-1">
                {libraries.find(o => o.id === flashcard.id) ? (
                  <Badge variant="secondary" className="text-[10px] px-1">Sở hữu</Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] px-1">Chia sẻ</Badge>
                )}
                {(() => {
                  const lib = allLibraries.find(l => l.id === flashcard.id);
                  if (!lib) return null;
                  const owner = ownerProfiles[lib.ownerId];
                  const label = owner?.displayName || owner?.email || owner?.id?.slice(0, 6) || '—';
                  return (
                    <div className="flex items-center gap-1">
                      {owner?.avatarUrl ? (
                        <Avatar src={owner.avatarUrl} alt={label} size={16} className="w-4 h-4" fallback={label.slice(0, 1)} />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-muted text-[8px] flex items-center justify-center uppercase">{label.slice(0, 1)}</div>
                      )}
                      <span className="text-[10px] text-muted-foreground">{label}</span>
                    </div>
                  );
                })()}
              </div>
              <p className="text-sm text-gray-500">{flashcard.lastAccessed ? new Date(flashcard.lastAccessed).toLocaleString() : '—'}</p>
              <p className="text-xs text-gray-400">
                {flashcard.mastered}/{flashcard.total} thẻ đã thuộc • {flashcard.difficulty}
                {flashcard.accuracy !== undefined && (<span>• Độ chính xác {(flashcard.accuracy * 100).toFixed(0)}%</span>)}
                {flashcard.sessions ? (<span>• {flashcard.sessions} phiên</span>) : null}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${flashcard.progress}%` }}
                ></div>
              </div>
            </div>
            <div className="flex-shrink-0 flex flex-col items-end gap-2">
              <span className="text-sm font-medium">{flashcard.progress}%</span>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => window.location.href = getStudyPath(flashcard.id)}>Tiếp tục học</Button>
            </div>
          </div>
        ))}
        <Button className="w-full" variant="outline">
          Xem tất cả bộ flashcard
        </Button>
      </CardContent>
    </Card>
  );
}
