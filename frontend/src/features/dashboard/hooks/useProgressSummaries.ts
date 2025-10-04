import { useEffect, useMemo, useRef, useState } from "react";
import { loadProgressSummary, listenProgressSummary, type ProgressSummaryLite } from "@/shared/lib/firebase";
import type { LibraryMeta } from "@/shared/lib/models";
import { MAX_SUMMARY_LIBRARIES } from "@/features/dashboard/constants";
import {
  getCachedProgressSummary,
  removeCachedProgressSummary,
  setCachedProgressSummary,
  snapshotCachedSummaries,
} from "@/shared/lib/cache/progressSummaryCache";

function summariesEqual(a: ProgressSummaryLite | undefined, b: ProgressSummaryLite) {
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

export function useProgressSummaries(libraries: LibraryMeta[]): Record<string, ProgressSummaryLite> {
  const trackedIds = useMemo(
    () => libraries.slice(0, MAX_SUMMARY_LIBRARIES).map((library) => library.id),
    [libraries]
  );

  const [summaries, setSummaries] = useState<Record<string, ProgressSummaryLite>>(() =>
    snapshotCachedSummaries(trackedIds)
  );

  const listenersRef = useRef(new Map<string, () => void>());
  const loadedRef = useRef(new Set(Object.keys(summaries)));

  useEffect(() => {
    const listeners = listenersRef.current;
    const loaded = loadedRef.current;

    const trackedSet = new Set(trackedIds);
    const removedIds: string[] = [];

    listeners.forEach((off, id) => {
      if (!trackedSet.has(id)) {
        try { off(); } catch { /* ignore */ }
        listeners.delete(id);
        loaded.delete(id);
        removeCachedProgressSummary(id);
        removedIds.push(id);
      }
    });

    if (removedIds.length) {
      setSummaries((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const id of removedIds) {
          if (id in next) {
            delete next[id];
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }

    trackedIds.forEach((id) => {
      if (listeners.has(id)) return;
      const off = listenProgressSummary(id, (summary) => {
        if (!summary) return;
        setCachedProgressSummary(id, summary);
        loaded.add(id);
        setSummaries((prev) => {
          if (summariesEqual(prev[id], summary)) return prev;
          return { ...prev, [id]: summary };
        });
      });
      listeners.set(id, off);
    });

    return () => {
      // listeners persist across renders; global cleanup handled separately
    };
  }, [trackedIds]);

  useEffect(() => {
    const loaded = loadedRef.current;
    const cachedIds: string[] = [];

    for (const id of trackedIds) {
      if (!loaded.has(id)) {
        const cached = getCachedProgressSummary(id);
        if (cached) {
          cachedIds.push(id);
          loaded.add(id);
        }
      }
    }

    if (cachedIds.length) {
      setSummaries((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const id of cachedIds) {
          const cached = getCachedProgressSummary(id);
          if (!cached) continue;
          if (!summariesEqual(prev[id], cached)) {
            next[id] = cached;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }
  }, [trackedIds]);

  useEffect(() => {
    if (!trackedIds.length) return;
    const loaded = loadedRef.current;
    const idsToLoad = trackedIds.filter((id) => !loaded.has(id));
    if (!idsToLoad.length) return;

    let cancelled = false;

    (async () => {
      const results = await Promise.all(
        idsToLoad.map(async (id) => {
          try {
            const summary = await loadProgressSummary(id);
            return [id, summary] as const;
          } catch {
            return [id, null] as const;
          }
        })
      );

      if (cancelled) return;

      setSummaries((prev) => {
        let changed = false;
        const next = { ...prev };

        for (const [id, summary] of results) {
          if (!summary) continue;
          setCachedProgressSummary(id, summary);
          loaded.add(id);
          if (!summariesEqual(prev[id], summary)) {
            next[id] = summary;
            changed = true;
          }
        }

        return changed ? next : prev;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [trackedIds]);

  useEffect(
    () => () => {
      const listeners = listenersRef.current;
      listeners.forEach((off) => {
        try {
          off();
        } catch {
          /* ignore */
        }
      });
      listeners.clear();
    },
    []
  );

  const trackedSummaries = useMemo(() => {
    if (!trackedIds.length) return {} as Record<string, ProgressSummaryLite>;
    const result: Record<string, ProgressSummaryLite> = {};
    for (const id of trackedIds) {
      const summary = summaries[id];
      if (summary) {
        result[id] = summary;
      }
    }
    return result;
  }, [summaries, trackedIds]);

  return trackedSummaries;
}
