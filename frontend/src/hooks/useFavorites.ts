import { useEffect, useState, useCallback } from 'react';
import type { LibraryMeta } from '@/lib/models';
import { listenUserFavoriteLibraryIds, fetchLibrariesByIds, addFavorite, removeFavorite } from '@/lib/firebaseLibraryService';

export function useFavoriteLibraries() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<LibraryMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    try {
      unsub = listenUserFavoriteLibraryIds(async ids => {
        setFavoriteIds(ids);
        try {
          const libs = await fetchLibrariesByIds(ids);
          setFavorites(libs);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Load favorites failed');
        } finally {
          setLoading(false);
        }
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Listen favorites failed');
      setLoading(false);
    }
    return () => { if (unsub) unsub(); };
  }, []);

  const toggleFavorite = useCallback(async (libraryId: string, isFav: boolean) => {
    try {
      setUpdating(true);
      if (isFav) await removeFavorite(libraryId); else await addFavorite(libraryId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Toggle favorite failed');
    } finally {
      setUpdating(false);
    }
  }, []);

  return { favoriteIds, favorites, loading, error, updating, toggleFavorite };
}
