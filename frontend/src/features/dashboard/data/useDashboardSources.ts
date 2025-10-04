import { useMemo } from "react";
import { useTheme } from "next-themes";

import { useAuth } from "@/shared/hooks/useAuthRedux";
import { useUserLibraries } from "@/shared/hooks/useLibraries";
import { useFavoriteLibraries } from "@/shared/hooks/useFavorites";
import { useGetSharedLibrariesQuery } from "@/shared/store/api";
import { useDashboardPalette } from "../hooks/useDashboardPalette";
import { useDashboardStudyEvents } from "../hooks/useDashboardStudyEvents";
import { useOwnerProfiles } from "../hooks/useOwnerProfiles";
import { useProgressSummaries } from "../hooks/useProgressSummaries";
import type { DashboardChartPalette } from "../types";
import type { LibraryMeta } from "@/shared/lib/models";
import type { ProgressSummaryLite } from "@/shared/lib/firebase";
import type { StudyEvent } from "@/features/study/types/calendar";
import type { DashboardOwnerProfile } from "../hooks/useOwnerProfiles";

const mapLibraries = (owned: LibraryMeta[], shared: LibraryMeta[]) => {
  const map = new Map<string, LibraryMeta>();
  owned.forEach((lib) => map.set(lib.id, lib));
  shared.forEach((lib) => {
    if (!map.has(lib.id)) {
      map.set(lib.id, lib);
    }
  });
  return Array.from(map.values());
};

export interface DashboardSources {
  user: ReturnType<typeof useAuth>["user"];
  isDarkMode: boolean;
  palette: DashboardChartPalette;
  libsLoading: boolean;
  ownedLibraries: LibraryMeta[];
  sharedLibraries: LibraryMeta[];
  allLibraries: LibraryMeta[];
  favorites: LibraryMeta[];
  favoriteIds: string[];
  summaries: Record<string, ProgressSummaryLite>;
  ownerProfiles: Record<string, DashboardOwnerProfile>;
  studyEvents: StudyEvent[];
}

export function useDashboardSources(): DashboardSources {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  const { libraries: ownedLibraries, loading: libsLoading } = useUserLibraries();
  const { favorites, favoriteIds } = useFavoriteLibraries();
  const { data: sharedLibraries = [] } = useGetSharedLibrariesQuery();

  const palette = useDashboardPalette(isDarkMode);

  const allLibraries = useMemo(
    () => mapLibraries(ownedLibraries, sharedLibraries),
    [ownedLibraries, sharedLibraries]
  );

  const ownerProfiles = useOwnerProfiles(allLibraries);
  const summaries = useProgressSummaries(allLibraries);
  const studyEvents = useDashboardStudyEvents();

  return useMemo(
    () => ({
      user,
      isDarkMode,
      palette,
      libsLoading,
      ownedLibraries,
      sharedLibraries,
      allLibraries,
      favorites,
      favoriteIds,
      summaries,
      ownerProfiles,
      studyEvents,
    }),
    [
      allLibraries,
      favoriteIds,
      favorites,
      isDarkMode,
      libsLoading,
      ownerProfiles,
      palette,
      sharedLibraries,
      studyEvents,
      summaries,
      ownedLibraries,
      user,
    ]
  );
}
