import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Brain, Star, Zap } from 'lucide-react';
import { useUserLibraries } from '@/shared/hooks/useLibraries';
import { useFavoriteLibraries } from '@/shared/hooks/useFavorites';
import { loadProgressSummary, listenProgressSummary, type ProgressSummaryLite } from '@/shared/lib/firebaseProgressService';
import { useGetSharedLibrariesQuery } from '@/shared/store/api';
import { userRepository } from '@/shared/lib/repositories/UserRepository';
import type { LibraryMeta } from '@/shared/lib/models';
import { listenUserStudyEvents } from '@/shared/lib/firebaseCalendarService';
import type { StudyEvent } from '../../study/types/calendar';
import { getUpcomingEvents } from '../../study/utils/calendarUtils';
import { useAuth } from '@/shared/hooks/useAuthRedux';
import { ROUTES } from '@/shared/constants/routes';
import {
  StatsSection,
  RecentFlashcardsSection,
  UpcomingEventsSection,
  QuickActionsSection,
  NotificationsWidget,
  AssignmentsWidget,
  TasksWidget,
  CalendarWidget,
  MeetingsWidget,
  AnalyticsChartsSection,
} from '../components';
import { PageHero, PageHeroPrimaryAction, PageHeroSecondaryAction } from '@/shared/components/PageHero';
import {
  useDashboardAnalytics,
  type DashboardProductivityPoint,
  type DashboardTopicCompletion,
} from '../hooks/useDashboardAnalytics';
import { Card, CardContent } from '@/shared/components/ui/card';
import { H3, P } from '@/shared/components/ui/typography';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { libraries, loading: libsLoading } = useUserLibraries();
  const { favorites } = useFavoriteLibraries();
  const { data: shared = [] } = useGetSharedLibrariesQuery();
  const [summaries, setSummaries] = useState<Record<string, ProgressSummaryLite>>({});
  const [studyEvents, setStudyEvents] = useState<StudyEvent[]>([]);
  const [ownerProfiles, setOwnerProfiles] = useState<Record<string, { id: string; displayName?: string; email?: string; avatarUrl?: string }>>({});

  const {
    notifications: defaultNotifications,
    assignments,
    tasks,
    meetings,
    productivity: fallbackProductivity,
    completion: fallbackCompletion,
  } = useDashboardAnalytics();
  const [notifications, setNotifications] = useState(defaultNotifications);

  useEffect(() => {
    setNotifications(defaultNotifications);
  }, [defaultNotifications]);

  const handleClearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  const hasNotifications = notifications.length > 0;

  useEffect(() => {
    const unsubscribe = listenUserStudyEvents((events) => {
      setStudyEvents(events);
    });
    return unsubscribe;
  }, []);

  const allLibraries = useMemo(() => {
    const map = new Map<string, LibraryMeta>();
    libraries.forEach((lib) => map.set(lib.id, lib));
    shared.forEach((lib) => {
      if (!map.has(lib.id)) map.set(lib.id, lib);
    });
    return Array.from(map.values());
  }, [libraries, shared]);

  useEffect(() => {
    const missing = new Set<string>();
    allLibraries.forEach((lib) => {
      if (!ownerProfiles[lib.ownerId]) missing.add(lib.ownerId);
    });
    if (missing.size === 0) return; let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        Array.from(missing).map(async (id) => {
          try {
            const profile = await userRepository.getUserProfile(id);
            return profile || { id };
          } catch {
            return { id };
          }
        })
      );
      if (cancelled) return;
      const map: Record<string, { id: string; displayName?: string; email?: string; avatarUrl?: string }> = {};
      entries.forEach((entry) => {
        map[entry.id] = entry;
      });
      setOwnerProfiles((prev) => ({ ...prev, ...map }));
    })();
    return () => {
      cancelled = true;
    };
  }, [allLibraries, ownerProfiles]);

  useEffect(() => {
    const unsubs: (() => void)[] = [];
    const tracked = allLibraries.slice(0, 10);
    (async () => {
      const initial: Record<string, ProgressSummaryLite> = {};
      for (const lib of tracked) {
        try {
          const summary = await loadProgressSummary(lib.id);
          if (summary) initial[lib.id] = summary;
        } catch {
          /* ignore */
        }
      }
      setSummaries((prev) => ({ ...initial, ...prev }));
    })();
    tracked.forEach((lib) => {
      const off = listenProgressSummary(lib.id, (summary) => {
        if (!summary) return;
        setSummaries((prev) => ({ ...prev, [lib.id]: summary }));
      });
      unsubs.push(off);
    });
    return () => {
      unsubs.forEach((off) => off());
    };
  }, [allLibraries]);

  const recentFlashcards = useMemo(() => {
    const withAccess = allLibraries
      .map((lib) => {
        const summary = summaries[lib.id];
        return { lib, summary, lastAccessed: summary?.lastAccessed };
      })
      .filter((entry) => !!entry.lastAccessed);
    withAccess.sort((a, b) => (b.lastAccessed || '').localeCompare(a.lastAccessed || ''));
    return withAccess.slice(0, 3).map(({ lib, summary, lastAccessed }) => {
      const total = summary?.total ?? lib.cardCount ?? 0;
      const mastered = summary?.mastered ?? 0;
      return {
        id: lib.id,
        title: lib.title,
        progress: summary ? Math.round(summary.percentMastered) : 0,
        total,
        mastered,
        lastAccessed,
        accuracy: summary?.accuracyOverall,
        sessions: summary?.sessionCount,
        difficulty: (lib as unknown as { difficulty?: string }).difficulty || '—',
      };
    });
  }, [allLibraries, summaries]);

  const upcomingEvents = useMemo(() => getUpcomingEvents(studyEvents).slice(0, 5), [studyEvents]);

  const aggregates = useMemo(() => {
    let totalCards = 0;
    let totalMastered = 0;
    let totalSessions = 0;
    let accuracySum = 0;
    let accuracyCount = 0;
    allLibraries.forEach((lib) => {
      const summary = summaries[lib.id];
      const base = Math.max(lib.cardCount || 0, summary?.total ?? 0);
      totalCards += base;
      totalMastered += summary?.mastered ?? 0;
      totalSessions += summary?.sessionCount ?? 0;
      if (typeof summary?.accuracyOverall === 'number') {
        accuracySum += summary.accuracyOverall;
        accuracyCount += 1;
      }
    });
    const averageAccuracy = accuracyCount ? Math.round((accuracySum / accuracyCount) * 100) : 0;
    return { totalCards, totalMastered, totalSessions, averageAccuracy };
  }, [allLibraries, summaries]);

  const stats = useMemo(
    () => [
      {
        title: 'Tổng bộ flashcard',
        value: allLibraries.length.toString(),
        icon: BookOpen,
        change: 'Bộ sưu tập của bạn',
      },
      {
        title: 'Tổng thẻ',
        value: aggregates.totalCards.toString(),
        icon: Brain,
        change: `Độ chính xác TB ${aggregates.averageAccuracy}%`,
      },
      {
        title: 'Yêu thích',
        value: favorites.length.toString(),
        icon: Star,
        change: 'Được gắn sao',
      },
      {
        title: 'Phiên học',
        value: aggregates.totalSessions.toString(),
        icon: Zap,
        change: 'Tích lũy từ SmartLearn',
      },
    ],
    [allLibraries.length, aggregates.totalCards, aggregates.averageAccuracy, favorites.length, aggregates.totalSessions],
  );

  const completionFromSummaries = useMemo<DashboardTopicCompletion[]>(() => {
    const palette = [
      'hsl(var(--primary))',
      'hsl(var(--accent))',
      'hsl(var(--success))',
      'hsl(var(--warning))',
      'hsl(var(--info))',
    ];
    return allLibraries.slice(0, 5).map((lib, index) => {
      const summary = summaries[lib.id];
      const completion = summary ? Math.round(summary.percentMastered ?? 0) : 0;
      return {
        topic: lib.title,
        completion,
        color: palette[index % palette.length],
      };
    });
  }, [allLibraries, summaries]);

  const hasCompletionData = completionFromSummaries.some((item) => item.completion > 0);
  const chartCompletion = hasCompletionData ? completionFromSummaries : fallbackCompletion;

  const chartProductivity = useMemo<DashboardProductivityPoint[]>(() => {
    if (!aggregates.totalSessions) return fallbackProductivity;
    const focusBase = Math.max(aggregates.totalSessions * 40, 120);
    return Array.from({ length: 4 }, (_, index) => ({
      week: `Tuần ${index + 1}`,
      focusMinutes: Math.round((focusBase * (0.7 + index * 0.05)) / 4),
      reviewSessions: Math.max(1, Math.round((aggregates.totalSessions * (0.6 + index * 0.08)) / 4)),
    }));
  }, [aggregates.totalSessions, fallbackProductivity]);

  const masteryPercent = aggregates.totalCards
    ? Math.round((aggregates.totalMastered / aggregates.totalCards) * 100)
    : 0;

  const firstName = useMemo(() => {
    if (!user || !user.displayName || typeof user.displayName !== 'string') return '';
    const [name] = user.displayName.split(' ');
    return name;
  }, [user]);

  const heroHeading = useMemo(
    () => (
      <span>
        Chào mừng trở lại{firstName ? `, ${firstName}` : ''}! 👋
      </span>
    ),
    [firstName],
  );

  const heroHighlight = useMemo(() => {
    if (allLibraries.length === 0) {
      return 'Bắt đầu bằng cách tạo bộ flashcard đầu tiên của bạn trong thư viện.';
    }
    return `Bạn đang theo dõi ${allLibraries.length} bộ flashcard với ${favorites.length} bộ yêu thích và đã hoàn thành ${masteryPercent}% mục tiêu học tập.`;
  }, [allLibraries.length, favorites.length, masteryPercent]);

  const today = useMemo(() => new Date(), []);
  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(today),
    [today],
  );
  const activeDay = today.getDate();

  return (
    <div className="space-y-8 sm:space-y-10 animate-fade-in-up">
      <PageHero
        eyebrow="SmartLearn Platform"
        heading={heroHeading}
        description="SmartLearn đồng hành cùng bạn trong việc quản lý kiến thức, theo dõi tiến độ và phát triển kỹ năng."
        highlight={heroHighlight}
        mediaLeftSrc="/picture1.png"
        actions={
          <>
            <PageHeroPrimaryAction onClick={() => navigate(ROUTES.MY_LIBRARY)}>
              <BookOpen className="mr-2 h-4 w-4" />
              Khám phá thư viện
            </PageHeroPrimaryAction>
            <PageHeroSecondaryAction onClick={() => navigate(ROUTES.NOTES)}>
              <Star className="mr-2 h-4 w-4" />
              Xem ghi chép
            </PageHeroSecondaryAction>
          </>
        }
      />

      <StatsSection stats={stats} />

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <QuickActionsSection />

          <div className="grid gap-6 lg:grid-cols-2">
            <RecentFlashcardsSection
              recentFlashcards={recentFlashcards}
              libsLoading={libsLoading}
              libraries={libraries}
              allLibraries={allLibraries}
              ownerProfiles={ownerProfiles}
            />
            <UpcomingEventsSection upcomingEvents={upcomingEvents} />
          </div>

          <TasksWidget
            tasks={tasks}
            onShare={() => navigate(ROUTES.CALENDAR)}
          />
        </div>

        <div className="space-y-6">
          <NotificationsWidget notifications={notifications} onClear={handleClearNotifications} />
          {!hasNotifications ? (
            <Card className="widget-card-compact">
              <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                <H3 className="text-base font-semibold mb-1">Không có thông báo mới</H3>
                <P className="text-xs text-muted-foreground">Bạn đã xử lý xong mọi thông báo hôm nay.</P>
              </CardContent>
            </Card>
          ) : null}
          <AssignmentsWidget assignments={assignments} onEdit={() => navigate(ROUTES.CALENDAR)} />
          <CalendarWidget monthLabel={monthLabel} activeDay={activeDay} />
          <MeetingsWidget meetings={meetings} />
        </div>
      </div>

      <AnalyticsChartsSection productivity={chartProductivity} completion={chartCompletion} />
    </div>
  );
}
