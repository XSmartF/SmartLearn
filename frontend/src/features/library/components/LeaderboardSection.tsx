import { useEffect, useState } from 'react';
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { progressRepository } from '@/shared/lib/repositories/ProgressRepository';
import { userRepository } from '@/shared/lib/repositories/UserRepository';
import { shareRepository } from '@/shared/lib/repositories/ShareRepository';
import { libraryRepository } from '@/shared/lib/repositories/LibraryRepository';
import { Trophy, Medal, Award, Star, Sprout } from "lucide-react";
import { Loader } from '@/shared/components/ui/loader';
import { PageSection } from '@/shared/components/PageSection';
import type { UserLibraryProgressSummary, UserLibraryProgressDoc } from '@/shared/lib/repositories/ProgressRepository';
import type { SerializedState } from '@/features/study/utils/learnEngine';

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

type DerivedProgress = {
  mastered: number;
  learning: number;
  due: number;
  total: number;
  percentMastered: number;
};

const safeTimestamp = (value: string | undefined | null) => {
  if (!value) return 0;
  const ts = Date.parse(value);
  return Number.isNaN(ts) ? 0 : ts;
};

const deriveStatsFromEngineState = (engineState: SerializedState | Record<string, unknown> | null | undefined): DerivedProgress | null => {
  if (!engineState || typeof engineState !== 'object') return null;
  const params = (engineState as { params?: { M?: number } }).params;
  const states = (engineState as { states?: unknown }).states;
  if (!Array.isArray(states)) return null;
  const sessionIndexRaw = (engineState as { sessionIndex?: unknown }).sessionIndex;
  const sessionIndex = typeof sessionIndexRaw === 'number' ? sessionIndexRaw : 0;

  const masteryThreshold = typeof params?.M === 'number' ? params.M : 5;

  let mastered = 0;
  let learning = 0;
  let due = 0;

  for (const entry of states as Array<{ mastery?: unknown; seenCount?: unknown; nextDue?: unknown }>) {
    const mastery = typeof entry?.mastery === 'number' ? entry.mastery : 0;
    const seenCount = typeof entry?.seenCount === 'number' ? entry.seenCount : 0;
    const nextDue = typeof entry?.nextDue === 'number' ? entry.nextDue : Number.POSITIVE_INFINITY;

    if (mastery >= masteryThreshold) mastered += 1;
    else if (seenCount > 0) learning += 1;

    if (nextDue <= sessionIndex) due += 1;
  }

  const total = states.length;
  const percentMastered = total > 0 ? (mastered / total) * 100 : 0;

  return {
    mastered,
    learning,
    due,
    total,
    percentMastered,
  };
};

