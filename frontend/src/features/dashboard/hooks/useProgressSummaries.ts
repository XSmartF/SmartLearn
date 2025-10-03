import { useEffect, useState } from "react";
import { loadProgressSummary, listenProgressSummary, type ProgressSummaryLite } from "@/shared/lib/firebase";
import type { LibraryMeta } from "@/shared/lib/models";
import { MAX_SUMMARY_LIBRARIES } from "@/features/dashboard/constants";

export function useProgressSummaries(libraries: LibraryMeta[]): Record<string, ProgressSummaryLite> {
  const [summaries, setSummaries] = useState<Record<string, ProgressSummaryLite>>({});

  useEffect(() => {
    if (!libraries.length) return;

    const trackedLibraries = libraries.slice(0, MAX_SUMMARY_LIBRARIES);
    let cancelled = false;
    const unsubscribe: Array<() => void> = [];

    (async () => {
      const initial: Record<string, ProgressSummaryLite> = {};
      for (const library of trackedLibraries) {
        try {
          const summary = await loadProgressSummary(library.id);
          if (summary) {
            initial[library.id] = summary;
          }
        } catch {
          /* ignore individual fetch errors */
        }
      }
      if (!cancelled) {
        setSummaries((prev) => ({ ...initial, ...prev }));
      }
    })();

    trackedLibraries.forEach((library) => {
      const off = listenProgressSummary(library.id, (summary) => {
        if (!summary) return;
        setSummaries((prev) => ({ ...prev, [library.id]: summary }));
      });
      unsubscribe.push(off);
    });

    return () => {
      cancelled = true;
      unsubscribe.forEach((off) => {
        try {
          off();
        } catch {
          /* ignore */
        }
      });
    };
  }, [libraries]);

  return summaries;
}
