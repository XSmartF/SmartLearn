import { useEffect, useState } from 'react';
import { loadProgressSummary, listenProgressSummary, type ProgressSummaryLite } from '@/shared/services';
import {
  getCachedProgressSummary,
  setCachedProgressSummary,
} from '@/shared/lib/cache/progressSummaryCache';

function summariesEqual(a: ProgressSummaryLite | null, b: ProgressSummaryLite): boolean {
  if (!a) return false;
  return a.total === b.total && a.mastered === b.mastered && a.learning === b.learning
    && a.due === b.due && a.percentMastered === b.percentMastered
    && a.accuracyOverall === b.accuracyOverall && a.sessionCount === b.sessionCount
    && a.lastAccessed === b.lastAccessed && a.updatedAt === b.updatedAt;
}

function updateIfChanged(incoming: ProgressSummaryLite | null) {
  return (prev: ProgressSummaryLite | null) => {
    if (!incoming) return prev ? null : prev;
    return summariesEqual(prev, incoming) ? prev : incoming;
  };
}

export function useProgressSummary(libraryId?: string) {
  const [summary, setSummary] = useState<ProgressSummaryLite | null>(() =>
    libraryId ? getCachedProgressSummary(libraryId) : null,
  );
  const [loading, setLoading] = useState(() => !!(libraryId && !getCachedProgressSummary(libraryId)));

  useEffect(() => {
    if (!libraryId) return;
    let unsub = () => {};
    let cancelled = false;

    const cached = getCachedProgressSummary(libraryId);
    setSummary(updateIfChanged(cached));
    setLoading(!cached);

    (async () => {
      try {
        const initial = await loadProgressSummary(libraryId);
        if (!cancelled) {
          if (initial) setCachedProgressSummary(libraryId, initial);
          setSummary(updateIfChanged(initial));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }

      unsub = listenProgressSummary(libraryId, s => {
        if (cancelled) return;
        if (s) setCachedProgressSummary(libraryId, s);
        setSummary(updateIfChanged(s));
      });
    })();

    return () => { cancelled = true; unsub(); };
  }, [libraryId]);

  return { summary, loading };
}
