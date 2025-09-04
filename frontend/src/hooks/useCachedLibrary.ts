import { useEffect, useState } from 'react';
import type { LibraryMeta, Card as EngineCard } from '@/lib/models';
import { cardRepository } from '@/lib/repositories/CardRepository';
import { onCacheInvalidated } from '@/lib/cache';

interface State { meta: LibraryMeta | null; cards: EngineCard[]; loading: boolean; error: string | null }

export function useCachedLibrary(libraryId: string | undefined) {
  const [state, setState] = useState<State>({ meta: null, cards: [], loading: !!libraryId, error: null });

  useEffect(() => {
    if (!libraryId) return;
    let active = true;
    setState(s => ({ ...s, loading: true }));
    (async () => {
      const { libraryRepository } = await import('@/lib/repositories/LibraryRepository');
      const [meta, cards] = await Promise.all([
        libraryRepository.getLibraryMeta(libraryId),
        cardRepository.listCardsPreferCache(libraryId)
      ]);
      if (active) setState({ meta, cards, loading: false, error: null });
    })().catch(e => { if (active) setState(s => ({ ...s, loading: false, error: e instanceof Error ? e.message : 'Load failed' })); });
    const off = onCacheInvalidated(prefix => {
      if (prefix && (prefix.startsWith(`library:${libraryId}`) || prefix.startsWith(`cards:${libraryId}`))) {
        (async () => {
          const { libraryRepository } = await import('@/lib/repositories/LibraryRepository');
          const [meta, cards] = await Promise.all([
            libraryRepository.getLibraryMeta(libraryId),
            cardRepository.listCardsPreferCache(libraryId)
          ]);
          if (active) setState({ meta, cards, loading: false, error: null });
        })().catch(()=>{});
      }
    });
    return () => { active = false; off(); };
  }, [libraryId]);

  return state;
}
