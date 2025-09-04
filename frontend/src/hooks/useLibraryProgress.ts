import { useEffect, useState, useCallback } from 'react';
import { progressRepository } from '@/lib/repositories/ProgressRepository';

interface ProgressState {
  mastered: number;
  learning: number;
  due: number;
  total: number;
}

export function useLibraryProgress(libraryId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ProgressState>({ mastered: 0, learning: 0, due: 0, total: 0 });
  const [rawState, setRawState] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!libraryId) return;
    let cancelled = false;
    (async () => {
      setLoading(true); setError(null);
      try {
  const prog = await progressRepository.getUserLibraryProgress(libraryId);
        if (cancelled) return;
        setRawState(prog?.engineState ?? null);
  const s = await progressRepository.computeBasicProgressStats(libraryId);
        if (!cancelled) setStats(s);
      } catch(e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Load progress failed');
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [libraryId]);

  const saveProgress = useCallback(async (engineState: Record<string, unknown>) => {
    if (!libraryId) return;
  await progressRepository.upsertUserLibraryProgress(libraryId, engineState);
    setRawState(engineState);
    // naive recompute
  const s = await progressRepository.computeBasicProgressStats(libraryId);
    setStats(s);
  }, [libraryId]);

  return { loading, error, stats, rawState, saveProgress };
}