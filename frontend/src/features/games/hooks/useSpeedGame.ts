import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import type { GameCard } from './useGameCards';

type Difficulty = 'easy' | 'medium' | 'hard';

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

type SpeedGamePhase = SpeedGameState['gamePhase'];

type SpeedGameStatus = 'idle' | 'ready';

export interface SpeedGameSettings {
  difficulty?: Difficulty;
  timeLimit?: number;
  questionCount?: number;
}

interface UseSpeedGameOptions {
  cards: GameCard[];
  defaultDifficulty?: Difficulty;
  settings?: SpeedGameSettings;
}

interface UseSpeedGameResult {
  status: SpeedGameStatus;
  gameState: SpeedGameState | null;
  inputValue: string;
  timeLeft: number | null;
  gameDifficulty: Difficulty;
  difficultySettings: ReturnType<typeof getDifficultySettings>;
  difficultyBadgeClass: string;
  progressValue: number;
  stats: ReturnType<typeof getGameStats> | null;
  activeTimeLimit: number;
  maxAttemptsTarget: number;
  handleStartGame: () => void;
  handleSubmitAnswer: (answer: string) => void;
  handleShowAnswer: () => void;
  handleNextCard: () => void;
  handleReset: () => void;
  handleInputChange: (value: string) => void;
  handleAnswerKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

export function useSpeedGame({
  cards,
  defaultDifficulty = 'easy',
  settings,
}: UseSpeedGameOptions): UseSpeedGameResult {
  const gameDifficulty: Difficulty = settings?.difficulty ?? defaultDifficulty;
  const difficultySettings = useMemo(() => getDifficultySettings(gameDifficulty), [gameDifficulty]);
  const overrideMaxAttempts = settings?.questionCount;
  const activeTimeLimit = settings?.timeLimit ?? difficultySettings.timeLimit;

  const [gameState, setGameState] = useState<SpeedGameState | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // initialize game when cards/difficulty change
  useEffect(() => {
    if (!cards.length) {
      setGameState(null);
      setInputValue('');
      setTimeLeft(null);
      return;
    }

    const baseState = createSpeedGame(cards, gameDifficulty);
    const patchedState = overrideMaxAttempts
      ? { ...baseState, maxAttempts: overrideMaxAttempts }
      : baseState;

    setGameState(patchedState);
    setInputValue('');
    setTimeLeft(null);
  }, [cards, gameDifficulty, overrideMaxAttempts]);

  // countdown timer when answering
  useEffect(() => {
    if (gameState?.gamePhase !== 'answering') {
      if (timeLeft !== null) setTimeLeft(null);
      return;
    }

    if (timeLeft === null) {
      setTimeLeft(activeTimeLimit);
      return;
    }

    if (timeLeft <= 0) {
      setGameState((prev) => (prev ? submitAnswer(prev, '') : prev));
      setInputValue('');
      setTimeLeft(null);
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((prev) => (prev !== null ? Math.max(prev - 100, 0) : prev));
    }, 100);

    return () => {
      window.clearTimeout(timer);
    };
  }, [gameState?.gamePhase, timeLeft, activeTimeLimit]);

  // automatically transition from showing to answering
  useEffect(() => {
    if (gameState?.gamePhase !== 'showing') return;

    const timer = window.setTimeout(() => {
      setGameState((prev) => (prev ? startAnswering(prev) : prev));
      setTimeLeft(activeTimeLimit);
      setInputValue('');
    }, 2000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [gameState?.gamePhase, activeTimeLimit]);

  const handleStartGame = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;
      const started = startGame(prev);
      return overrideMaxAttempts ? { ...started, maxAttempts: overrideMaxAttempts } : started;
    });
    setInputValue('');
    setTimeLeft(null);
  }, [overrideMaxAttempts]);

  const handleSubmitAnswer = useCallback((answer: string) => {
    setGameState((prev) => (prev ? submitAnswer(prev, answer) : prev));
    setInputValue('');
    setTimeLeft(null);
  }, []);

  const handleShowAnswer = useCallback(() => {
    setGameState((prev) => (prev ? showAnswer(prev) : prev));
  }, []);

  const handleNextCard = useCallback(() => {
    setGameState((prev) => (prev ? nextCard(prev) : prev));
    setInputValue('');
    setTimeLeft(null);
  }, []);

  const handleReset = useCallback(() => {
    if (!cards.length) return;
    const baseState = resetGame(cards, gameDifficulty);
    const patchedState = overrideMaxAttempts
      ? { ...baseState, maxAttempts: overrideMaxAttempts }
      : baseState;
    setGameState(patchedState);
    setInputValue('');
    setTimeLeft(null);
  }, [cards, gameDifficulty, overrideMaxAttempts]);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleAnswerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && gameState?.gamePhase === 'answering') {
        event.preventDefault();
        handleSubmitAnswer(inputValue);
      }
    },
    [gameState?.gamePhase, handleSubmitAnswer, inputValue],
  );

  const difficultyBadgeClass = useMemo(() => {
    switch (gameDifficulty) {
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      case 'easy':
      default:
        return 'bg-green-100 text-green-800';
    }
  }, [gameDifficulty]);

  const stats = useMemo(() => (gameState ? getGameStats(gameState) : null), [gameState]);

  const maxAttemptsTarget = useMemo(() => {
    if (overrideMaxAttempts) return overrideMaxAttempts;
    if (gameState) return gameState.maxAttempts;
    return difficultySettings.maxAttempts;
  }, [overrideMaxAttempts, gameState, difficultySettings.maxAttempts]);

  const progressValue = useMemo(() => {
    if (!gameState || maxAttemptsTarget === 0) return 0;
    return (gameState.currentAttempt / maxAttemptsTarget) * 100;
  }, [gameState, maxAttemptsTarget]);

  const status: SpeedGameStatus = useMemo(() => {
    const readyPhases: SpeedGamePhase[] = ['waiting', 'answering', 'showing', 'result', 'finished'];
    return gameState && readyPhases.includes(gameState.gamePhase) ? 'ready' : 'idle';
  }, [gameState]);

  return {
    status,
    gameState,
    inputValue,
    timeLeft,
    gameDifficulty,
    difficultySettings,
    difficultyBadgeClass,
    progressValue,
    stats,
    activeTimeLimit,
    maxAttemptsTarget,
    handleStartGame,
    handleSubmitAnswer,
    handleShowAnswer,
    handleNextCard,
    handleReset,
    handleInputChange,
    handleAnswerKeyDown,
  };
}

