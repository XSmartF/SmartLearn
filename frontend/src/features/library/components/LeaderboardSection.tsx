import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { progressRepository } from '@/shared/lib/repositories/ProgressRepository';
import { userRepository } from '@/shared/lib/repositories/UserRepository';
import { shareRepository } from '@/shared/lib/repositories/ShareRepository';
import { libraryRepository } from '@/shared/lib/repositories/LibraryRepository';
import { Trophy, Medal, Award, Star, Sprout } from "lucide-react";
import { Loader } from '@/shared/components/ui/loader';
import type { UserLibraryProgressSummary } from '@/shared/lib/repositories/ProgressRepository';

interface LeaderboardEntry {
  userId: string;
  userProfile: { id: string; displayName?: string; email?: string; avatarUrl?: string };
  progress: UserLibraryProgressSummary;
  mastered: number;
  total: number;
  rank: number;
}

interface LeaderboardSectionProps {
  libraryId: string;
  currentUserId: string;
}

export function LeaderboardSection({ libraryId, currentUserId }: LeaderboardSectionProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadLeaderboard() {
      try {
        setLoading(true);
        
        // Get library info to know the owner
        const library = await libraryRepository.getLibraryMeta(libraryId);
        if (!library) {
          console.warn('Library not found');
          setEntries([]);
          return;
        }

        // Get all shares for this library
        const shares = await shareRepository.listShares(libraryId);
        
        // Get all progress summaries for this library
        const allProgress = await progressRepository.getAllUserProgressSummariesForLibrary(libraryId);

        // Filter progress to only include owner and shared users
        const allowedUserIds = new Set([
          library.ownerId, // owner
          ...shares.map(share => share.targetUserId) // shared users
        ]);
        
        const filteredProgress = allProgress.filter(progress => 
          allowedUserIds.has(progress.userId)
        );

        // Get user profiles for allowed users
        const userIds = [...new Set(filteredProgress.map(p => p.userId))];
        const userProfiles = await Promise.all(
          userIds.map(async id => {
            try {
              const profile = await userRepository.getUserProfile(id);
              return profile || { id, displayName: undefined, email: undefined, avatarUrl: undefined };
            } catch {
              return { id, displayName: undefined, email: undefined, avatarUrl: undefined };
            }
          })
        );

        const profileMap = new Map(userProfiles.map(p => [p.id, p]));

        // Group progress by userId and take the latest one for each user
        const progressByUser = new Map<string, UserLibraryProgressSummary>();
        filteredProgress.forEach(progress => {
          const existing = progressByUser.get(progress.userId);
          if (!existing || new Date(progress.updatedAt) > new Date(existing.updatedAt)) {
            progressByUser.set(progress.userId, progress);
          }
        });

        // Create entries with stats from summary (one per user)
        const leaderboardEntries: LeaderboardEntry[] = Array.from(progressByUser.values()).map(progress => {
          console.log('Progress summary for user:', progress.userId, progress);
          
          const mastered = progress.mastered;
          const total = progress.total;
          
          console.log('Summary stats:', { mastered, total, percentage: progress.percentMastered });
          
          const profile = profileMap.get(progress.userId)!;

          return {
            userId: progress.userId,
            userProfile: profile,
            progress,
            mastered,
            total,
            rank: 0 // will be set after sorting
          };
        });

        // Sort by completion percentage descending, then by total cards descending
        leaderboardEntries.sort((a, b) => {
          const aPercentage = a.progress.percentMastered;
          const bPercentage = b.progress.percentMastered;
          
          if (aPercentage !== bPercentage) return bPercentage - aPercentage;
          return b.total - a.total;
        });

        // Assign ranks
        leaderboardEntries.forEach((entry, index) => {
          entry.rank = index + 1;
        });

        if (!cancelled) {
          setEntries(leaderboardEntries);
        }
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadLeaderboard();

    return () => { cancelled = true; };
  }, [libraryId]);

  const getAchievementIcon = (rank: number, percentage: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    
    if (percentage >= 100) return <div className="flex gap-0.5">{Array(5).fill(0).map((_, i) => <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />)}</div>;
    if (percentage >= 80) return <div className="flex gap-0.5">{Array(4).fill(0).map((_, i) => <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />)}</div>;
    if (percentage >= 60) return <div className="flex gap-0.5">{Array(3).fill(0).map((_, i) => <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />)}</div>;
    if (percentage >= 40) return <div className="flex gap-0.5">{Array(2).fill(0).map((_, i) => <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />)}</div>;
    if (percentage >= 20) return <Star className="h-3 w-3 text-yellow-400 fill-current" />;
    return <Sprout className="h-5 w-5 text-green-500" />;
  };

  const getUserDisplayName = (profile: LeaderboardEntry['userProfile']) => {
    return profile.displayName || profile.email || profile.id.slice(0, 8);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" /> Bảng xếp hạng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Loader size="sm" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" /> Bảng xếp hạng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Chưa có dữ liệu xếp hạng.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" /> Bảng xếp hạng ({entries.length} người học)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.slice(0, 10).map((entry) => {
            const percentage = Math.round(entry.progress.percentMastered);
            return (
              <div
                key={entry.userId}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  entry.userId === currentUserId ? 'bg-primary/5 border-primary/20' : 'bg-card'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-lg">
                    {getAchievementIcon(entry.rank, percentage)}
                  </div>
                  <div>
                    <div className="font-medium">
                      {getUserDisplayName(entry.userProfile)}
                      {entry.userId === currentUserId && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Bạn
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1">
                      <Progress value={percentage} className="h-2" />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    #{entry.rank}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {percentage}%
                  </div>
                </div>
              </div>
            );
          })}
          {entries.length > 10 && (
            <div className="text-center text-sm text-muted-foreground pt-2">
              Và {entries.length - 10} người học khác...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
