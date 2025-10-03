import { MAX_RECENT_FLASHCARDS } from "../constants";
import type { DashboardSources } from "../data/useDashboardSources";
import type { DashboardFlashcardItemModel, DashboardFlashcardSectionModel } from "../types";
import type { ProgressSummaryLite } from "@/shared/lib/firebase";
import { getStudyPath, ROUTES } from "@/shared/constants/routes";

const sortByLastAccessedDesc = (
  a: { lastAccessed: string | null },
  b: { lastAccessed: string | null }
) => (b.lastAccessed ?? "").localeCompare(a.lastAccessed ?? "");

const toFlashcardItem = (
  libraryId: string,
  libraryTitle: string,
  isOwned: boolean,
  ownerName: string | undefined,
  summary: ProgressSummaryLite | undefined,
  totalCardsFallback: number
): DashboardFlashcardItemModel => {
  const totalCards = summary?.total ?? totalCardsFallback;
  const masteredCards = summary?.mastered ?? 0;
  const accuracyPercent = typeof summary?.accuracyOverall === "number"
    ? Math.round(summary.accuracyOverall * 100)
    : undefined;

  return {
    id: libraryId,
    title: libraryTitle,
    progressPercent: summary ? Math.round(summary.percentMastered) : 0,
    totalCards,
    masteredCards,
    accuracyPercent,
    sessions: summary?.sessionCount,
    ownerName,
    isOwned,
    continueHref: getStudyPath(libraryId),
  } satisfies DashboardFlashcardItemModel;
};

export function buildDashboardFlashcardsSectionModel(
  sources: DashboardSources
): DashboardFlashcardSectionModel {
  const ownedIds = new Set(sources.ownedLibraries.map((lib) => lib.id));

  const recent = sources.allLibraries
    .map((library) => {
      const summary = sources.summaries[library.id];
      return {
        library,
        summary,
        lastAccessed: summary?.lastAccessed ?? null,
      };
    })
    .filter((entry) => Boolean(entry.lastAccessed));

  recent.sort(sortByLastAccessedDesc);

  const items = recent.slice(0, MAX_RECENT_FLASHCARDS).map(({ library, summary }) => {
    const ownerName = library.ownerId
      ? sources.ownerProfiles[library.ownerId]?.displayName
      : undefined;

    return toFlashcardItem(
      library.id,
      library.title,
      ownedIds.has(library.id),
      ownerName,
      summary,
      library.cardCount ?? 0
    );
  });

  return {
    title: "Bộ flashcard gần đây",
    description: "Tiếp tục từ nơi bạn đã dừng lại",
    items,
    isLoading: sources.libsLoading,
    emptyState: {
      title: "Chưa có bộ flashcard gần đây",
      description: "Hãy tạo hoặc mở một bộ flashcard để bắt đầu hành trình học tập.",
      actionHref: ROUTES.MY_LIBRARY,
      actionLabel: "Quản lý thư viện",
    },
  } satisfies DashboardFlashcardSectionModel;
}
