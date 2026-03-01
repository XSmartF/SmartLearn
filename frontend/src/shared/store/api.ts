import { useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import type { LibraryMeta } from '@/shared/lib/models';
import {
  shareRepository, userRepository, libraryRepository,
  loadProgressSummary, listenProgressSummary,
} from '@/shared/services';
import type { ProgressSummaryLite } from '@/shared/services';

/**
 * Generic hook that wires a Firestore listener to TanStack Query cache.
 * The listener pushes data into the cache; the query reads from it.
 */
function useListenerQuery<T>(
  queryKey: readonly unknown[],
  subscribe: (setData: (data: T) => void) => (() => void) | undefined,
  fallback: T,
) {
  const qc = useQueryClient();

  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      unsub = subscribe(data => qc.setQueryData(queryKey, data));
    } catch (e) {
      console.error(`${String(queryKey[0])} listener failed`, e);
    }
    return () => unsub?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qc, ...queryKey]);

  return useQuery<T>({
    queryKey,
    queryFn: async () => qc.getQueryData(queryKey) ?? fallback,
    staleTime: Infinity,
    initialData: qc.getQueryData(queryKey) ?? fallback,
  });
}

export function useGetUserLibrariesQuery() {
  return useListenerQuery<LibraryMeta[]>(
    ['userLibraries'],
    setData => libraryRepository.listenUserLibraries(setData),
    [],
  );
}

export function useGetSharedLibrariesQuery() {
  const qc = useQueryClient();

  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      unsub = shareRepository.listenUserSharedLibraries(async entries => {
        try {
          const ids = entries.map(e => e.libraryId);
          const libs = ids.length ? await libraryRepository.fetchLibrariesByIds(ids) : [];
          qc.setQueryData(['sharedLibraries'], libs);
        } catch (e) {
          console.error('fetchLibrariesByIds failed', e);
        }
      });
    } catch (e) {
      console.error('listenUserSharedLibraries failed', e);
    }
    return () => unsub?.();
  }, [qc]);

  return useQuery<LibraryMeta[]>({
    queryKey: ['sharedLibraries'],
    queryFn: async () => qc.getQueryData(['sharedLibraries']) ?? [],
    staleTime: Infinity,
    initialData: qc.getQueryData(['sharedLibraries']) ?? [],
  });
}

export function useGetFavoritesQuery() {
  return useListenerQuery<string[]>(
    ['favorites'],
    setData => userRepository.listenUserFavoriteLibraryIds(setData),
    [],
  );
}

export function useProgressSummaryQuery(libraryId: string) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!libraryId) return;
    const off = listenProgressSummary(libraryId, s => {
      qc.setQueryData(['progressSummary', libraryId], s);
    });
    return () => off();
  }, [libraryId, qc]);

  return useQuery<ProgressSummaryLite | null>({
    queryKey: ['progressSummary', libraryId],
    queryFn: () => loadProgressSummary(libraryId),
    enabled: !!libraryId,
  });
}

export function useAddFavoriteMutation() {
  const qc = useQueryClient();
  const m = useMutation<void, unknown, string>({
    mutationFn: (libraryId: string) => userRepository.addFavorite(libraryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });
  return [m.mutateAsync.bind(m), { isLoading: m.isPending, error: m.error }] as const;
}

export function useRemoveFavoriteMutation() {
  const qc = useQueryClient();
  const m = useMutation<void, unknown, string>({
    mutationFn: (libraryId: string) => userRepository.removeFavorite(libraryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });
  return [m.mutateAsync.bind(m), { isLoading: m.isPending, error: m.error }] as const;
}

