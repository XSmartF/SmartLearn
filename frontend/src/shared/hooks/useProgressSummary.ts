import { useEffect, useState } from 'react';
import { loadProgressSummary, listenProgressSummary, type ProgressSummaryLite } from '@/shared/lib/firebase';
import {
  getCachedProgressSummary,
  setCachedProgressSummary,
} from '@/shared/lib/cache/progressSummaryCache';

function summariesEqual(a: ProgressSummaryLite | null, b: ProgressSummaryLite) {
  if (!a) return false;
  return (
    a.total === b.total &&
    a.mastered === b.mastered &&
    a.learning === b.learning &&
    a.due === b.due &&
    a.percentMastered === b.percentMastered &&
    a.accuracyOverall === b.accuracyOverall &&
    a.sessionCount === b.sessionCount &&
    a.lastAccessed === b.lastAccessed &&
    a.updatedAt === b.updatedAt
  );
}

export function useProgressSummary(libraryId?: string) {
  const [summary, setSummary] = useState<ProgressSummaryLite | null>(() =>
    libraryId ? getCachedProgressSummary(libraryId) : null
  );
  const [loading, setLoading] = useState(() => (libraryId && !getCachedProgressSummary(libraryId)) || false);
  useEffect(() => {
    if (!libraryId) return;
    let unsub = () => {};
    let cancelled = false;
    const cached = getCachedProgressSummary(libraryId);
    if (cached) {
      setSummary((prev) => (summariesEqual(prev, cached) ? prev : cached));
    } else {
      setSummary((prev) => (prev ? null : prev));
    }
    const hasCached = Boolean(cached);
    setLoading(!hasCached);
    (async () => {
      if (!hasCached) setLoading(true);
      try {
        const initial = await loadProgressSummary(libraryId);
        if (!cancelled) {
          if (initial) {
            setCachedProgressSummary(libraryId, initial);
          }
          setSummary((prev) => {
            if (initial && summariesEqual(prev, initial)) return prev;
            return initial;
          });
        }
      } finally { if (!cancelled) setLoading(false); }
      unsub = listenProgressSummary(libraryId, (s) => {
        if (cancelled) return;
        if (s) {
          setCachedProgressSummary(libraryId, s);
          setSummary((prev) => (summariesEqual(prev, s) ? prev : s));
        } else {
          setSummary((prev) => (prev ? null : prev));
        }
      });
    })();
    return () => { cancelled = true; unsub(); };
  }, [libraryId]);
  return { summary, loading };
}
