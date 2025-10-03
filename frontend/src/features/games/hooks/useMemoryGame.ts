import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GameCard } from './useGameCards';

export interface MemoryCard {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface MemoryGameState {
  cards: MemoryCard[];
  flippedCards: number[];
  matchedPairs: number;
  moves: number;
  gameWon: boolean;
  gameStarted: boolean;
  timeElapsed: number;
}

type Difficulty = 'easy' | 'medium' | 'hard';

type MemoryGameStatus = 'idle' | 'ready';

interface UseMemoryGameOptions {
  cards: GameCard[];
  difficulty?: Difficulty;
}

interface UseMemoryGameResult {
  status: MemoryGameStatus;
  gameState: MemoryGameState | null;
  difficultyLabel: string;
  gridClassName: string;
  formatTime: (seconds: number) => string;
  handleCardClick: (cardId: number) => void;
  handleReset: () => void;
}

export function useMemoryGame({ cards, difficulty = 'easy' }: UseMemoryGameOptions): UseMemoryGameResult {
  const [gameState, setGameState] = useState<MemoryGameState | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // initialize or reset when cards/difficulty change
  useEffect(() => {
    if (!cards.length) {
      setGameState(null);
      return;
    }
    setGameState(createMemoryGame(cards, difficulty));
  }, [cards, difficulty]);

  // timer ticking effect
  useEffect(() => {
    if (!gameState || gameState.gameWon) return;

    const interval = window.setInterval(() => {
      setGameState((prev) => {
        if (!prev || prev.gameWon || !prev.gameStarted) return prev;
        return updateTime(prev, prev.timeElapsed + 1);
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [gameState]);

  // ensure timeout cleared on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const handleCardClick = useCallback((cardId: number) => {
    setGameState((prev) => {
      if (!prev) return prev;

      // prevent flipping more than two cards at once
      if (prev.flippedCards.length === 2) return prev;

      const nextState = flipCard(prev, cardId);

      if (nextState.flippedCards.length === 2) {
        const [firstId, secondId] = nextState.flippedCards;
        const firstCard = nextState.cards.find((card) => card.id === firstId);
        const secondCard = nextState.cards.find((card) => card.id === secondId);

        const isMismatch = Boolean(
          firstCard && secondCard && firstCard.value !== secondCard.value,
        );

        if (isMismatch) {
          if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = window.setTimeout(() => {
            setGameState((current) => (current ? resetFlippedCards(current) : current));
          }, 1000);
        }
      }

      return nextState;
    });
  }, []);

  const handleReset = useCallback(() => {
    if (!cards.length) return;
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setGameState(resetGame(cards, difficulty));
  }, [cards, difficulty]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const difficultyLabel = useMemo(() => {
    switch (difficulty) {
      case 'medium':
        return 'Trung bình';
      case 'hard':
        return 'Khó';
      case 'easy':
      default:
        return 'Dễ';
    }
  }, [difficulty]);

  const gridClassName = useMemo(() => {
    if (!gameState) return 'grid-cols-4';
    const totalCards = gameState.cards.length;
    if (totalCards <= 12) return 'grid-cols-4';
    if (totalCards <= 16) return 'grid-cols-4';
    return 'grid-cols-6';
  }, [gameState]);

  return {
    status: gameState ? 'ready' : 'idle',
    gameState,
    difficultyLabel,
    gridClassName,
    formatTime,
    handleCardClick,
    handleReset,
  };
}

const getFallbackCardValues = (count: number): string[] => {
  const fallbackValues = [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
    '🐨', '🐯', '🦁', '🐸', '🐵', '🐔', '🐧', '🐦',
  ];

  return fallbackValues.slice(0, Math.min(count, fallbackValues.length));
};

const generateMemoryCardValues = (cards: GameCard[], count = 12): string[] => {
  if (cards.length === 0) {
    return getFallbackCardValues(count);
  }

  const availableValues = cards.map((card) => card.front);
  const selectedValues = availableValues.slice(0, Math.min(count / 2, availableValues.length));

  if (selectedValues.length < count / 2) {
    const fallbackValues = getFallbackCardValues(count - selectedValues.length * 2);
    selectedValues.push(...fallbackValues);
  }

  return selectedValues;
};

const createMemoryGame = (cards: GameCard[], difficulty: Difficulty = 'easy'): MemoryGameState => {
  const pairs = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 8 : 12;
  const selectedValues = generateMemoryCardValues(cards, pairs * 2);
  const gameCards: MemoryCard[] = [...selectedValues, ...selectedValues]
    .sort(() => Math.random() - 0.5)
    .map((value, index) => ({
      id: index,
      value,
      isFlipped: false,
      isMatched: false,
    }));

  return {
    cards: gameCards,
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    gameWon: false,
    gameStarted: false,
    timeElapsed: 0,
  };
};

const flipCard = (state: MemoryGameState, cardId: number): MemoryGameState => {
  if (state.gameWon || state.flippedCards.length >= 2) return state;

  const card = state.cards.find((c) => c.id === cardId);
  if (!card || card.isFlipped || card.isMatched) return state;

  const newCards = state.cards.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c));
  const newFlippedCards = [...state.flippedCards, cardId];

  if (newFlippedCards.length === 2) {
    const [firstId, secondId] = newFlippedCards;
    const firstCard = newCards.find((c) => c.id === firstId);
    const secondCard = newCards.find((c) => c.id === secondId);

    if (firstCard && secondCard && firstCard.value === secondCard.value) {
      const matchedCards = newCards.map((c) =>
        c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c,
      );
      const newMatchedPairs = state.matchedPairs + 1;
      const gameWon = newMatchedPairs === matchedCards.length / 2;

      return {
        ...state,
        cards: matchedCards,
        flippedCards: [],
        matchedPairs: newMatchedPairs,
        moves: state.moves + 1,
        gameWon,
      };
    }
  }

  return {
    ...state,
    cards: newCards,
    flippedCards: newFlippedCards,
    moves: newFlippedCards.length === 1 ? state.moves : state.moves + 1,
    gameStarted: true,
  };
};

const resetFlippedCards = (state: MemoryGameState): MemoryGameState => {
  if (state.flippedCards.length !== 2) return state;

  const newCards = state.cards.map((c) =>
    state.flippedCards.includes(c.id) && !c.isMatched ? { ...c, isFlipped: false } : c,
  );

  return {
    ...state,
    cards: newCards,
    flippedCards: [],
  };
};

const resetGame = (cards: GameCard[], difficulty: Difficulty = 'easy'): MemoryGameState =>
  createMemoryGame(cards, difficulty);

const updateTime = (state: MemoryGameState, time: number): MemoryGameState => ({
  ...state,
  timeElapsed: time,
});
