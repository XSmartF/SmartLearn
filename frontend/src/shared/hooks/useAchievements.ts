import { useEffect, useState } from 'react';
import { loadProgressSummary, type ProgressSummaryLite } from '@/shared/lib/firebase';
import { useAllLibraries } from './useLibraries';
import type { QueryResult } from '@/shared/types/query';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  progress?: number; // 0-1
  earned: boolean;
  icon?: string; // lucide icon name or emoji placeholder
  meta?: Record<string, unknown>;
}
export interface AchievementsResult extends QueryResult<Achievement[]> {
  achievements: Achievement[]; // legacy field
  refresh: () => void;
}

// Simple client-side derived achievements; no persistence yet.
export function useAchievements(): AchievementsResult {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  const { libraries } = useAllLibraries();
  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      setLoading(true);
      try {
  const libs = libraries;
        // Load summaries sequentially (small scale). Could parallelize with Promise.allSettled.
        const summaries: Record<string, ProgressSummaryLite> = {};
        for (const lib of libs) {
          try { const s = await loadProgressSummary(lib.id); if (s) summaries[lib.id] = s; } catch {/* ignore */}
        }
        const totalMastered = Object.values(summaries).reduce((acc,s)=> acc + s.mastered, 0);
        const totalCards = Object.values(summaries).reduce((acc,s)=> acc + s.total, 0);
        const totalSessions = Object.values(summaries).reduce((acc,s)=> acc + (s.sessionCount||0), 0);
        const allAccuracySamples = Object.values(summaries).map(s => s.accuracyOverall || 0).filter(x=> x>0);
        const avgAccuracy = allAccuracySamples.length ? allAccuracySamples.reduce((a,b)=>a+b,0)/allAccuracySamples.length : 0;

        const defs: Achievement[] = [
          {
            id: 'start-1',
            title: 'Bắt đầu hành trình',
            description: 'Hoàn thành ít nhất 1 thẻ (mastery đạt ngưỡng).',
            earned: totalMastered >= 1,
            progress: Math.min(1, totalMastered / 1),
            icon: 'Rocket'
          },
          {
            id: 'master-10',
            title: 'Thành thạo cơ bản',
            description: 'Master 10 thẻ.',
            earned: totalMastered >= 10,
            progress: Math.min(1, totalMastered / 10),
            icon: 'Target'
          },
          {
            id: 'master-50',
            title: 'Chuyên cần',
            description: 'Master 50 thẻ.',
            earned: totalMastered >= 50,
            progress: Math.min(1, totalMastered / 50),
            icon: 'Medal'
          },
          {
            id: 'cards-100',
            title: 'Bộ sưu tập 100',
            description: 'Tổng số thẻ trong các thư viện >= 100.',
            earned: totalCards >= 100,
            progress: Math.min(1, totalCards / 100),
            icon: 'BookOpen'
          },
          {
            id: 'sessions-5',
            title: 'Tập luyện đều',
            description: 'Tham gia 5 phiên học khác nhau.',
            earned: totalSessions >= 5,
            progress: Math.min(1, totalSessions / 5),
            icon: 'Timer'
          },
          {
            id: 'accuracy-80',
            title: 'Độ chính xác ấn tượng',
            description: 'Đạt độ chính xác trung bình >= 80%.',
            earned: avgAccuracy >= 0.8,
            progress: Math.min(1, avgAccuracy / 0.8),
            icon: 'CheckCircle',
            meta: { avgAccuracy }
          }
        ];
        if (!cancelled) setAchievements(defs);
      } finally { if (!cancelled) setLoading(false); }
    };
    fetchAll();
    return () => { cancelled = true; };
  }, [reloadToken, libraries]);

  // Backward compat: achievements field + unified data
  return { achievements, data: achievements, loading, error: null, refresh: () => setReloadToken(t=> t+1) };
}
