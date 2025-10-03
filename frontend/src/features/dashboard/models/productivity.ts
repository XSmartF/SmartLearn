import type { DashboardSources } from "../data/useDashboardSources";
import type { DashboardProductivitySectionModel } from "../types";
import { computeDashboardAggregates } from "./aggregates";

const buildSyntheticProductivity = (totalSessions: number) => {
  const focusBase = Math.max(totalSessions * 40, 120);

  return Array.from({ length: 4 }, (_, index) => ({
    week: `Tuần ${index + 1}`,
    focusMinutes: Math.round((focusBase * (0.7 + index * 0.05)) / 4),
    reviewSessions: Math.max(1, Math.round((totalSessions * (0.6 + index * 0.08)) / 4)),
  }));
};

export function buildDashboardProductivitySectionModel(
  sources: DashboardSources
): DashboardProductivitySectionModel {
  const aggregates = computeDashboardAggregates(sources.allLibraries, sources.summaries);

  const data = aggregates.totalSessions
    ? buildSyntheticProductivity(aggregates.totalSessions)
    : sources.fallbackProductivity;

  return {
    title: "Hiệu suất học tập",
    description: "Thời gian tập trung và phiên ôn tập trong 4 tuần gần nhất",
    palette: sources.palette,
    config: {
      focusMinutes: {
        label: "Phút tập trung",
        color: sources.palette.focus,
      },
      reviewSessions: {
        label: "Phiên ôn tập",
        color: sources.palette.review,
      },
    },
    data,
  } satisfies DashboardProductivitySectionModel;
}
