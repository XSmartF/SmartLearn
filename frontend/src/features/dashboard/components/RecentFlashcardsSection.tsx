import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
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
}: RecentFlashcardsSectionProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Bộ flashcard gần đây</CardTitle>
        <CardDescription className="text-xs">Tiếp tục từ nơi bạn đã dừng lại</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {libsLoading && recentFlashcards.length === 0 && (
          <div className="flex justify-center py-8">
            <Loader size="sm" />
          </div>
        )}
        {recentFlashcards.length === 0 && !libsLoading && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Chưa có bộ flashcard gần đây
          </div>
        )}
        {recentFlashcards.map((flashcard) => (
          <div key={flashcard.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-medium truncate flex-1">
                  {flashcard.title}
                </p>
                <span className="text-xs font-semibold text-primary flex-shrink-0">{flashcard.progress}%</span>
              </div>
              
              <div className="flex flex-wrap gap-1 items-center mb-2">
                {libraries.find(o => o.id === flashcard.id) ? (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Sở hữu</Badge>
                ) : (
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0">Chia sẻ</Badge>
                )}
                <span className="text-[10px] text-muted-foreground">
                  • {flashcard.mastered}/{flashcard.total} thẻ
                </span>
                {flashcard.accuracy !== undefined && (
                  <span className="text-[10px] text-muted-foreground">
                    • {(flashcard.accuracy * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{ width: `${flashcard.progress}%` }}
                ></div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-8"
                onClick={() => window.location.href = getStudyPath(flashcard.id)}
              >
                Tiếp tục học
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
