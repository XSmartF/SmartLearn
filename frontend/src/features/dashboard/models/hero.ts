import { DASHBOARD_HERO_IMAGE } from "../constants";
import type { DashboardSources } from "../data/useDashboardSources";
import type { DashboardHeroModel } from "../types";
import { computeDashboardAggregates, computeMasteryPercent } from "./aggregates";

const extractFirstName = (displayName?: unknown) => {
  if (typeof displayName !== "string" || !displayName.trim()) return "";
  return displayName.trim().split(" ")[0];
};

export function buildDashboardHeroModel(sources: DashboardSources): DashboardHeroModel {
  const firstName = extractFirstName(sources.user?.displayName);
  const aggregates = computeDashboardAggregates(sources.allLibraries, sources.summaries);
  const masteredPercent = computeMasteryPercent(aggregates);

  const title = firstName
    ? `Chào mừng trở lại, ${firstName}! 👋`
    : "Chào mừng trở lại! 👋";

  const subtitle = sources.allLibraries.length === 0
    ? "Bắt đầu bằng cách tạo bộ flashcard đầu tiên của bạn trong thư viện."
    : `Bạn đang theo dõi ${sources.ownedLibraries.length + sources.sharedLibraries.length} bộ flashcard với ${sources.favorites.length} bộ yêu thích và đã hoàn thành ${masteredPercent}% mục tiêu học tập.`;

  return {
    title,
    subtitle,
    accentImage: DASHBOARD_HERO_IMAGE,
  };
}
