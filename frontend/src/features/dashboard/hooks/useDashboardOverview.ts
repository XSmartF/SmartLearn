import { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/shared/hooks/useAuthRedux';
import { useUserLibraries } from '@/shared/hooks/useLibraries';
import { useFavoriteLibraries } from '@/shared/hooks/useFavorites';
import { useGetSharedLibrariesQuery } from '@/shared/store/api';
import { listenUserStudyEvents } from '@/shared/lib/firebase';
import type { LibraryMeta } from '@/shared/lib/models';
import type { StudyEvent } from '../../study/types/calendar';
import { getUpcomingEvents } from '../../study/utils/calendarUtils';
import { buildUserProductivityPoints } from '../models/productivity';
import type { DashboardProductivityPoint } from '@/features/dashboard/types';
import type { ChartConfig } from '@/shared/components/ui/chart';
import { useOwnerProfiles, type DashboardOwnerProfile } from './useOwnerProfiles';
import { useProgressSummaries } from './useProgressSummaries';

interface ChartPalette {
  focus: string;
  review: string;
  axis: string;
  grid: string;
  radial: string[];
}

export interface RecentFlashcardItem {
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

interface DashboardOverviewViewModel {
  heroTitle: string;
  heroHighlight: string;
  chartPalette: ChartPalette;
  isDarkMode: boolean;
  libsLoading: boolean;
  libraries: LibraryMeta[];
  allLibraries: LibraryMeta[];
  ownerProfiles: Record<string, DashboardOwnerProfile>;
  recentFlashcards: RecentFlashcardItem[];
  upcomingEvents: StudyEvent[];
  chartProductivity: DashboardProductivityPoint[];
  productivityChartConfig: ChartConfig;
}

export function useDashboardOverview(): DashboardOverviewViewModel {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const { libraries, loading: libsLoading } = useUserLibraries();
  const { favorites } = useFavoriteLibraries();
  const { data: shared = [] } = useGetSharedLibrariesQuery();
  const [chartPalette, setChartPalette] = useState<ChartPalette>(() => ({
    focus: '#8b5cf6',
    review: '#38bdf8',
    axis: 'rgba(71, 85, 105, 0.65)',
    grid: 'rgba(148, 163, 184, 0.18)',
    radial: ['#8b5cf6', '#38bdf8', '#34d399', '#fbbf24', '#f472b6'],
  }));
  const [studyEvents, setStudyEvents] = useState<StudyEvent[]>([]);

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

  const ownerProfiles = useOwnerProfiles(allLibraries);
  const summaries = useProgressSummaries(allLibraries);

  const recentFlashcards = useMemo<RecentFlashcardItem[]>(() => {
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

  const chartProductivity = useMemo<DashboardProductivityPoint[]>(
    () => buildUserProductivityPoints(studyEvents),
    [studyEvents],
  );

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

  const masteryPercent = useMemo(() => (
    aggregates.totalCards
      ? Math.round((aggregates.totalMastered / aggregates.totalCards) * 100)
      : 0
  ), [aggregates.totalCards, aggregates.totalMastered]);

  const firstName = useMemo(() => {
    if (!user || !user.displayName || typeof user.displayName !== 'string') return '';
    const [name] = user.displayName.split(' ');
    return name;
  }, [user]);

  const heroTitle = useMemo(
    () => `Chào mừng trở lại${firstName ? `, ${firstName}` : ''}! 👋`,
    [firstName],
  );

  const heroHighlight = useMemo(() => {
    if (allLibraries.length === 0) {
      return 'Bắt đầu bằng cách tạo bộ flashcard đầu tiên của bạn trong thư viện.';
    }
    return `Bạn đang theo dõi ${allLibraries.length} bộ flashcard với ${favorites.length} bộ yêu thích và đã hoàn thành ${masteryPercent}% mục tiêu học tập.`;
  }, [allLibraries.length, favorites.length, masteryPercent]);

  return {
    heroTitle,
    heroHighlight,
    chartPalette,
    isDarkMode,
    libsLoading,
    libraries,
    allLibraries,
    ownerProfiles,
    recentFlashcards,
    upcomingEvents,
    chartProductivity,
    productivityChartConfig,
  };
}
