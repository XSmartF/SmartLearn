import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DoraemonFeedback, DoraemonFeedbackKey } from '@/shared/constants/doraemon';
import { getDoraemonFeedback } from '@/shared/constants/doraemon';
import type { GameCard } from './useGameCards';

type Difficulty = 'easy' | 'medium' | 'hard';

type QuizGameStatus = 'idle' | 'ready';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: Difficulty;
}

export interface QuizGameState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  score: number;
  timeLeft: number;
  timePerQuestion: number;
  gameStarted: boolean;
  gameFinished: boolean;
  answers: (number | null)[];
  showResult: boolean;
  correctStreak: number;
  incorrectStreak: number;
  totalIncorrect: number;
  lastAnswerCorrect: boolean | null;
}

export interface QuizGameSettings {
  difficulty?: Difficulty;
  questionCount?: number;
  timeLimit?: number;
  showHints?: boolean;
}

interface UseQuizGameOptions {
  cards: GameCard[];
  defaultDifficulty?: Difficulty;
  settings?: QuizGameSettings;
}

interface UseQuizGameResult {
  status: QuizGameStatus;
  gameState: QuizGameState | null;
  currentQuestion: QuizQuestion | null;
  difficultyLabel: string;
  difficultyBadgeClass: string;
  progressValue: number;
  stats: ReturnType<typeof getGameStats> | null;
  showHints: boolean;
  feedback: DoraemonFeedback | null;
  handleAnswerSelect: (answerIndex: number) => void;
  handleNextQuestion: () => void;
  handleReset: () => void;
}

