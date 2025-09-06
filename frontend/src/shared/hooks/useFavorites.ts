import { useGetFavoritesQuery, useAddFavoriteMutation, useRemoveFavoriteMutation, useGetUserLibrariesQuery, useGetSharedLibrariesQuery } from '@/shared/store/api';
import type { QueryResult } from '@/shared/types/query';
import type { LibraryMeta } from '@/shared/lib/models';
import { useCallback } from 'react';

export function useFavoriteLibraries(): QueryResult<LibraryMeta[]> & { favoriteIds: string[]; favorites: LibraryMeta[]; updating: boolean; toggleFavorite: (libraryId: string, isFav: boolean) => Promise<void>; } {
  const { data: favoriteIds = [], isLoading: loadingFav, error: favError } = useGetFavoritesQuery();
  const { data: owned = [], isLoading: loadingOwned, error: ownedError } = useGetUserLibrariesQuery();
  const { data: shared = [], isLoading: loadingShared, error: sharedError } = useGetSharedLibrariesQuery();
  const [addFavorite, { isLoading: adding, error: addError }] = useAddFavoriteMutation();
  const [removeFavorite, { isLoading: removing, error: removeError }] = useRemoveFavoriteMutation();

  const all = [...owned, ...shared.filter(s=> !owned.find(o=> o.id===s.id))];
  const set = new Set(favoriteIds);
  const favorites = all.filter(l=> set.has(l.id));

  const toggleFavorite = useCallback(async (libraryId: string, isFav: boolean) => {
    if (isFav) await removeFavorite(libraryId); else await addFavorite(libraryId);
  }, [addFavorite, removeFavorite]);

  const error = addError || removeError || favError || ownedError || sharedError || null;
  return { data: favorites, favoriteIds, favorites, loading: loadingFav || loadingOwned || loadingShared, updating: adding || removing, error: error as unknown, toggleFavorite };
}