export const formatReactionTime = (time: number | null): string => {
  if (time === null) return '--';
  return `${time}ms`;
};

const createSpeedGame = (cards: GameCard[], difficulty: Difficulty = 'easy'): SpeedGameState => {
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

const startGame = (state: SpeedGameState): SpeedGameState => {
  if (state.cards.length === 0) return state;

  const next = getNextCard(state);
  if (!next) return { ...state, gamePhase: 'finished' };

  return {
    ...state,
    gamePhase: 'showing',
    currentCard: next,
    gameStarted: true,
    currentAttempt: 1,
    startTime: Date.now(),
  };
};

const getNextCard = (state: SpeedGameState): GameCard | null => {
  const available = state.cards.filter((card) => !state.usedCards.has(card.id));

  if (available.length === 0) {
    return state.cards[Math.floor(Math.random() * state.cards.length)] ?? null;
  }

  return available[Math.floor(Math.random() * available.length)] ?? null;
};

const startAnswering = (state: SpeedGameState): SpeedGameState => {
  if (state.gamePhase !== 'showing') return state;

  return {
    ...state,
    gamePhase: 'answering',
    startTime: Date.now(),
  };
};

const submitAnswer = (state: SpeedGameState, answer: string): SpeedGameState => {
  if (state.gamePhase !== 'answering' || !state.currentCard) return state;

  const answerTime = Date.now();
  const reactionTime = state.startTime ? answerTime - state.startTime : 0;
  const isCorrect = normalizeAnswer(answer) === normalizeAnswer(state.currentCard.back);

  const usedCards = new Set(state.usedCards);
  usedCards.add(state.currentCard.id);

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
    usedCards,
    showAnswer: false,
  };
};

const showAnswer = (state: SpeedGameState): SpeedGameState => ({
  ...state,
  showAnswer: true,
});

const nextCard = (state: SpeedGameState): SpeedGameState => {
  if (state.currentAttempt >= state.maxAttempts) {
    return {
      ...state,
      gamePhase: 'finished',
    };
  }

  const next = getNextCard(state);
  if (!next) {
    return {
      ...state,
      gamePhase: 'finished',
    };
  }

  return {
    ...state,
    gamePhase: 'showing',
    currentCard: next,
    userAnswer: '',
    startTime: null,
    answerTime: null,
    reactionTime: null,
    isCorrect: null,
    currentAttempt: state.currentAttempt + 1,
    showAnswer: false,
  };
};

const resetGame = (cards: GameCard[], difficulty: Difficulty = 'easy'): SpeedGameState =>
  createSpeedGame(cards, difficulty);

const getGameStats = (state: SpeedGameState) => {
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

const normalizeAnswer = (answer: string): string => answer.toLowerCase().trim().replace(/\s+/g, ' ');

const getDifficultySettings = (difficulty: Difficulty) => {
  switch (difficulty) {
    case 'easy':
      return {
        maxAttempts: 10,
        timeLimit: 10000,
        name: 'Dễ',
        description: '10 flashcards, 10 giây mỗi câu',
      };
    case 'medium':
      return {
        maxAttempts: 15,
        timeLimit: 8000,
        name: 'Trung bình',
        description: '15 flashcards, 8 giây mỗi câu',
      };
    case 'hard':
      return {
        maxAttempts: 20,
        timeLimit: 5000,
        name: 'Khó',
        description: '20 flashcards, 5 giây mỗi câu',
      };
    default:
      return {
        maxAttempts: 10,
        timeLimit: 10000,
        name: 'Dễ',
        description: '10 flashcards, 10 giây mỗi câu',
      };
  }
};
