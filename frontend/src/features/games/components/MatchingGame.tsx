import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { H1 } from '@/shared/components/ui/typography';
import { ArrowLeft, RotateCcw, Target, Trophy, CheckCircle, XCircle, Loader2, HelpCircle, Shuffle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAllGameCards, type GameCard } from '../hooks/useGameCards';

interface MatchingCard {
  id: string;
  content: string;
  type: 'front' | 'back';
  originalCardId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MatchingGameState {
  gamePhase: 'waiting' | 'playing' | 'finished';
  cards: MatchingCard[];
  flippedCards: MatchingCard[];
  matchedPairs: number;
  totalPairs: number;
  attempts: number;
  correctMatches: number;
  totalTime: number;
  gameStarted: boolean;
  startTime: number | null;
  gameCards: GameCard[];
  usedCards: Set<string>;
}

interface MatchingGameProps {
  difficulty?: 'easy' | 'medium' | 'hard';
}

export default function MatchingGame({ difficulty = 'easy' }: MatchingGameProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { cards, loading: cardsLoading, error: cardsError } = useAllGameCards();
  const [gameState, setGameState] = useState<MatchingGameState | null>(null);

  // Get settings from route state or use defaults
  const routeSettings = location.state?.settings;
  const gameDifficulty = routeSettings?.difficulty || difficulty;
  const pairsCount = routeSettings?.questionCount || (gameDifficulty === 'easy' ? 6 : gameDifficulty === 'medium' ? 8 : 10);

  // Shuffle array function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Create matching cards from flashcards
  const createMatchingCards = useCallback((gameCards: GameCard[]): MatchingCard[] => {
    const selectedCards = gameCards.slice(0, pairsCount);
    const matchingCards: MatchingCard[] = [];

    selectedCards.forEach((card) => {
      // Add front card
      matchingCards.push({
        id: `front-${card.id}`,
        content: card.front,
        type: 'front',
        originalCardId: card.id,
        isFlipped: false,
        isMatched: false,
      });

      // Add back card
      matchingCards.push({
        id: `back-${card.id}`,
        content: card.back,
        type: 'back',
        originalCardId: card.id,
        isFlipped: false,
        isMatched: false,
      });
    });

    return shuffleArray(matchingCards);
  }, [pairsCount]);

  // Initialize game when cards are loaded
  useEffect(() => {
    if (cards.length > 0 && !gameState) {
      const gameCards = shuffleArray(cards).slice(0, pairsCount);
      const matchingCards = createMatchingCards(gameCards);

      const initialState: MatchingGameState = {
        gamePhase: 'waiting',
        cards: matchingCards,
        flippedCards: [],
        matchedPairs: 0,
        totalPairs: pairsCount,
        attempts: 0,
        correctMatches: 0,
        totalTime: 0,
        gameStarted: false,
        startTime: null,
        gameCards,
        usedCards: new Set(gameCards.map(card => card.id)),
      };
      setGameState(initialState);
    }
  }, [cards, pairsCount, gameState, createMatchingCards]);

  const startGame = (state: MatchingGameState): MatchingGameState => {
    return {
      ...state,
      gamePhase: 'playing',
      gameStarted: true,
      startTime: Date.now(),
    };
  };

  const flipCard = (state: MatchingGameState, cardId: string): MatchingGameState => {
    const card = state.cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || state.flippedCards.length >= 2) {
      return state;
    }

    const newFlippedCards = [...state.flippedCards, card];
    const newCards = state.cards.map(c =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    );

    let newState = {
      ...state,
      cards: newCards,
      flippedCards: newFlippedCards,
      attempts: state.attempts + 1,
    };

    // Check for match when 2 cards are flipped
    if (newFlippedCards.length === 2) {
      const [card1, card2] = newFlippedCards;
      const isMatch = card1.originalCardId === card2.originalCardId;

      if (isMatch) {
        // Match found
        newState = {
          ...newState,
          cards: newState.cards.map(c =>
            c.originalCardId === card1.originalCardId
              ? { ...c, isMatched: true }
              : c
          ),
          matchedPairs: state.matchedPairs + 1,
          correctMatches: state.correctMatches + 1,
          flippedCards: [],
        };

        // Check if game is finished
        if (newState.matchedPairs === state.totalPairs) {
          const endTime = Date.now();
          const totalTime = state.startTime ? endTime - state.startTime : 0;
          newState = {
            ...newState,
            gamePhase: 'finished',
            totalTime,
          };
        }
      } else {
        // No match - flip cards back after delay
        setTimeout(() => {
          setGameState(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              cards: prev.cards.map(c =>
                c.id === card1.id || c.id === card2.id
                  ? { ...c, isFlipped: false }
                  : c
              ),
              flippedCards: [],
            };
          });
        }, 1000);
      }
    }

    return newState;
  };

  const resetGame = (gameCards: GameCard[], difficulty: string): MatchingGameState => {
    const pairs = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 8 : 10;
    const selectedCards = gameCards.slice(0, pairs);
    const matchingCards = createMatchingCards(selectedCards);

    return {
      gamePhase: 'waiting',
      cards: matchingCards,
      flippedCards: [],
      matchedPairs: 0,
      totalPairs: pairs,
      attempts: 0,
      correctMatches: 0,
      totalTime: 0,
      gameStarted: false,
      startTime: null,
      gameCards: selectedCards,
      usedCards: new Set(selectedCards.map(card => card.id)),
    };
  };

  const handleStartGame = () => {
    if (!gameState) return;
    setGameState(prev => prev ? startGame(prev) : prev);
  };

  const handleCardClick = useCallback((cardId: string) => {
    if (!gameState) return;
    setGameState(prev => prev ? flipCard(prev, cardId) : prev);
  }, [gameState]);

  const handleReset = () => {
    if (!cards.length) return;
    setGameState(resetGame(cards, gameDifficulty));
  };

  const getGameStats = (state: MatchingGameState) => {
    const accuracy = state.attempts > 0 ? Math.round((state.correctMatches / state.attempts) * 100) : 0;
    const averageTime = state.totalTime > 0 ? Math.round(state.totalTime / state.attempts) : 0;

    return {
      accuracy,
      averageTime,
      totalAttempts: state.attempts,
      correctMatches: state.correctMatches,
      totalTime: state.totalTime,
    };
  };

  // Loading state
  if (cardsLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
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
      <div className="container mx-auto p-6 max-w-4xl">
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
  if (cards.length < pairsCount) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-semibold mb-2">Không đủ dữ liệu</h2>
            <p className="text-muted-foreground mb-4">
              Bạn cần tạo ít nhất {pairsCount} flashcards để chơi trò chơi này.
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
      <div className="container mx-auto p-6 max-w-4xl">
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
            <H1 className="mb-0">Kết quả trò chơi ghép đôi</H1>
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
                <div className="text-sm text-muted-foreground">Lần lật thẻ</div>
              </div>
              <div className="text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{stats.correctMatches}</div>
                <div className="text-sm text-muted-foreground">Cặp ghép đúng</div>
              </div>
              <div className="text-center">
                <Shuffle className="h-8 w-8 mx-auto mb-2 text-purple-500" />
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
    <div className="container mx-auto p-6 max-w-4xl">
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
          <H1 className="mb-0">Trò chơi ghép đôi</H1>
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
              Cặp đã ghép: {gameState.matchedPairs} / {gameState.totalPairs}
            </span>
            <span className="text-sm font-medium">
              Lần lật: {gameState.attempts}
            </span>
          </div>
          <Progress
            value={(gameState.matchedPairs / gameState.totalPairs) * 100}
            className="h-2"
          />
        </CardContent>
      </Card>

      {/* Game Area */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {gameState.gamePhase === 'waiting' && (
            <div className="text-center py-12">
              <Shuffle className="h-16 w-16 mx-auto mb-4 text-purple-500" />
              <h2 className="text-2xl font-bold mb-4">Trò chơi ghép đôi</h2>
              <p className="text-muted-foreground mb-6">
                Ghép đôi các thẻ để tìm các cặp flashcards khớp nhau!
              </p>
              <Button onClick={handleStartGame} size="lg">
                Bắt đầu học
              </Button>
            </div>
          )}

          {gameState.gamePhase === 'playing' && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold">Ghép đôi các thẻ</h2>
                <p className="text-muted-foreground">
                  Nhấp vào thẻ để lật và tìm cặp khớp nhau
                </p>
              </div>

              {/* Game Grid */}
              <div className={`grid gap-4 ${
                gameState.totalPairs <= 6 ? 'grid-cols-4' :
                gameState.totalPairs <= 8 ? 'grid-cols-4' : 'grid-cols-5'
              } max-w-4xl mx-auto`}>
                {gameState.cards.map((card) => (
                  <div
                    key={card.id}
                    className={`
                      aspect-square cursor-pointer transition-all duration-300 transform hover:scale-105
                      ${card.isMatched ? 'opacity-50' : ''}
                      ${card.isFlipped ? 'scale-105' : ''}
                    `}
                    onClick={() => handleCardClick(card.id)}
                  >
                    <Card className={`
                      h-full w-full transition-all duration-300
                      ${card.isFlipped || card.isMatched
                        ? 'bg-blue-50 border-blue-300 shadow-lg'
                        : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                      }
                    `}>
                      <CardContent className="p-4 h-full flex items-center justify-center">
                        {card.isFlipped || card.isMatched ? (
                          <div className="text-center">
                            <div className={`
                              text-sm font-medium leading-tight
                              ${card.type === 'front' ? 'text-blue-700' : 'text-green-700'}
                            `}>
                              {card.content}
                            </div>
                            <div className={`
                              text-xs mt-1 px-2 py-1 rounded-full inline-block
                              ${card.type === 'front'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-green-100 text-green-600'
                              }
                            `}>
                              {card.type === 'front' ? 'Câu hỏi' : 'Đáp án'}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400">
                            <Shuffle className="h-8 w-8 mx-auto" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Status */}
              <div className="text-center mt-6">
                <div className="text-sm text-muted-foreground">
                  {gameState.flippedCards.length === 1 && 'Lật thêm 1 thẻ nữa!'}
                  {gameState.flippedCards.length === 2 && 'Đang kiểm tra...'}
                </div>
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
            <li>• Nhấp vào thẻ để lật và xem nội dung</li>
            <li>• Tìm cặp thẻ có cùng ý nghĩa (câu hỏi và đáp án)</li>
            <li>• Ghép đúng tất cả các cặp để hoàn thành</li>
            <li>• Thẻ sẽ tự động lật lại nếu không khớp</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}