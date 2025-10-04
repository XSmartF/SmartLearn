import type { ProgressSummaryLite } from '@/shared/lib/firebase';

const cache = new Map<string, ProgressSummaryLite>();

export function getCachedProgressSummary(libraryId: string): ProgressSummaryLite | null {
  return cache.get(libraryId) ?? null;
}

export function setCachedProgressSummary(libraryId: string, summary: ProgressSummaryLite) {
  cache.set(libraryId, summary);
}

export function removeCachedProgressSummary(libraryId: string) {
  cache.delete(libraryId);
}

export function snapshotCachedSummaries(ids: string[]): Record<string, ProgressSummaryLite> {
  if (!ids.length) return {};
  const result: Record<string, ProgressSummaryLite> = {};
  for (const id of ids) {
    const summary = cache.get(id);
    if (summary) {
      result[id] = summary;
    }
  }
  return result;
}
