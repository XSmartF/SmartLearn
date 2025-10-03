import { DashboardHero } from "@/features/dashboard/components/hero/DashboardHero";
import { DashboardFlashcards } from "@/features/dashboard/components/flashcards/DashboardFlashcards";
import { DashboardProductivity } from "@/features/dashboard/components/productivity/DashboardProductivity";
import { DashboardEvents } from "@/features/dashboard/components/events/DashboardEvents";
import { DashboardSectionGrid } from "@/features/dashboard/components/layout/DashboardSectionGrid";
import { useDashboardView } from "@/features/dashboard/hooks/useDashboardView";
import { ROUTES } from "@/shared/constants/routes";

export default function DashboardPage() {
  const view = useDashboardView();

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col gap-4">
      <DashboardHero model={view.hero} />
      <DashboardSectionGrid
        layout={view.layout}
        sections={{
          flashcards: <DashboardFlashcards model={view.flashcards} />,
          productivity: <DashboardProductivity model={view.productivity} />,
          events: <DashboardEvents model={view.events} manageHref={ROUTES.CALENDAR} />
        }}
      />
    </div>
  );
}
