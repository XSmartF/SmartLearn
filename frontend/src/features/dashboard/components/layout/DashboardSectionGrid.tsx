import type { ReactNode } from "react";
import type { DashboardSectionLayout } from "@/features/dashboard/types";

interface DashboardSectionGridProps {
  layout: DashboardSectionLayout[];
  sections: Record<DashboardSectionLayout["id"], ReactNode>;
}

export function DashboardSectionGrid({ layout, sections }: DashboardSectionGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      {layout.map((section) => (
        <div key={section.id} className={`${section.className} ${section.minHeightClassName}`.trim()}>
          {sections[section.id]}
        </div>
      ))}
    </div>
  );
}
