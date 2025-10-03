import type { DashboardChartPalette, DashboardSectionLayout } from "@/features/dashboard/types";

export const MAX_RECENT_FLASHCARDS = 7;
export const MAX_UPCOMING_EVENTS = 5;
export const MAX_SUMMARY_LIBRARIES = 10;

export const DASHBOARD_LAYOUT: DashboardSectionLayout[] = [
  {
    id: "flashcards",
    className: "lg:col-span-2 lg:row-span-2",
    minHeightClassName: "min-h-[600px] sm:min-h-[700px] md:min-h-[800px] lg:min-h-0"
  },
  {
    id: "productivity",
    className: "lg:col-span-2",
    minHeightClassName: "min-h-[480px] sm:min-h-[560px] md:min-h-[640px] lg:min-h-0"
  },
  {
    id: "events",
    className: "lg:col-span-2",
    minHeightClassName: "min-h-[520px] sm:min-h-[600px] md:min-h-[680px] lg:min-h-0"
  }
];

export const DASHBOARD_HERO_IMAGE = {
  src: "/picture1.png",
  alt: "SmartLearn dashboard hero"
};

export const DEFAULT_CHART_PALETTE: DashboardChartPalette = {
  focus: "#8b5cf6",
  review: "#38bdf8",
  axis: "rgba(71, 85, 105, 0.65)",
  grid: "rgba(148, 163, 184, 0.18)",
  radial: ["#8b5cf6", "#38bdf8", "#34d399", "#fbbf24", "#f472b6"]
};
