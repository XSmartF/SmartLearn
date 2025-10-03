import { useEffect, useState } from "react";
import { DEFAULT_CHART_PALETTE } from "@/features/dashboard/constants";
import type { DashboardChartPalette } from "@/features/dashboard/types";

const getComputedCssVar = (variable: string) => {
  if (typeof window === "undefined") return null;
  const style = getComputedStyle(document.documentElement);
  const value = style.getPropertyValue(variable);
  return value ? value.trim() : null;
};

export function useDashboardPalette(isDarkMode: boolean): DashboardChartPalette {
  const [palette, setPalette] = useState<DashboardChartPalette>(DEFAULT_CHART_PALETTE);

  useEffect(() => {
    const axisFallback = isDarkMode ? "rgba(226, 232, 240, 0.72)" : "rgba(71, 85, 105, 0.7)";
    const focus = getComputedCssVar("--chart-1") ?? (isDarkMode ? "#a78bfa" : "#7c3aed");
    const review = getComputedCssVar("--chart-2") ?? (isDarkMode ? "#38bdf8" : "#0ea5e9");
    const radial = [
      focus,
      review,
      getComputedCssVar("--chart-3") ?? (isDarkMode ? "#34d399" : "#22c55e"),
      getComputedCssVar("--chart-4") ?? (isDarkMode ? "#fbbf24" : "#f59e0b"),
      getComputedCssVar("--chart-5") ?? (isDarkMode ? "#f472b6" : "#ec4899")
    ];

    setPalette({
      focus,
      review,
      radial,
      axis: getComputedCssVar("--muted-foreground") ?? axisFallback,
      grid: isDarkMode ? "rgba(148, 163, 184, 0.26)" : "rgba(148, 163, 184, 0.18)"
    });
  }, [isDarkMode]);

  return palette;
}