export function LeaderboardSection({ libraryId, currentUserId }: LeaderboardSectionProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadLeaderboard() {
      try {
        setLoading(true);
        
        const [library, shares] = await Promise.all([
          libraryRepository.getLibraryMeta(libraryId),
          shareRepository.listShares(libraryId)
        ]);

        if (!library) {
          console.warn('Library not found');
          setEntries([]);
          return;
        }

        const allowedUserIds = new Set<string>();
        if (library.ownerId) allowedUserIds.add(library.ownerId);
        if (currentUserId) allowedUserIds.add(currentUserId);
        shares.forEach(share => {
          if (share.targetUserId) allowedUserIds.add(share.targetUserId);
        });

        const [progressSummaries, progressDocs] = await Promise.all([
          progressRepository.getAllUserProgressSummariesForLibrary(libraryId),
          progressRepository.getAllUserProgressForLibrary(libraryId)
        ]);

        const summaryByUser = new Map<string, UserLibraryProgressSummary>();
        progressSummaries.forEach(summary => {
          if (!allowedUserIds.has(summary.userId)) return;
          const existing = summaryByUser.get(summary.userId);
          if (!existing || new Date(summary.updatedAt) > new Date(existing.updatedAt)) {
            summaryByUser.set(summary.userId, summary);
          }
        });

        const progressDocByUser = new Map<string, UserLibraryProgressDoc>();
        progressDocs.forEach(doc => {
          if (!allowedUserIds.has(doc.userId)) return;
          if (doc.id.endsWith('__summary')) return;
          const existing = progressDocByUser.get(doc.userId);
          if (!existing || new Date(doc.updatedAt) > new Date(existing.updatedAt)) {
            progressDocByUser.set(doc.userId, doc);
          }
        });

        const userIds = Array.from(allowedUserIds);
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

        const clampPercent = (value: number) => {
          if (Number.isNaN(value)) return 0;
          return Math.min(100, Math.max(0, value));
        };

        const leaderboardEntries: LeaderboardEntry[] = userIds.map(userId => {
          const summary = summaryByUser.get(userId);
          const progressDoc = progressDocByUser.get(userId);

          let stats: DerivedProgress = {
            mastered: summary?.mastered ?? 0,
            learning: summary?.learning ?? 0,
            due: summary?.due ?? 0,
            total: summary?.total ?? 0,
            percentMastered: summary?.percentMastered ?? 0,
          };
          let updatedAt = summary?.updatedAt ?? '';
          let usedSummary = !!summary;

          const engineStats = deriveStatsFromEngineState(progressDoc?.engineState as SerializedState | Record<string, unknown> | null | undefined);
          if (engineStats && progressDoc) {
            const summaryTs = safeTimestamp(summary?.updatedAt);
            const docTs = safeTimestamp(progressDoc.updatedAt);
            const preferEngine = !summary || docTs > summaryTs || stats.total === 0 || (stats.percentMastered <= 0 && engineStats.percentMastered > 0);

            if (preferEngine) {
              stats = engineStats;
              updatedAt = progressDoc.updatedAt ?? updatedAt;
              usedSummary = false;
            }
          }

          const normalizedPercent = clampPercent(stats.percentMastered);

          const progress: UserLibraryProgressSummary = usedSummary && summary
            ? { ...summary, percentMastered: normalizedPercent }
            : {
                userId,
                libraryId,
                total: stats.total,
                mastered: stats.mastered,
                learning: stats.learning,
                due: stats.due,
                percentMastered: normalizedPercent,
                updatedAt
              };

          return {
            userId,
            userProfile: profileMap.get(userId) ?? { id: userId, displayName: undefined, email: undefined, avatarUrl: undefined },
            progress,
            mastered: stats.mastered,
            total: stats.total,
            rank: 0
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
  }, [libraryId, currentUserId]);

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
      <PageSection heading={<span className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Bảng xếp hạng</span>}>
        <div className="flex justify-center py-6">
          <Loader size="sm" />
        </div>
      </PageSection>
    );
  }

  if (entries.length === 0) {
    return (
      <PageSection heading={<span className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Bảng xếp hạng</span>}>
        <div className="text-sm text-muted-foreground">Chưa có dữ liệu xếp hạng.</div>
      </PageSection>
    );
  }

  return (
    <PageSection
      heading={<span className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Bảng xếp hạng ({entries.length} người học)</span>}
      contentClassName="space-y-4"
    >
      {entries.slice(0, 10).map((entry) => {
        const percentage = Math.round(entry.progress.percentMastered);
        return (
          <div
            key={entry.userId}
            className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
              entry.userId === currentUserId ? 'border-primary/40 bg-primary/5' : 'border-border/40 bg-card'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-lg">
                {getAchievementIcon(entry.rank, percentage)}
              </div>
              <div className="flex-1">
                <div className="font-medium">
                  {getUserDisplayName(entry.userProfile)}
                  {entry.userId === currentUserId && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Bạn
                    </Badge>
                  )}
                </div>
                <div className="mt-2">
                  <Progress value={percentage} className="h-2" />
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">#{entry.rank}</div>
              <div className="text-xs text-muted-foreground">{percentage}%</div>
            </div>
          </div>
        );
      })}
      {entries.length > 10 && (
        <div className="pt-2 text-center text-sm text-muted-foreground">
          Và {entries.length - 10} người học khác...
        </div>
      )}
    </PageSection>
  );
}
