import type { GameCard } from '../hooks/useGameCards';

export interface SpeedGameState {
  gamePhase: 'waiting' | 'showing' | 'answering' | 'result' | 'finished';
  currentCard: GameCard | null;
  userAnswer: string;
  startTime: number | null;
  answerTime: number | null;
  reactionTime: number | null;
  isCorrect: boolean | null;
  attempts: number;
  maxAttempts: number;
  correctAnswers: number;
  totalTime: number;
  gameStarted: boolean;
  currentAttempt: number;
  cards: GameCard[];
  usedCards: Set<string>;
  showAnswer: boolean;
}

export const createSpeedGame = (cards: GameCard[], difficulty: 'easy' | 'medium' | 'hard' = 'easy'): SpeedGameState => {
  const maxAttempts = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20;

  return {
    gamePhase: 'waiting',
    currentCard: null,
    userAnswer: '',
    startTime: null,
    answerTime: null,
    reactionTime: null,
    isCorrect: null,
    attempts: 0,
    maxAttempts,
    correctAnswers: 0,
    totalTime: 0,
    gameStarted: false,
    currentAttempt: 0,
    cards: [...cards],
    usedCards: new Set(),
    showAnswer: false,
  };
};

export const startGame = (state: SpeedGameState): SpeedGameState => {
  if (state.cards.length === 0) return state;

  const nextCard = getNextCard(state);
  if (!nextCard) return { ...state, gamePhase: 'finished' };

  return {
    ...state,
    gamePhase: 'showing',
    currentCard: nextCard,
    gameStarted: true,
    currentAttempt: 1,
    startTime: Date.now(),
  };
};

const getNextCard = (state: SpeedGameState): GameCard | null => {
  const availableCards = state.cards.filter(card => !state.usedCards.has(card.id));

  if (availableCards.length === 0) {
    // Reset used cards if we've gone through all cards
    return state.cards[Math.floor(Math.random() * state.cards.length)];
  }

  return availableCards[Math.floor(Math.random() * availableCards.length)];
};

export const startAnswering = (state: SpeedGameState): SpeedGameState => {
  if (state.gamePhase !== 'showing') return state;

  return {
    ...state,
    gamePhase: 'answering',
    startTime: Date.now(),
  };
};

export const submitAnswer = (state: SpeedGameState, answer: string): SpeedGameState => {
  if (state.gamePhase !== 'answering' || !state.currentCard) return state;

  const answerTime = Date.now();
  const reactionTime = state.startTime ? answerTime - state.startTime : 0;
  const isCorrect = normalizeAnswer(answer) === normalizeAnswer(state.currentCard.back);

  const newUsedCards = new Set(state.usedCards);
  newUsedCards.add(state.currentCard.id);

  return {
    ...state,
    gamePhase: 'result',
    userAnswer: answer,
    answerTime,
    reactionTime,
    isCorrect,
    attempts: state.attempts + 1,
    correctAnswers: isCorrect ? state.correctAnswers + 1 : state.correctAnswers,
    totalTime: state.totalTime + reactionTime,
    usedCards: newUsedCards,
    showAnswer: false,
  };
};

export const showAnswer = (state: SpeedGameState): SpeedGameState => {
  return {
    ...state,
    showAnswer: true,
  };
};

export const nextCard = (state: SpeedGameState): SpeedGameState => {
  if (state.currentAttempt >= state.maxAttempts) {
    return {
      ...state,
      gamePhase: 'finished',
    };
  }

  const nextCard = getNextCard(state);
  if (!nextCard) {
    return {
      ...state,
      gamePhase: 'finished',
    };
  }

  return {
    ...state,
    gamePhase: 'showing',
    currentCard: nextCard,
    userAnswer: '',
    startTime: null,
    answerTime: null,
    reactionTime: null,
    isCorrect: null,
    currentAttempt: state.currentAttempt + 1,
    showAnswer: false,
  };
};

export const resetGame = (cards: GameCard[], difficulty: 'easy' | 'medium' | 'hard' = 'easy'): SpeedGameState => {
  return createSpeedGame(cards, difficulty);
};

export const getGameStats = (state: SpeedGameState) => {
  const accuracy = state.attempts > 0 ? Math.round((state.correctAnswers / state.attempts) * 100) : 0;
  const averageTime = state.attempts > 0 ? Math.round(state.totalTime / state.attempts) : 0;

  return {
    totalAttempts: state.attempts,
    correctAnswers: state.correctAnswers,
    accuracy,
    averageTime,
    totalTime: state.totalTime,
    completionRate: Math.round((state.currentAttempt / state.maxAttempts) * 100),
  };
};

const normalizeAnswer = (answer: string): string => {
  return answer.toLowerCase().trim().replace(/\s+/g, ' ');
};

export const formatReactionTime = (time: number | null): string => {
  if (time === null) return '--';
  return `${time}ms`;
};

export const getDifficultySettings = (difficulty: 'easy' | 'medium' | 'hard') => {
  switch (difficulty) {
    case 'easy':
      return {
        maxAttempts: 10,
        timeLimit: 10000, // 10 seconds
        name: 'Dễ',
        description: '10 flashcards, 10 giây mỗi câu'
      };
    case 'medium':
      return {
        maxAttempts: 15,
        timeLimit: 8000, // 8 seconds
        name: 'Trung bình',
        description: '15 flashcards, 8 giây mỗi câu'
      };
    case 'hard':
      return {
        maxAttempts: 20,
        timeLimit: 5000, // 5 seconds
        name: 'Khó',
        description: '20 flashcards, 5 giây mỗi câu'
      };
    default:
      return {
        maxAttempts: 10,
        timeLimit: 10000,
        name: 'Dễ',
        description: '10 flashcards, 10 giây mỗi câu'
      };
  }
};