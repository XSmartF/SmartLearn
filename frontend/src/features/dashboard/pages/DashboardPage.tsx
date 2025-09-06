import { useMemo } from 'react';
import { BookOpen, Star, Brain, Zap } from "lucide-react";
import { useUserLibraries } from '@/shared/hooks/useLibraries';
import { useFavoriteLibraries } from '@/shared/hooks/useFavorites';
import { useEffect, useState } from 'react';
import { H1 } from '@/shared/components/ui/typography';
import { loadProgressSummary, listenProgressSummary, type ProgressSummaryLite } from '@/shared/lib/firebaseProgressService';
import { useGetSharedLibrariesQuery } from '@/shared/store/api';
import { userRepository } from '@/shared/lib/repositories/UserRepository';
import type { LibraryMeta } from '@/shared/lib/models';
import { StatsSection, RecentFlashcardsSection, UpcomingEventsSection, QuickActionsSection } from '../components';

// NOTE: Real progress & accuracy would come from progress documents; placeholder calculations here.
export default function DashboardPage() {
  const { libraries, loading: libsLoading } = useUserLibraries(); // owned
  const { favorites } = useFavoriteLibraries();
  const [summaries, setSummaries] = useState<Record<string, ProgressSummaryLite>>({});
  const { data: shared = [] } = useGetSharedLibrariesQuery();
  const [ownerProfiles, setOwnerProfiles] = useState<Record<string, { id: string; displayName?: string; email?: string; avatarUrl?: string }>>({});

  // shared libraries now provided via RTK Query

  // Combined list (owned + shared, dedup by id)
  const allLibraries = useMemo(()=>{
    const map = new Map<string, LibraryMeta>();
    libraries.forEach(l=>map.set(l.id,l));
    shared.forEach(s=>{ if(!map.has(s.id)) map.set(s.id,s); });
    return Array.from(map.values());
  }, [libraries, shared]);

  // Fetch owner profiles lazily
  useEffect(()=>{
    const missing = new Set<string>();
    allLibraries.forEach(l=>{ if(!ownerProfiles[l.ownerId]) missing.add(l.ownerId); });
    if(missing.size===0) return; let cancelled=false;
    (async()=>{
  const results = await Promise.all(Array.from(missing).map(async id=>{ try { const p = await userRepository.getUserProfile(id); return p || { id }; } catch { return { id }; } }));
      if(cancelled) return; const map: Record<string, { id: string; displayName?: string; email?: string; avatarUrl?: string }> = {};
      results.forEach(r=>{ map[r.id]=r; });
      setOwnerProfiles(prev=> ({ ...prev, ...map }));
    })();
    return ()=>{ cancelled=true };
  }, [allLibraries, ownerProfiles]);

  // removed manual refresh; summaries auto-load once
  useEffect(() => {
    const unsubs: (() => void)[] = [];
    const firstTen = allLibraries.slice(0, 10);
    (async () => {
      const entries: Record<string, ProgressSummaryLite> = {};
      for (const lib of firstTen) {
        try { const s = await loadProgressSummary(lib.id); if (s) entries[lib.id] = s; } catch { /* ignore */ }
      }
      setSummaries(prev => ({ ...entries, ...prev }));
    })();
    for (const lib of firstTen) {
      const off = listenProgressSummary(lib.id, (s) => {
        if (!s) return;
        setSummaries(prev => ({ ...prev, [lib.id]: s }));
      });
      unsubs.push(off);
    }
    return () => { unsubs.forEach(u => u()); };
  }, [allLibraries]);

  const recentFlashcards = useMemo(() => {
    const withAccess = allLibraries.map(l => {
      const s = summaries[l.id];
      return { lib: l, summary: s, lastAccessed: s?.lastAccessed };
    }).filter(x => !!x.lastAccessed);
    withAccess.sort((a,b) => (b.lastAccessed || '').localeCompare(a.lastAccessed || ''));
    return withAccess.slice(0,3).map(({ lib, summary, lastAccessed }) => {
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
        difficulty: (lib as unknown as { difficulty?: string }).difficulty || '—'
      };
    });
  }, [allLibraries, summaries]);

  const stats = useMemo(() => {
    const totalLibraries = allLibraries.length;
    const totalCards = allLibraries.reduce((sum,l) => {
      const s = summaries[l.id];
      const base = l.cardCount || 0;
      const derived = s?.total || 0;
      return sum + Math.max(base, derived);
    }, 0);
    return [
      { title: 'Tổng bộ flashcard', value: totalLibraries.toString(), icon: BookOpen, change: '' },
      { title: 'Tổng thẻ', value: totalCards.toString(), icon: Brain, change: '' },
      { title: 'Yêu thích', value: favorites.length.toString(), icon: Star, change: '' },
      { title: 'Đang phát triển', value: 'Soon', icon: Zap, change: 'Progress' },
    ];
  }, [allLibraries, favorites, summaries]);

  const upcomingEvents: { title: string; time: string; type: 'review'|'study'|'test' }[] = [];

  return (
    <div className="space-y-6">
      <div>
  <H1 className="text-3xl font-bold">Chào mừng trở lại!</H1>
        <p className="text-muted-foreground">
          Tiếp tục hành trình học tập của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <StatsSection stats={stats} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Flashcard Sets */}
        <RecentFlashcardsSection
          recentFlashcards={recentFlashcards}
          libsLoading={libsLoading}
          libraries={libraries}
          allLibraries={allLibraries}
          ownerProfiles={ownerProfiles}
        />

        {/* Upcoming Events */}
        <UpcomingEventsSection upcomingEvents={upcomingEvents} />
      </div>

      {/* Quick Actions */}
      <QuickActionsSection />
    </div>
  )
}
