import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { H1 } from '@/shared/components/ui/typography';
import { ArrowLeft, RotateCcw, Clock, Target, Trophy, XCircle, HelpCircle } from 'lucide-react';
import { Loader } from '@/shared/components/ui/loader';
import { useNavigate } from 'react-router-dom';
import { useAllGameCards } from '../hooks/useGameCards';
import { useMemoryGame, type MemoryCard } from '../hooks/useMemoryGame';

interface MemoryGameProps {
  difficulty?: 'easy' | 'medium' | 'hard';
}

export default function MemoryGame({ difficulty = 'easy' }: MemoryGameProps) {
  const navigate = useNavigate();
  const { cards, loading: cardsLoading, error: cardsError } = useAllGameCards();
  const {
    gameState,
    difficultyLabel,
    gridClassName,
    formatTime,
    handleCardClick,
    handleReset,
  } = useMemoryGame({ cards, difficulty });

  // Loading state
  if (cardsLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader size="lg" label="Đang tải dữ liệu" />
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
  if (cards.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
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
          <H1 className="mb-0">Trò chơi ghi nhớ</H1>
        </div>
        <Badge variant="secondary">{difficultyLabel}</Badge>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{formatTime(gameState.timeElapsed)}</div>
            <div className="text-sm text-muted-foreground">Thời gian</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{gameState.moves}</div>
            <div className="text-sm text-muted-foreground">Nước đi</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{gameState.matchedPairs}</div>
            <div className="text-sm text-muted-foreground">Cặp ghép</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{gameState.cards.length / 2 - gameState.matchedPairs}</div>
            <div className="text-sm text-muted-foreground">Còn lại</div>
          </CardContent>
        </Card>
      </div>

      {/* Game Board */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className={`grid ${gridClassName} gap-3 max-w-2xl mx-auto`}>
            {gameState.cards.map((card: MemoryCard) => (
              <Button
                key={card.id}
                variant="ghost"
                size="icon"
                onClick={() => handleCardClick(card.id)}
                disabled={card.isMatched || gameState.flippedCards.includes(card.id)}
                className={`
                  aspect-square h-auto w-full rounded-xl border-2 transition-all duration-300
                  ${card.isFlipped || card.isMatched
                    ? 'bg-white border-blue-300 shadow-md scale-105'
                    : 'bg-blue-100 border-blue-200 hover:border-blue-300 hover:bg-blue-50'
                  }
                  ${card.isMatched ? 'ring-2 ring-green-400' : ''}
                  disabled:cursor-not-allowed disabled:opacity-70
                `}
              >
                <div className="flex h-full w-full items-center justify-center">
                  {card.isFlipped || card.isMatched ? (
                    <span className="text-3xl">{card.value}</span>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-200"></div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Controls */}
      <div className="flex justify-center gap-4">
        <Button onClick={handleReset} variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" />
          Chơi lại
        </Button>
      </div>

      {/* Win Message */}
      {gameState.gameWon && (
        <Card className="mt-6 bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Chúc mừng!</h2>
            <p className="text-green-700 mb-4">
              Bạn đã hoàn thành trò chơi trong {formatTime(gameState.timeElapsed)} với {gameState.moves} nước đi!
            </p>
            <Button onClick={handleReset} className="bg-green-600 hover:bg-green-700">
              Chơi lại
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}