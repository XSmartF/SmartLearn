import type { ChartConfig } from "@/shared/components/ui/chart";
import type { LibraryMeta } from "@/shared/lib/models";
import type { StudyEvent } from "@/features/study/types/calendar";

export interface DashboardHeroModel {
  title: string;
  subtitle: string;
  accentImage: {
    src: string;
    alt: string;
  };
}

export interface DashboardFlashcardItemModel {
  id: string;
  title: string;
  progressPercent: number;
  totalCards: number;
  masteredCards: number;
  accuracyPercent?: number;
  sessions?: number;
  ownerName?: string;
  isOwned: boolean;
  continueHref: string;
}

export interface DashboardFlashcardSectionModel {
  title: string;
  description: string;
  items: DashboardFlashcardItemModel[];
  isLoading: boolean;
  emptyState: {
    title: string;
    description: string;
    actionHref: string;
    actionLabel: string;
  };
}

export interface DashboardChartPalette {
  focus: string;
  review: string;
  axis: string;
  grid: string;
  radial: string[];
}

export interface DashboardProductivityPoint {
  date: string;
  label: string;
  focusMinutes: number;
  reviewSessions: number;
}

export interface DashboardProductivitySectionModel {
  title: string;
  description: string;
  palette: DashboardChartPalette;
  config: ChartConfig;
  data: DashboardProductivityPoint[];
}

export interface DashboardEventItemModel {
  id: string;
  title: string;
  scheduledAt: Date;
  relativeTime: string;
  location?: string;
  type?: StudyEvent["type"];
  typeLabel?: string;
}

export interface DashboardEventSectionModel {
  title: string;
  description: string;
  items: DashboardEventItemModel[];
  emptyState: {
    title: string;
    description: string;
  };
}

export interface DashboardSectionLayout {
  id: "flashcards" | "productivity" | "events";
  className: string;
  minHeightClassName: string;
}

export interface DashboardLibrariesContext {
  owned: LibraryMeta[];
  shared: LibraryMeta[];
  all: LibraryMeta[];
}

export interface DashboardViewModel {
  hero: DashboardHeroModel;
  flashcards: DashboardFlashcardSectionModel;
  productivity: DashboardProductivitySectionModel;
  events: DashboardEventSectionModel;
  layout: DashboardSectionLayout[];
}