export function useQuizGame({
  cards,
  defaultDifficulty = 'easy',
  settings,
}: UseQuizGameOptions): UseQuizGameResult {
  const gameDifficulty: Difficulty = settings?.difficulty ?? defaultDifficulty;
  const questionCount = settings?.questionCount ?? 5;
  const timePerQuestion = settings?.timeLimit ?? 30;
  const showHints = settings?.showHints ?? false;

  const [gameState, setGameState] = useState<QuizGameState | null>(null);

  // Generate a fresh game whenever dependencies change
  useEffect(() => {
    if (!cards.length) {
      setGameState(null);
      return;
    }

    const nextState = createQuizGame(cards, gameDifficulty, questionCount, timePerQuestion);
    setGameState(nextState);
  }, [cards, gameDifficulty, questionCount, timePerQuestion]);

  // Countdown timer effect
  useEffect(() => {
    if (!gameState || gameState.gameFinished || gameState.showResult) return;

    const interval = window.setInterval(() => {
      setGameState((prev) => (prev ? updateTime(prev) : prev));
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [gameState]);

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    setGameState((prev) => (prev ? selectAnswer(prev, answerIndex) : prev));
  }, []);

  const handleNextQuestion = useCallback(() => {
    setGameState((prev) => (prev ? nextQuestion(prev) : prev));
  }, []);

  const handleReset = useCallback(() => {
    if (!cards.length) return;
    setGameState(createQuizGame(cards, gameDifficulty, questionCount, timePerQuestion));
  }, [cards, gameDifficulty, questionCount, timePerQuestion]);

  const currentQuestion = useMemo(() => (gameState ? getCurrentQuestion(gameState) : null), [gameState]);
  const stats = useMemo(() => (gameState ? getGameStats(gameState) : null), [gameState]);
  const feedback = useMemo(() => (gameState && gameState.showResult ? getFeedback(gameState) : null), [gameState]);

  const difficultyLabel = useMemo(() => getDifficultyLabel(gameDifficulty), [gameDifficulty]);
  const difficultyBadgeClass = useMemo(() => getDifficultyBadgeClass(gameDifficulty), [gameDifficulty]);

  const progressValue = useMemo(() => {
    if (!gameState || gameState.questions.length === 0) return 0;
    return (gameState.currentQuestionIndex / gameState.questions.length) * 100;
  }, [gameState]);

  const status: QuizGameStatus = useMemo(() => {
    if (!gameState) return 'idle';
    return 'ready';
  }, [gameState]);

  return {
    status,
    gameState,
    currentQuestion,
    difficultyLabel,
    difficultyBadgeClass,
    progressValue,
    stats,
    showHints,
    feedback,
    handleAnswerSelect,
    handleNextQuestion,
    handleReset,
  };
}

const createQuizGame = (
  cards: GameCard[],
  difficulty: Difficulty,
  questionCount: number,
  timePerQuestion: number,
): QuizGameState => {
  const filteredCards = cards.filter((card) => !card.difficulty || card.difficulty === difficulty);
  const questions = generateQuizQuestions(filteredCards, questionCount);

  return {
    questions,
    currentQuestionIndex: 0,
    selectedAnswer: null,
    score: 0,
    timeLeft: timePerQuestion,
    timePerQuestion,
    gameStarted: false,
    gameFinished: false,
    answers: new Array(questions.length).fill(null),
    showResult: false,
    correctStreak: 0,
    incorrectStreak: 0,
    totalIncorrect: 0,
    lastAnswerCorrect: null,
  };
};

const selectAnswer = (state: QuizGameState, answerIndex: number): QuizGameState => {
  if (state.showResult || state.gameFinished) return state;

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const isCorrect = answerIndex === currentQuestion.correctAnswer;

  return {
    ...state,
    selectedAnswer: answerIndex,
    showResult: true,
    correctStreak: isCorrect ? state.correctStreak + 1 : 0,
    incorrectStreak: isCorrect ? 0 : state.incorrectStreak + 1,
    totalIncorrect: isCorrect ? state.totalIncorrect : state.totalIncorrect + 1,
    lastAnswerCorrect: isCorrect,
  };
};

const nextQuestion = (state: QuizGameState): QuizGameState => {
  if (state.gameFinished) return state;

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const isCorrect = state.selectedAnswer === currentQuestion.correctAnswer;

  const newAnswers = [...state.answers];
  newAnswers[state.currentQuestionIndex] = state.selectedAnswer;

  const newScore = isCorrect ? state.score + 1 : state.score;
  const nextIndex = state.currentQuestionIndex + 1;
  const isFinished = nextIndex >= state.questions.length;

  return {
    ...state,
    currentQuestionIndex: nextIndex,
    selectedAnswer: null,
    score: newScore,
    timeLeft: state.timePerQuestion,
    gameFinished: isFinished,
    answers: newAnswers,
    showResult: false,
    gameStarted: true,
    lastAnswerCorrect: null,
  };
};

const updateTime = (state: QuizGameState): QuizGameState => {
  if (state.showResult || state.gameFinished) return state;

  const newTimeLeft = state.timeLeft - 1;

  if (newTimeLeft > 0) {
    return {
      ...state,
      timeLeft: newTimeLeft,
    };
  }

  const newAnswers = [...state.answers];
  newAnswers[state.currentQuestionIndex] = state.selectedAnswer;

  const nextIndex = state.currentQuestionIndex + 1;
  const isFinished = nextIndex >= state.questions.length;

  return {
    ...state,
    currentQuestionIndex: nextIndex,
    selectedAnswer: null,
    timeLeft: state.timePerQuestion,
    gameFinished: isFinished,
    answers: newAnswers,
    showResult: false,
    gameStarted: true,
    correctStreak: 0,
    incorrectStreak: state.incorrectStreak + 1,
    totalIncorrect: state.totalIncorrect + 1,
    lastAnswerCorrect: false,
  };
};

const generateQuizQuestions = (cards: GameCard[], count: number): QuizQuestion[] => {
  if (cards.length < 4) {
    return getFallbackQuestions();
  }

  const questions: QuizQuestion[] = [];
  const usedCards = new Set<string>();

  for (let i = 0; i < Math.min(count, cards.length); i++) {
    const availableCards = cards.filter((card) => !usedCards.has(card.id));
    if (availableCards.length < 4) break;

    const questionCard = availableCards[Math.floor(Math.random() * availableCards.length)];
    usedCards.add(questionCard.id);

    const wrongCards = availableCards
      .filter((card) => card.id !== questionCard.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = [questionCard.back, ...wrongCards.map((card) => card.back)].sort(() => Math.random() - 0.5);
    const correctAnswer = options.indexOf(questionCard.back);

    questions.push({
      id: i + 1,
      question: questionCard.front,
      options,
      correctAnswer,
      category: questionCard.domain || 'Kiến thức chung',
      difficulty: questionCard.difficulty || 'medium',
    });
  }

  return questions.length > 0 ? questions : getFallbackQuestions();
};

const getFallbackQuestions = (): QuizQuestion[] => [
  {
    id: 1,
    question: 'Thủ đô của Việt Nam là gì?',
    options: ['Hà Nội', 'Sài Gòn', 'Đà Nẵng', 'Huế'],
    correctAnswer: 0,
    category: 'Địa lý',
    difficulty: 'easy',
  },
  {
    id: 2,
    question: '2 + 2 = ?',
    options: ['3', '4', '5', '6'],
    correctAnswer: 1,
    category: 'Toán học',
    difficulty: 'easy',
  },
  {
    id: 3,
    question: 'Màu của lá cây là gì?',
    options: ['Đỏ', 'Xanh', 'Vàng', 'Tím'],
    correctAnswer: 1,
    category: 'Khoa học',
    difficulty: 'easy',
  },
];

const getCurrentQuestion = (state: QuizGameState): QuizQuestion | null => {
  if (state.currentQuestionIndex >= state.questions.length) return null;
  return state.questions[state.currentQuestionIndex];
};

const getGameStats = (state: QuizGameState) => {
  const totalQuestions = state.questions.length;
  if (totalQuestions === 0) {
    return {
      totalQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      unanswered: 0,
      percentage: 0,
    };
  }

  const correctAnswers = state.answers.filter((answer, index) => {
    if (answer === null) return false;
    return answer === state.questions[index].correctAnswer;
  }).length;

  const incorrectAnswers = state.answers.filter((answer, index) => {
    if (answer === null) return false;
    return answer !== state.questions[index].correctAnswer;
  }).length;

  const unanswered = state.answers.filter((answer) => answer === null).length;

  return {
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    unanswered,
    percentage: Math.round((correctAnswers / totalQuestions) * 100),
  };
};

const getDifficultyLabel = (difficulty: Difficulty): string => {
  switch (difficulty) {
    case 'medium':
      return 'Trung bình';
    case 'hard':
      return 'Khó';
    case 'easy':
    default:
      return 'Dễ';
  }
};

const getDifficultyBadgeClass = (difficulty: Difficulty): string => {
  switch (difficulty) {
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'hard':
      return 'bg-red-100 text-red-800';
    case 'easy':
    default:
      return 'bg-green-100 text-green-800';
  }
};

const getFeedback = (state: QuizGameState): DoraemonFeedback => {
  const feedbackKey = getFeedbackKey(state);
  return getDoraemonFeedback(feedbackKey);
};

const getFeedbackKey = (state: QuizGameState): DoraemonFeedbackKey => {
  if (state.lastAnswerCorrect) {
    if (state.correctStreak >= 5) return 'correctStreak5';
    if (state.correctStreak === 4) return 'correctStreak4';
    if (state.correctStreak === 3) return 'correctStreak3';
    return 'correct';
  }

  if (state.incorrectStreak >= 3) {
    return 'incorrectHeavy';
  }

  return 'incorrect';
};
