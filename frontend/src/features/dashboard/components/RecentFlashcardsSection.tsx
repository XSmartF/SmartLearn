import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar } from '@/shared/components/ui/avatar';
import { Button } from "@/shared/components/ui/button";
import { Brain } from "lucide-react";
import { Loader } from '@/shared/components/ui/loader';
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
    <Card className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base sm:text-lg">Bộ flashcard gần đây</CardTitle>
          <CardDescription className="text-sm">Tiếp tục từ nơi bạn đã dừng lại</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {libsLoading && recentFlashcards.length === 0 && (
          <div className="flex justify-center">
            <Loader size="sm" />
          </div>
        )}
        {recentFlashcards.map((flashcard) => (
          <div key={flashcard.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {flashcard.title}
              </p>
              <div className="flex flex-wrap gap-1 sm:gap-2 items-center mb-1">
                {libraries.find(o => o.id === flashcard.id) ? (
                  <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-1">Sở hữu</Badge>
                ) : (
                  <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1">Chia sẻ</Badge>
                )}
                {(() => {
                  const lib = allLibraries.find(l => l.id === flashcard.id);
                  if (!lib) return null;
                  const owner = ownerProfiles[lib.ownerId];
                  const label = owner?.displayName || owner?.email || owner?.id?.slice(0, 6) || '—';
                  return (
                    <div className="flex items-center gap-1">
                      {owner?.avatarUrl ? (
                        <Avatar src={owner.avatarUrl} alt={label} size={16} className="w-3 h-3 sm:w-4 sm:h-4" fallback={label.slice(0, 1)} />
                      ) : (
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-muted text-[7px] sm:text-[8px] flex items-center justify-center uppercase">{label.slice(0, 1)}</div>
                      )}
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground truncate">{label}</span>
                    </div>
                  );
                })()}
              </div>
              <p className="text-xs sm:text-sm text-gray-500">{flashcard.lastAccessed ? new Date(flashcard.lastAccessed).toLocaleString() : '—'}</p>
              <p className="text-xs text-gray-400">
                {flashcard.mastered}/{flashcard.total} thẻ đã thuộc • {flashcard.difficulty}
                {flashcard.accuracy !== undefined && (<span>• Độ chính xác {(flashcard.accuracy * 100).toFixed(0)}%</span>)}
                {flashcard.sessions ? (<span>• {flashcard.sessions} phiên</span>) : null}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mt-2">
                <div
                  className="bg-primary h-1.5 sm:h-2 rounded-full"
                  style={{ width: `${flashcard.progress}%` }}
                ></div>
              </div>
            </div>
            <div className="flex-shrink-0 flex flex-col items-start sm:items-end gap-2">
              <span className="text-sm font-medium">{flashcard.progress}%</span>
              <Button size="sm" variant="outline" className="text-xs w-full sm:w-auto" onClick={() => window.location.href = getStudyPath(flashcard.id)}>Tiếp tục học</Button>
            </div>
          </div>
        ))}
        <Button className="w-full" variant="outline" size="sm">
          Xem tất cả bộ flashcard
        </Button>
      </CardContent>
    </Card>
  );
}
