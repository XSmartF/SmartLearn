import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { H1 } from '@/shared/components/ui/typography';
import { ArrowLeft, RotateCcw, Target, Trophy, CheckCircle, XCircle, Lightbulb, Loader2, HelpCircle, Check, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAllGameCards, type GameCard } from '../hooks/useGameCards';

interface TrueFalseGameState {
  gamePhase: 'waiting' | 'playing' | 'result' | 'finished';
  currentCard: GameCard | null;
  currentQuestion: {
    statement: string;
    isTrue: boolean;
  } | null;
  userAnswer: boolean | null;
  isCorrect: boolean | null;
  attempts: number;
  maxAttempts: number;
  correctAnswers: number;
  totalTime: number;
  gameStarted: boolean;
  currentAttempt: number;
  cards: GameCard[];
  usedCards: Set<string>;
  startTime: number | null;
  reactionTime: number | null;
}

interface TrueFalseGameProps {
  difficulty?: 'easy' | 'medium' | 'hard';
}

export default function TrueFalseGame({ difficulty = 'easy' }: TrueFalseGameProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { cards, loading: cardsLoading, error: cardsError } = useAllGameCards();
  const [gameState, setGameState] = useState<TrueFalseGameState | null>(null);

  // Get settings from route state or use defaults
  const routeSettings = location.state?.settings;
  const gameDifficulty = routeSettings?.difficulty || difficulty;
  const maxAttempts = routeSettings?.questionCount || (gameDifficulty === 'easy' ? 10 : gameDifficulty === 'medium' ? 15 : 20);

  // Generate true/false questions
  const generateQuestion = (card: GameCard): { statement: string; isTrue: boolean } => {
    const isTrueStatement = Math.random() > 0.5;

    if (isTrueStatement) {
      // True statement
      return {
        statement: `${card.front} - ${card.back}`,
        isTrue: true
      };
    } else {
      // False statement - swap the answer with another random card
      const otherCards = cards.filter(c => c.id !== card.id);
      if (otherCards.length > 0) {
        const randomCard = otherCards[Math.floor(Math.random() * otherCards.length)];
        return {
          statement: `${card.front} - ${randomCard.back}`,
          isTrue: false
        };
      } else {
        // Fallback to true statement if no other cards
        return {
          statement: `${card.front} - ${card.back}`,
          isTrue: true
        };
      }
    }
  };

  // Initialize game when cards are loaded
  useEffect(() => {
    if (cards.length > 0 && !gameState) {
      const initialState: TrueFalseGameState = {
        gamePhase: 'waiting',
        currentCard: null,
        currentQuestion: null,
        userAnswer: null,
        isCorrect: null,
        attempts: 0,
        maxAttempts,
        correctAnswers: 0,
        totalTime: 0,
        gameStarted: false,
        currentAttempt: 0,
        cards: [...cards],
        usedCards: new Set(),
        startTime: null,
        reactionTime: null,
      };
      setGameState(initialState);
    }
  }, [cards, maxAttempts, gameState]);

  const getNextCard = (state: TrueFalseGameState) => {
    const availableCards = state.cards.filter(card => !state.usedCards.has(card.id));
    if (availableCards.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const selectedCard = availableCards[randomIndex];
    const question = generateQuestion(selectedCard);

    return {
      card: selectedCard,
      question
    };
  };

  const startGame = (state: TrueFalseGameState): TrueFalseGameState => {
    const nextData = getNextCard(state);
    if (!nextData) return { ...state, gamePhase: 'finished' };

    return {
      ...state,
      gamePhase: 'playing',
      currentCard: nextData.card,
      currentQuestion: nextData.question,
      gameStarted: true,
      currentAttempt: state.currentAttempt + 1,
      usedCards: new Set([...state.usedCards, nextData.card.id]),
      startTime: Date.now(),
      userAnswer: null,
      isCorrect: null,
    };
  };

  const submitAnswer = (state: TrueFalseGameState, answer: boolean): TrueFalseGameState => {
    const isCorrect = answer === state.currentQuestion?.isTrue;
    const reactionTime = state.startTime ? Date.now() - state.startTime : 0;

    return {
      ...state,
      gamePhase: 'result',
      userAnswer: answer,
      isCorrect,
      attempts: state.attempts + 1,
      correctAnswers: isCorrect ? state.correctAnswers + 1 : state.correctAnswers,
      totalTime: state.totalTime + reactionTime,
      reactionTime,
    };
  };

  const nextCard = (state: TrueFalseGameState): TrueFalseGameState => {
    if (state.currentAttempt >= state.maxAttempts) {
      return { ...state, gamePhase: 'finished' };
    }

    const nextData = getNextCard(state);
    if (!nextData) return { ...state, gamePhase: 'finished' };

    return {
      ...state,
      gamePhase: 'playing',
      currentCard: nextData.card,
      currentQuestion: nextData.question,
      currentAttempt: state.currentAttempt + 1,
      usedCards: new Set([...state.usedCards, nextData.card.id]),
      startTime: Date.now(),
      userAnswer: null,
      isCorrect: null,
    };
  };

  const resetGame = (cards: GameCard[], difficulty: string): TrueFalseGameState => {
    const maxAttempts = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20;
    return {
      gamePhase: 'waiting',
      currentCard: null,
      currentQuestion: null,
      userAnswer: null,
      isCorrect: null,
      attempts: 0,
      maxAttempts,
      correctAnswers: 0,
      totalTime: 0,
      gameStarted: false,
      currentAttempt: 0,
      cards: [...cards],
      usedCards: new Set(),
      startTime: null,
      reactionTime: null,
    };
  };

  const handleStartGame = () => {
    if (!gameState) return;
    setGameState(prev => prev ? startGame(prev) : prev);
  };

  const handleAnswer = useCallback((answer: boolean) => {
    if (!gameState) return;
    setGameState(prev => prev ? submitAnswer(prev, answer) : prev);
  }, [gameState]);

  const handleNextCard = () => {
    if (!gameState) return;
    setGameState(prev => prev ? nextCard(prev) : prev);
  };

  const handleReset = () => {
    if (!cards.length) return;
    setGameState(resetGame(cards, gameDifficulty));
  };

  const getGameStats = (state: TrueFalseGameState) => {
    const accuracy = state.attempts > 0 ? Math.round((state.correctAnswers / state.attempts) * 100) : 0;
    const averageTime = state.attempts > 0 ? Math.round(state.totalTime / state.attempts) : 0;

    return {
      accuracy,
      averageTime,
      totalAttempts: state.attempts,
      correctAnswers: state.correctAnswers,
      totalTime: state.totalTime,
    };
  };

  // Loading state
  if (cardsLoading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (cardsError) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Không thể tải dữ liệu</h2>
            <p className="text-muted-foreground mb-4">{cardsError}</p>
            <Button onClick={() => navigate('/games')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No cards available
  if (cards.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-semibold mb-2">Không có dữ liệu</h2>
            <p className="text-muted-foreground mb-4">
              Bạn cần tạo ít nhất một thư viện flashcards để chơi trò chơi này.
            </p>
            <Button onClick={() => navigate('/my-library')}>
              Tạo thư viện
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameState) return null;

  const stats = getGameStats(gameState);

  const getDifficultyColor = () => {
    switch (gameDifficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (gameState.gamePhase === 'finished') {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/games')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            <H1 className="mb-0">Kết quả trò chơi đúng/sai</H1>
          </div>
          <Badge className={getDifficultyColor()}>
            {gameDifficulty === 'easy' ? 'Dễ' : gameDifficulty === 'medium' ? 'Trung bình' : 'Khó'}
          </Badge>
        </div>

        {/* Results */}
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-3xl font-bold mb-2">Hoàn thành!</h2>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {stats.accuracy}%
                </div>
                <div className="text-sm text-muted-foreground">Độ chính xác</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {Math.round(stats.averageTime / 1000)}s
                </div>
                <div className="text-sm text-muted-foreground">Thời gian trung bình</div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{stats.totalAttempts}</div>
                <div className="text-sm text-muted-foreground">Câu trả lời</div>
              </div>
              <div className="text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{stats.correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Đúng</div>
              </div>
              <div className="text-center">
                <Check className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{Math.round(stats.totalTime / 1000)}s</div>
                <div className="text-sm text-muted-foreground">Tổng thời gian</div>
              </div>
            </div>

            <Button onClick={handleReset} size="lg">
              <RotateCcw className="mr-2 h-4 w-4" />
              Chơi lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/games')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <H1 className="mb-0">Trò chơi đúng/sai</H1>
        </div>
        <Badge className={getDifficultyColor()}>
          {gameDifficulty === 'easy' ? 'Dễ' : gameDifficulty === 'medium' ? 'Trung bình' : 'Khó'}
        </Badge>
      </div>

      {/* Progress */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Câu hỏi {gameState.currentAttempt} / {gameState.maxAttempts}
            </span>
            <span className="text-sm font-medium">
              Đúng: {gameState.correctAnswers}
            </span>
          </div>
          <Progress
            value={(gameState.currentAttempt / gameState.maxAttempts) * 100}
            className="h-2"
          />
        </CardContent>
      </Card>

      {/* Game Area */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {gameState.gamePhase === 'waiting' && (
            <div className="text-center py-12">
              <Check className="h-16 w-16 mx-auto mb-4 text-emerald-500" />
              <h2 className="text-2xl font-bold mb-4">Trò chơi đúng/sai</h2>
              <p className="text-muted-foreground mb-6">
                Xác định xem câu phát biểu có đúng hay không!
              </p>
              <Button onClick={handleStartGame} size="lg">
                Bắt đầu học
              </Button>
            </div>
          )}

          {gameState.gamePhase === 'playing' && gameState.currentQuestion && (
            <div className="text-center py-8">
              <h2 className="text-xl font-bold mb-6">Câu phát biểu này có đúng không?</h2>

              <div className="text-lg bg-gray-50 p-6 rounded-lg mb-8 border-2 border-gray-200">
                {gameState.currentQuestion.statement}
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => handleAnswer(true)}
                  size="lg"
                  className="px-8 py-4 bg-green-500 hover:bg-green-600"
                >
                  <Check className="mr-2 h-5 w-5" />
                  Đúng
                </Button>
                <Button
                  onClick={() => handleAnswer(false)}
                  size="lg"
                  variant="destructive"
                  className="px-8 py-4"
                >
                  <X className="mr-2 h-5 w-5" />
                  Sai
                </Button>
              </div>
            </div>
          )}

          {gameState.gamePhase === 'result' && gameState.currentQuestion && gameState.currentCard && (
            <div className="text-center py-8">
              <div className={`text-6xl mb-4 ${gameState.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                {gameState.isCorrect ? '✅' : '❌'}
              </div>

              <h2 className="text-2xl font-bold mb-4">
                {gameState.isCorrect ? 'Đúng rồi!' : 'Chưa chính xác'}
              </h2>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="text-sm text-muted-foreground mb-2">Câu phát biểu:</div>
                <div className="font-medium">{gameState.currentQuestion.statement}</div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="text-sm text-muted-foreground mb-2">Đáp án đúng:</div>
                <div className="font-medium text-blue-800">
                  {gameState.currentQuestion.isTrue ? 'Đúng' : 'Sai'}
                </div>
              </div>

              {!gameState.isCorrect && (
                <div className="bg-red-50 p-4 rounded-lg mb-4">
                  <div className="text-sm text-muted-foreground mb-2">Bạn trả lời:</div>
                  <div className="font-medium text-red-800">
                    {gameState.userAnswer ? 'Đúng' : 'Sai'}
                  </div>
                </div>
              )}

              <div className="text-lg font-medium mb-6">
                Thời gian: {Math.round((gameState.reactionTime || 0) / 1000)}s
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => gameState.currentQuestion && handleAnswer(gameState.currentQuestion.isTrue)}>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Gợi ý
                </Button>
                <Button onClick={handleNextCard}>
                  {gameState.currentAttempt >= gameState.maxAttempts ? 'Xem kết quả' : 'Câu tiếp theo'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">Hướng dẫn:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Đọc câu phát biểu cẩn thận</li>
            <li>• Nhấn "Đúng" hoặc "Sai" để trả lời</li>
            <li>• Sử dụng gợi ý để xem đáp án đúng</li>
            <li>• Trả lời nhanh và chính xác nhất có thể</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}