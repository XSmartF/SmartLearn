import type { LibraryMeta } from "@/shared/lib/models";
import type { ProgressSummaryLite } from "@/shared/lib/firebase";

export interface DashboardAggregates {
  totalCards: number;
  totalMastered: number;
  totalSessions: number;
  accuracySum: number;
  accuracyCount: number;
}

export function computeDashboardAggregates(
  libraries: LibraryMeta[],
  summaries: Record<string, ProgressSummaryLite | undefined>
): DashboardAggregates {
  return libraries.reduce<DashboardAggregates>(
    (acc, library) => {
      const summary = summaries[library.id];
      const total = Math.max(library.cardCount ?? 0, summary?.total ?? 0);

      acc.totalCards += total;
      acc.totalMastered += summary?.mastered ?? 0;
      acc.totalSessions += summary?.sessionCount ?? 0;

      if (typeof summary?.accuracyOverall === "number") {
        acc.accuracySum += summary.accuracyOverall;
        acc.accuracyCount += 1;
      }

      return acc;
    },
    { totalCards: 0, totalMastered: 0, totalSessions: 0, accuracySum: 0, accuracyCount: 0 }
  );
}

export const computeMasteryPercent = (aggregates: DashboardAggregates) => {
  if (!aggregates.totalCards) return 0;
  return Math.round((aggregates.totalMastered / aggregates.totalCards) * 100);
};

export const computeAverageAccuracy = (aggregates: DashboardAggregates) => {
  if (!aggregates.accuracyCount) return 0;
  return Math.round((aggregates.accuracySum / aggregates.accuracyCount) * 100);
};
