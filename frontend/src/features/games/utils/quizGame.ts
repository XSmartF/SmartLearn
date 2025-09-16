import type { GameCard } from '../hooks/useGameCards';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizGameState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  score: number;
  timeLeft: number;
  gameStarted: boolean;
  gameFinished: boolean;
  answers: (number | null)[];
  showResult: boolean;
}

// Generate quiz questions from flashcards
export function generateQuizQuestions(cards: GameCard[], count: number = 5): QuizQuestion[] {
  if (cards.length < 4) {
    // Fallback to basic questions if not enough cards
    return getFallbackQuestions();
  }

  const questions: QuizQuestion[] = [];
  const usedCards = new Set<string>();

  for (let i = 0; i < Math.min(count, cards.length); i++) {
    // Get unused cards
    const availableCards = cards.filter(card => !usedCards.has(card.id));

    if (availableCards.length < 4) break;

    // Select a random card for the question
    const questionCard = availableCards[Math.floor(Math.random() * availableCards.length)];
    usedCards.add(questionCard.id);

    // Get 3 wrong answers from other cards
    const wrongCards = availableCards
      .filter(card => card.id !== questionCard.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = [
      questionCard.back, // Correct answer
      ...wrongCards.map(card => card.back)
    ].sort(() => Math.random() - 0.5); // Shuffle options

    const correctAnswer = options.indexOf(questionCard.back);

    questions.push({
      id: i + 1,
      question: questionCard.front,
      options,
      correctAnswer,
      category: questionCard.domain || 'Kiến thức chung',
      difficulty: questionCard.difficulty || 'medium'
    });
  }

  return questions.length > 0 ? questions : getFallbackQuestions();
}

// Fallback questions when not enough flashcards
function getFallbackQuestions(): QuizQuestion[] {
  return [
    {
      id: 1,
      question: "Thủ đô của Việt Nam là gì?",
      options: ["Hà Nội", "Sài Gòn", "Đà Nẵng", "Huế"],
      correctAnswer: 0,
      category: "Địa lý",
      difficulty: 'easy'
    },
    {
      id: 2,
      question: "2 + 2 = ?",
      options: ["3", "4", "5", "6"],
      correctAnswer: 1,
      category: "Toán học",
      difficulty: 'easy'
    },
    {
      id: 3,
      question: "Màu của lá cây là gì?",
      options: ["Đỏ", "Xanh", "Vàng", "Tím"],
      correctAnswer: 1,
      category: "Khoa học",
      difficulty: 'easy'
    }
  ];
}

export const createQuizGame = (cards: GameCard[], difficulty: 'easy' | 'medium' | 'hard' = 'easy'): QuizGameState => {
  const filteredCards = cards.filter(card =>
    !card.difficulty || card.difficulty === difficulty
  );

  const questions = generateQuizQuestions(filteredCards, 5);

  return {
    questions,
    currentQuestionIndex: 0,
    selectedAnswer: null,
    score: 0,
    timeLeft: 30, // 30 seconds per question
    gameStarted: false,
    gameFinished: false,
    answers: new Array(questions.length).fill(null),
    showResult: false,
  };
};

export const selectAnswer = (state: QuizGameState, answerIndex: number): QuizGameState => {
  if (state.showResult) return state;

  return {
    ...state,
    selectedAnswer: answerIndex,
    showResult: true,
  };
};

export const nextQuestion = (state: QuizGameState): QuizGameState => {
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
    timeLeft: 30,
    gameFinished: isFinished,
    answers: newAnswers,
    showResult: false,
    gameStarted: true,
  };
};

export const updateTime = (state: QuizGameState): QuizGameState => {
  if (state.showResult || state.gameFinished) return state;

  const newTimeLeft = state.timeLeft - 1;

  if (newTimeLeft <= 0) {
    // Time's up - auto submit current answer or null
    const newAnswers = [...state.answers];
    newAnswers[state.currentQuestionIndex] = state.selectedAnswer;

    const nextIndex = state.currentQuestionIndex + 1;
    const isFinished = nextIndex >= state.questions.length;

    return {
      ...state,
      currentQuestionIndex: nextIndex,
      selectedAnswer: null,
      timeLeft: 30,
      gameFinished: isFinished,
      answers: newAnswers,
      showResult: false,
      gameStarted: true,
    };
  }

  return {
    ...state,
    timeLeft: newTimeLeft,
  };
};

export const resetGame = (cards: GameCard[], difficulty: 'easy' | 'medium' | 'hard' = 'easy'): QuizGameState => {
  return createQuizGame(cards, difficulty);
};

export const getCurrentQuestion = (state: QuizGameState): QuizQuestion | null => {
  if (state.currentQuestionIndex >= state.questions.length) return null;
  return state.questions[state.currentQuestionIndex];
};

export const getGameStats = (state: QuizGameState) => {
  const totalQuestions = state.questions.length;
  const correctAnswers = state.answers.filter((answer, index) => {
    if (answer === null) return false;
    return answer === state.questions[index].correctAnswer;
  }).length;

  const incorrectAnswers = state.answers.filter((answer, index) => {
    if (answer === null) return false;
    return answer !== state.questions[index].correctAnswer;
  }).length;

  const unanswered = state.answers.filter(answer => answer === null).length;

  return {
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    unanswered,
    percentage: Math.round((correctAnswers / totalQuestions) * 100),
  };
};