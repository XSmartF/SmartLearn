import { useMemo } from "react";

import { DASHBOARD_LAYOUT } from "@/features/dashboard/constants";
import type { DashboardViewModel } from "@/features/dashboard/types";
import { useDashboardSources } from "../data/useDashboardSources";
import { buildDashboardHeroModel } from "../models/hero";
import { buildDashboardFlashcardsSectionModel } from "../models/flashcards";
import { buildDashboardProductivitySectionModel } from "../models/productivity";
import { buildDashboardEventsSectionModel } from "../models/events";

export function useDashboardView(): DashboardViewModel {
  const sources = useDashboardSources();

  return useMemo(
    () => ({
      hero: buildDashboardHeroModel(sources),
      flashcards: buildDashboardFlashcardsSectionModel(sources),
      productivity: buildDashboardProductivitySectionModel(sources),
      events: buildDashboardEventsSectionModel(sources),
      layout: DASHBOARD_LAYOUT,
    }),
    [sources]
  );
}
