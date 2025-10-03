import type { ReactNode } from "react";
import type { DashboardSectionLayout } from "@/features/dashboard/types";

interface DashboardSectionGridProps {
  layout: DashboardSectionLayout[];
  sections: Record<DashboardSectionLayout["id"], ReactNode>;
}

export function DashboardSectionGrid({ layout, sections }: DashboardSectionGridProps) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-4">
      {layout.map((section) => (
        <div key={section.id} className={`${section.className} ${section.minHeightClassName}`}>
          {sections[section.id]}
        </div>
      ))}
    </div>
  );
}
