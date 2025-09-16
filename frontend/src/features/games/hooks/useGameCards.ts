import { useState, useEffect } from 'react';
import { useUserLibraries } from '@/shared/hooks/useLibraries';
import { cardRepository } from '@/shared/lib/repositories/CardRepository';

export interface GameCard {
  id: string;
  front: string;
  back: string;
  domain?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export function useGameCards(libraryId?: string): {
  cards: GameCard[];
  loading: boolean;
  error: string | null;
} {
  const [cards, setCards] = useState<GameCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { libraries } = useUserLibraries();

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        setError(null);

        let targetLibraryId = libraryId;

        // If no specific library, get cards from user's first library
        if (!targetLibraryId && libraries.length > 0) {
          targetLibraryId = libraries[0].id;
        }

        if (!targetLibraryId) {
          setCards([]);
          return;
        }

        const fetchedCards = await cardRepository.listCardsPreferCache(targetLibraryId);
        setCards(fetchedCards);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cards');
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [libraryId, libraries]);

  return { cards, loading, error };
}

export function useAllGameCards(): {
  cards: GameCard[];
  loading: boolean;
  error: string | null;
} {
  const [cards, setCards] = useState<GameCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { libraries } = useUserLibraries();

  useEffect(() => {
    const fetchAllCards = async () => {
      if (libraries.length === 0) {
        setCards([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const allCardsPromises = libraries.map(lib =>
          cardRepository.listCardsPreferCache(lib.id)
        );

        const allCardsArrays = await Promise.all(allCardsPromises);
        const combinedCards = allCardsArrays.flat();

        // Remove duplicates based on front/back content
        const uniqueCards = combinedCards.filter((card, index, self) =>
          index === self.findIndex(c =>
            c.front === card.front && c.back === card.back
          )
        );

        setCards(uniqueCards);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cards');
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCards();
  }, [libraries]);

  return { cards, loading, error };
}