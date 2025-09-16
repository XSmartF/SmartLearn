import type { GameCard } from '../hooks/useGameCards';

export interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface MemoryGameState {
  cards: Card[];
  flippedCards: number[];
  matchedPairs: number;
  moves: number;
  gameWon: boolean;
  gameStarted: boolean;
  timeElapsed: number;
}

// Generate memory card values from flashcards
export function generateMemoryCardValues(cards: GameCard[], count: number = 12): string[] {
  if (cards.length === 0) {
    // Fallback to basic values if no cards
    return getFallbackCardValues(count);
  }

  // Use card fronts as values, limit to available cards
  const availableValues = cards.map(card => card.front);
  const selectedValues = availableValues.slice(0, Math.min(count / 2, availableValues.length));

  // If not enough cards, supplement with fallback
  if (selectedValues.length < count / 2) {
    const fallbackValues = getFallbackCardValues(count - selectedValues.length * 2);
    selectedValues.push(...fallbackValues);
  }

  return selectedValues;
}

// Fallback card values when not enough flashcards
function getFallbackCardValues(count: number): string[] {
  const fallbackValues = [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
    '🐨', '🐯', '🦁', '🐸', '🐵', '🐔', '🐧', '🐦'
  ];

  return fallbackValues.slice(0, Math.min(count, fallbackValues.length));
}

export const createMemoryGame = (cards: GameCard[], difficulty: 'easy' | 'medium' | 'hard' = 'easy'): MemoryGameState => {
  const pairs = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 8 : 12;
  const selectedValues = generateMemoryCardValues(cards, pairs * 2);
  const gameCards = [...selectedValues, ...selectedValues]
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

export const flipCard = (state: MemoryGameState, cardId: number): MemoryGameState => {
  if (state.gameWon || state.flippedCards.length >= 2) return state;

  const card = state.cards.find(c => c.id === cardId);
  if (!card || card.isFlipped || card.isMatched) return state;

  const newCards = state.cards.map(c =>
    c.id === cardId ? { ...c, isFlipped: true } : c
  );

  const newFlippedCards = [...state.flippedCards, cardId];

  if (newFlippedCards.length === 2) {
    const [firstId, secondId] = newFlippedCards;
    const firstCard = newCards.find(c => c.id === firstId);
    const secondCard = newCards.find(c => c.id === secondId);

    if (firstCard && secondCard && firstCard.value === secondCard.value) {
      // Match found
      const matchedCards = newCards.map(c =>
        c.id === firstId || c.id === secondId
          ? { ...c, isMatched: true }
          : c
      );

      const newMatchedPairs = state.matchedPairs + 1;
      const gameWon = newMatchedPairs === (newCards.length / 2);

      return {
        ...state,
        cards: matchedCards,
        flippedCards: [],
        matchedPairs: newMatchedPairs,
        moves: state.moves + 1,
        gameWon,
      };
    } else {
      // No match - flip back after delay
      setTimeout(() => {
        // This will be handled by the component
      }, 1000);
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

export const resetFlippedCards = (state: MemoryGameState): MemoryGameState => {
  if (state.flippedCards.length !== 2) return state;

  const newCards = state.cards.map(c =>
    state.flippedCards.includes(c.id) && !c.isMatched
      ? { ...c, isFlipped: false }
      : c
  );

  return {
    ...state,
    cards: newCards,
    flippedCards: [],
  };
};

export const resetGame = (cards: GameCard[], difficulty: 'easy' | 'medium' | 'hard' = 'easy'): MemoryGameState => {
  return createMemoryGame(cards, difficulty);
};

export const updateTime = (state: MemoryGameState, time: number): MemoryGameState => {
  return {
    ...state,
    timeElapsed: time,
  };
};