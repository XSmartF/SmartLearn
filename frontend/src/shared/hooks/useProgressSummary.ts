import { useEffect, useState } from 'react';
import { loadProgressSummary, listenProgressSummary, type ProgressSummaryLite } from '@/shared/lib/firebaseProgressService';

export function useProgressSummary(libraryId?: string) {
  const [summary, setSummary] = useState<ProgressSummaryLite | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!libraryId) return;
    let unsub = () => {};
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const initial = await loadProgressSummary(libraryId);
        if (!cancelled) setSummary(initial);
      } finally { if (!cancelled) setLoading(false); }
      unsub = listenProgressSummary(libraryId, (s) => { if (!cancelled) setSummary(s); });
    })();
    return () => { cancelled = true; unsub(); };
  }, [libraryId]);
  return { summary, loading };
}
