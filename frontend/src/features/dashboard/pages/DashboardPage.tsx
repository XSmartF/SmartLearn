import { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ChartContainer, type ChartConfig, ChartTooltipContent, ChartLegendContent } from '@/shared/components/ui/chart';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  
} from 'recharts';
import {
  RecentFlashcardsSection,
  UpcomingEventsSection,
} from '../components';
import {
  useDashboardAnalytics,
  type DashboardProductivityPoint,
} from '../hooks/useDashboardAnalytics';

export default function DashboardPage() {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const [chartPalette, setChartPalette] = useState<{ focus: string; review: string; axis: string; grid: string; radial: string[] }>(() => ({
    focus: '#8b5cf6',
    review: '#38bdf8',
    axis: 'rgba(71, 85, 105, 0.65)',
    grid: 'rgba(148, 163, 184, 0.18)',
    radial: ['#8b5cf6', '#38bdf8', '#34d399', '#fbbf24', '#f472b6'],
  }));
  const { libraries, loading: libsLoading } = useUserLibraries();
  const { favorites } = useFavoriteLibraries();
  const { data: shared = [] } = useGetSharedLibrariesQuery();
  const [summaries, setSummaries] = useState<Record<string, ProgressSummaryLite>>({});
  const [studyEvents, setStudyEvents] = useState<StudyEvent[]>([]);
  const [ownerProfiles, setOwnerProfiles] = useState<Record<string, { id: string; displayName?: string; email?: string; avatarUrl?: string }>>({});

  const { productivity: fallbackProductivity } = useDashboardAnalytics();

  useEffect(() => {
    const unsubscribe = listenUserStudyEvents((events) => {
      setStudyEvents(events);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const style = getComputedStyle(document.documentElement);
    const getVar = (name: string, fallback: string) => {
      const value = style.getPropertyValue(name);
      return value ? value.trim() : fallback;
    };
    const axisFallback = isDarkMode ? 'rgba(226, 232, 240, 0.72)' : 'rgba(71, 85, 105, 0.7)';
    const focus = getVar('--chart-1', isDarkMode ? '#a78bfa' : '#7c3aed');
    const review = getVar('--chart-2', isDarkMode ? '#38bdf8' : '#0ea5e9');
    const radial = [
      focus,
      review,
      getVar('--chart-3', isDarkMode ? '#34d399' : '#22c55e'),
      getVar('--chart-4', isDarkMode ? '#fbbf24' : '#f59e0b'),
      getVar('--chart-5', isDarkMode ? '#f472b6' : '#ec4899'),
    ];
    setChartPalette({
      focus,
      review,
      axis: getVar('--muted-foreground', axisFallback) || axisFallback,
      grid: isDarkMode ? 'rgba(148, 163, 184, 0.26)' : 'rgba(148, 163, 184, 0.18)',
      radial,
    });
  }, [isDarkMode]);

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
    return withAccess.slice(0, 7).map(({ lib, summary, lastAccessed }) => {
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

  // Removed completion chart and related calculations

  const chartProductivity = useMemo<DashboardProductivityPoint[]>(() => {
    if (!aggregates.totalSessions) return fallbackProductivity;
    const focusBase = Math.max(aggregates.totalSessions * 40, 120);
    return Array.from({ length: 4 }, (_, index) => ({
      week: `Tuần ${index + 1}`,
      focusMinutes: Math.round((focusBase * (0.7 + index * 0.05)) / 4),
      reviewSessions: Math.max(1, Math.round((aggregates.totalSessions * (0.6 + index * 0.08)) / 4)),
    }));
  }, [aggregates.totalSessions, fallbackProductivity]);

  const productivityChartConfig = useMemo<ChartConfig>(() => ({
    focusMinutes: {
      label: 'Phút tập trung',
      color: chartPalette.focus,
    },
    reviewSessions: {
      label: 'Phiên ôn tập',
      color: chartPalette.review,
    },
  }), [chartPalette.focus, chartPalette.review]);

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

  return (
    <div className="space-y-3 animate-fade-in-up h-[calc(100vh-120px)] flex flex-col">
      {/* Compact Hero - smaller */}
      <div className="relative rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-4 border min-h-[100px] flex-shrink-0">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-xl sm:text-2xl font-bold mb-1">
            {heroHeading}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
            {heroHighlight}
          </p>
        </div>
        {/* Decorative image - smaller */}
        <div className="absolute right-2 sm:right-4 -bottom-4 sm:-bottom-6 w-32 h-32 sm:w-48 sm:h-48 opacity-30 pointer-events-none z-0">
          <img src="/picture1.png" alt="" className="w-full h-full object-contain drop-shadow-xl" />
        </div>
      </div>

      {/* Bento Grid Layout - fixed height to fit screen */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 flex-1 min-h-0">
        {/* Recent Flashcards - takes 2 rows, 2 cols on left */}
        <div className="lg:col-span-2 lg:row-span-2 min-h-[600px] sm:min-h-[700px] md:min-h-[800px] lg:min-h-0">
          <RecentFlashcardsSection
            recentFlashcards={recentFlashcards}
            libsLoading={libsLoading}
            libraries={libraries}
            allLibraries={allLibraries}
            ownerProfiles={ownerProfiles}
          />
        </div>

        {/* Productivity Chart - top right, spans 2 cols */}
        <div className="lg:col-span-2 min-h-[480px] sm:min-h-[560px] md:min-h-[640px] lg:min-h-0">
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Hiệu suất học tập</CardTitle>
              <CardDescription className="text-[10px]">Thời gian tập trung và phiên ôn tập</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[440px] sm:min-h-[520px] md:min-h-[600px] lg:min-h-0">
              <ChartContainer config={productivityChartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartProductivity} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartPalette.focus} stopOpacity={isDarkMode ? 0.65 : 0.4} />
                        <stop offset="95%" stopColor={chartPalette.focus} stopOpacity={isDarkMode ? 0.25 : 0.08} />
                      </linearGradient>
                      <linearGradient id="reviewGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartPalette.review} stopOpacity={isDarkMode ? 0.6 : 0.4} />
                        <stop offset="95%" stopColor={chartPalette.review} stopOpacity={isDarkMode ? 0.22 : 0.08} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartPalette.grid} />
                    <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: chartPalette.axis, fontSize: 10 }} tickMargin={6} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: chartPalette.axis, fontSize: 10 }} tickMargin={4} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend verticalAlign="top" align="right" content={<ChartLegendContent />} wrapperStyle={{ fontSize: '10px', paddingBottom: '8px' }} iconSize={10} />
                    <Area type="monotone" dataKey="focusMinutes" stroke={chartPalette.focus} fill="url(#focusGradient)" strokeWidth={1.8} />
                    <Area type="monotone" dataKey="reviewSessions" stroke={chartPalette.review} fill="url(#reviewGradient)" strokeWidth={1.8} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events - bottom right, left col */}
        <div className="lg:col-span-2 min-h-[520px] sm:min-h-[600px] md:min-h-[680px] lg:min-h-0">
          <UpcomingEventsSection upcomingEvents={upcomingEvents} />
        </div>
        {/** Removed completion chart; UpcomingEvents now spans full right side */}
      </div>
    </div>
  );
}
