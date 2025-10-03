import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUserLibraries } from '@/shared/hooks/useLibraries';
import { cardRepository } from '@/shared/lib/repositories/CardRepository';

export interface GameCard {
  id: string;
  front: string;
  back: string;
  domain?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface GameCardSourceState {
  cards: GameCard[];
  loading: boolean;
  error: string | null;
}

type GameCardScope = 'auto' | 'library' | 'all';

interface GameCardSourceOptions {
  scope?: GameCardScope;
  libraryId?: string;
  dedupe?: boolean;
}

interface GameCardSourceResult extends GameCardSourceState {
  refetch: () => void;
  scope: Exclude<GameCardScope, 'library'> | GameCardScope;
  effectiveLibraryId?: string;
}

const CARD_DEDUPE_SEPARATOR = '||';

const dedupeCards = (cards: GameCard[]): GameCard[] => {
  if (cards.length < 2) return cards;
  const seen = new Set<string>();
  const unique: GameCard[] = [];

  cards.forEach((card) => {
    const key = `${card.front.toLowerCase()}${CARD_DEDUPE_SEPARATOR}${card.back.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    unique.push(card);
  });

  return unique;
};

export function useGameCardSource(options: GameCardSourceOptions = {}): GameCardSourceResult {
  const { scope = 'auto', libraryId, dedupe = true } = options;
  const { libraries } = useUserLibraries();
  const [state, setState] = useState<GameCardSourceState>({ cards: [], loading: true, error: null });
  const [refreshToken, setRefreshToken] = useState(0);

  const effectiveScope: GameCardScope = libraryId ? 'library' : scope;

  const effectiveLibraryId = useMemo(() => {
    if (effectiveScope === 'all') return undefined;
    if (libraryId) return libraryId;
    return libraries[0]?.id;
  }, [effectiveScope, libraryId, libraries]);

  useEffect(() => {
    let cancelled = false;

    if (effectiveScope !== 'all' && !effectiveLibraryId) {
      setState({ cards: [], loading: false, error: null });
      return () => {
        cancelled = true;
      };
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const fetchCards = async () => {
      try {
        let fetched: GameCard[] = [];

        if (effectiveScope === 'all') {
          if (!libraries.length) {
            fetched = [];
          } else {
            const chunks = await Promise.all(
              libraries.map((lib) => cardRepository.listCardsPreferCache(lib.id)),
            );
            fetched = chunks.flat();
          }
        } else if (effectiveLibraryId) {
          fetched = await cardRepository.listCardsPreferCache(effectiveLibraryId);
        }

        const cards = dedupe ? dedupeCards(fetched) : fetched;

        if (!cancelled) {
          setState({ cards, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            cards: [],
            loading: false,
            error: error instanceof Error ? error.message : 'Không thể tải danh sách thẻ',
          });
        }
      }
    };

    fetchCards();

    return () => {
      cancelled = true;
    };
  }, [effectiveScope, effectiveLibraryId, libraries, refreshToken, dedupe]);

  const refetch = useCallback(() => {
    setRefreshToken((token) => token + 1);
  }, []);

  return useMemo(() => ({
    ...state,
    refetch,
    scope: effectiveScope,
    effectiveLibraryId,
  }), [state, refetch, effectiveScope, effectiveLibraryId]);
}

export function useGameCards(libraryId?: string) {
  const { cards, loading, error } = useGameCardSource({ libraryId });
  return { cards, loading, error };
}

export function useAllGameCards() {
  const { cards, loading, error } = useGameCardSource({ scope: 'all' });
  return { cards, loading, error };
}