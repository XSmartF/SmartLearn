import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Star, Users, Zap, Brain, Plus } from "lucide-react";
import { useUserLibraries } from '@/hooks/useLibraries';
import { useFavoriteLibraries } from '@/hooks/useFavorites';
import { useEffect, useState } from 'react';
import { loadProgressSummary, listenProgressSummary, type ProgressSummaryLite } from '@/lib/firebaseProgressService';
import { listenUserSharedLibraries, fetchLibrariesByIds, getUserProfile } from '@/lib/firebaseLibraryService';
import type { LibraryMeta } from '@/lib/models';

// NOTE: Real progress & accuracy would come from progress documents; placeholder calculations here.
export default function DashboardHome() {
  const { libraries, loading: libsLoading } = useUserLibraries(); // owned
  const { favorites } = useFavoriteLibraries();
  const [summaries, setSummaries] = useState<Record<string, ProgressSummaryLite>>({});
  const [shared, setShared] = useState<LibraryMeta[]>([]);
  const [ownerProfiles, setOwnerProfiles] = useState<Record<string, { id: string; displayName?: string; email?: string; avatarUrl?: string }>>({});

  // Subscribe to shared libraries
  useEffect(()=>{
    let unsub: (()=>void)|null = null; let active = true;
    try {
      unsub = listenUserSharedLibraries(async entries => {
        const ids = entries.map(e=>e.libraryId);
        const libs = ids.length ? await fetchLibrariesByIds(ids) : [];
        if (active) setShared(libs);
      });
    } catch {/* ignore */}
    return ()=>{ active=false; if(unsub) unsub(); };
  }, []);

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
      const results = await Promise.all(Array.from(missing).map(async id=>{ try { const p = await getUserProfile(id); return p || { id }; } catch { return { id }; } }));
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
        <h1 className="text-3xl font-bold">Chào mừng trở lại!</h1>
        <p className="text-muted-foreground">
          Tiếp tục hành trình học tập của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Flashcard Sets */}
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
                  { /* Ownership badge (simple heuristic: if not in owned list then shared) */ }
                  <div className="flex gap-2 items-center mb-1">
                    {libraries.find(o=>o.id===flashcard.id) ? (
                      <Badge variant="secondary" className="text-[10px] px-1">Sở hữu</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] px-1">Chia sẻ</Badge>
                    )}
                    {(() => { const lib = allLibraries.find(l=>l.id===flashcard.id); if(!lib) return null; const owner = ownerProfiles[lib.ownerId]; const label = owner?.displayName || owner?.email || owner?.id?.slice(0,6) || '—'; return (
                      <div className="flex items-center gap-1">
                        {owner?.avatarUrl ? (
                          <img src={owner.avatarUrl} alt={label} className="w-4 h-4 rounded-full object-cover" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-muted text-[8px] flex items-center justify-center uppercase">{label.slice(0,1)}</div>
                        )}
                        <span className="text-[10px] text-muted-foreground">{label}</span>
                      </div>
                    ); })()}
                  </div>
                  <p className="text-sm text-gray-500">{flashcard.lastAccessed ? new Date(flashcard.lastAccessed).toLocaleString() : '—'}</p>
                  <p className="text-xs text-gray-400">{flashcard.mastered}/{flashcard.total} thẻ đã thuộc • {flashcard.difficulty} {flashcard.accuracy !== undefined && (<span>• Độ chính xác {(flashcard.accuracy*100).toFixed(0)}%</span>)} {flashcard.sessions ? (<span>• {flashcard.sessions} phiên</span>) : null}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${flashcard.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                  <span className="text-sm font-medium">{flashcard.progress}%</span>
                  <Button size="sm" variant="outline" className="text-xs" onClick={()=>window.location.href = `/dashboard/study/${flashcard.id}`}>Tiếp tục học</Button>
                </div>
              </div>
            ))}
            <Button className="w-full" variant="outline">
              Xem tất cả bộ flashcard
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Lịch nhắc nhở</CardTitle>
            <CardDescription>
              Đừng bỏ lỡ những hoạt động quan trọng
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {event.type === 'test' && <Badge variant="destructive">Kiểm tra</Badge>}
                  {event.type === 'study' && <Badge variant="default">Học mới</Badge>}
                  {event.type === 'review' && <Badge variant="secondary">Ôn tập</Badge>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.time}</p>
                </div>
              </div>
            ))}
            <Button className="w-full" variant="outline" size="sm">
              <Clock className="h-4 w-4 mr-2" />
              Xem lịch đầy đủ
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hành động nhanh</CardTitle>
          <CardDescription>
            Các tính năng thường được sử dụng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Plus className="h-6 w-6" />
              <span className="text-sm">Tạo flashcard mới</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <BookOpen className="h-6 w-6" />
              <span className="text-sm">Duyệt thư viện</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Chia sẻ bộ thẻ</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Star className="h-6 w-6" />
              <span className="text-sm">Thống kê học tập</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
