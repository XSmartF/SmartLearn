import { useGetUserLibrariesQuery, useGetSharedLibrariesQuery } from '@/shared/store/api';
import type { QueryResult } from '@/shared/types/query';
import type { LibraryMeta } from '@/shared/lib/models';

export function useUserLibraries(): QueryResult<LibraryMeta[]> & { libraries: LibraryMeta[] } {
  const { data: owned = [], isLoading, error } = useGetUserLibrariesQuery();
  return { data: owned, libraries: owned, loading: isLoading, error: (error as unknown) ?? null };
}

export function useAllLibraries(): QueryResult<LibraryMeta[]> & { libraries: LibraryMeta[] } {
  const { data: owned = [], isLoading: loadingOwned, error: ownedError } = useGetUserLibrariesQuery();
  const { data: shared = [], isLoading: loadingShared, error: sharedError } = useGetSharedLibrariesQuery();
  // Deduplicate by id
  const map = new Map<string, typeof owned[number]>();
  owned.forEach(l=> map.set(l.id, l));
  shared.forEach(l=> { if(!map.has(l.id)) map.set(l.id,l); });
  const all = Array.from(map.values());
  return { data: all, libraries: all, loading: loadingOwned || loadingShared, error: (ownedError as unknown) || (sharedError as unknown) || null };
}
