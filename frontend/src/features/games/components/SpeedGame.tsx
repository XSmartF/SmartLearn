import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Input } from '@/shared/components/ui/input';
import { H1 } from '@/shared/components/ui/typography';
import { ArrowLeft, RotateCcw, Clock, Target, Zap, Trophy, CheckCircle, XCircle, Eye, HelpCircle } from 'lucide-react';
import { Loader } from '@/shared/components/ui/loader';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAllGameCards } from '../hooks/useGameCards';
import { useSpeedGame, formatReactionTime, type SpeedGameSettings } from '../hooks/useSpeedGame';

interface SpeedGameProps {
  difficulty?: 'easy' | 'medium' | 'hard';
}

export default function SpeedGame({ difficulty = 'easy' }: SpeedGameProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { cards, loading: cardsLoading, error: cardsError } = useAllGameCards();
  const routeSettings = location.state?.settings as SpeedGameSettings | undefined;
  const {
    gameState,
    inputValue,
    timeLeft,
    difficultySettings,
    difficultyBadgeClass,
    progressValue,
    stats,
    maxAttemptsTarget,
    handleStartGame,
    handleSubmitAnswer,
    handleShowAnswer,
    handleNextCard,
    handleReset,
    handleInputChange,
    handleAnswerKeyDown,
  } = useSpeedGame({ cards, defaultDifficulty: difficulty, settings: routeSettings });

  // Loading state
  if (cardsLoading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader size="lg" label="Đang tải dữ liệu" />
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
            <H1 className="mb-0">Kết quả trò chơi tốc độ học tập</H1>
          </div>
          <Badge className={difficultyBadgeClass}>{difficultySettings.name}</Badge>
        </div>

        {/* Results */}
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-3xl font-bold mb-2">Hoàn thành!</h2>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {stats?.accuracy ?? 0}%
                </div>
                <div className="text-sm text-muted-foreground">Độ chính xác</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {formatReactionTime(stats?.averageTime ?? 0)}
                </div>
                <div className="text-sm text-muted-foreground">Thời gian trung bình</div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{stats?.totalAttempts ?? 0}</div>
                <div className="text-sm text-muted-foreground">Câu trả lời</div>
              </div>
              <div className="text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{stats?.correctAnswers ?? 0}</div>
                <div className="text-sm text-muted-foreground">Đúng</div>
              </div>
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{formatReactionTime(stats?.totalTime ?? 0)}</div>
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
          <H1 className="mb-0">Trò chơi tốc độ học tập</H1>
        </div>
          <Badge className={difficultyBadgeClass}>{difficultySettings.name}</Badge>
      </div>

      {/* Progress */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
                Câu hỏi {gameState.currentAttempt} / {maxAttemptsTarget}
            </span>
            <span className="text-sm font-medium">
              Đúng: {gameState.correctAnswers}
            </span>
          </div>
            <Progress value={progressValue} className="h-2" />
        </CardContent>
      </Card>

      {/* Game Area */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {gameState.gamePhase === 'waiting' && (
            <div className="text-center py-12">
              <Zap className="h-16 w-16 mx-auto mb-4 text-blue-500" />
              <h2 className="text-2xl font-bold mb-4">Trò chơi tốc độ học tập</h2>
              <p className="text-muted-foreground mb-6">
                Nhìn vào câu hỏi và trả lời càng nhanh càng chính xác!
              </p>
              <Button onClick={handleStartGame} size="lg">
                Bắt đầu học
              </Button>
            </div>
          )}

          {gameState.gamePhase === 'showing' && gameState.currentCard && (
            <div className="text-center py-12">
              <div className="text-4xl mb-6">👁️</div>
              <h2 className="text-2xl font-bold mb-4">Nhìn kỹ câu hỏi:</h2>
              <div className="text-xl bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                {gameState.currentCard.front}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Chuẩn bị trả lời...
              </p>
            </div>
          )}

          {gameState.gamePhase === 'answering' && gameState.currentCard && (
            <div className="text-center py-8">
              <h2 className="text-xl font-bold mb-6">Trả lời nhanh:</h2>
              <div className="text-lg bg-gray-50 p-4 rounded-lg mb-6">
                {gameState.currentCard.front}
              </div>

              <div className="mb-6">
                <Input
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleAnswerKeyDown}
                  placeholder="Nhập đáp án của bạn..."
                  className="text-center text-lg py-3"
                  autoFocus
                />
              </div>

              {/* Timer */}
              <div className="mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-red-500" />
                  <span className="font-medium">Thời gian còn lại:</span>
                </div>
                <div className={`text-3xl font-bold ${timeLeft && timeLeft < 2000 ? 'text-red-600' : 'text-blue-600'}`}>
                  {(timeLeft || 0) / 1000}s
                </div>
                <Progress
                  value={timeLeft ? (timeLeft / (routeSettings?.timeLimit || difficultySettings.timeLimit)) * 100 : 0}
                  className="h-2 mt-2"
                />
              </div>

              <Button
                onClick={() => handleSubmitAnswer(inputValue)}
                size="lg"
                className="px-8"
              >
                Trả lời
              </Button>
            </div>
          )}

          {gameState.gamePhase === 'result' && gameState.currentCard && (
            <div className="text-center py-8">
              <div className={`text-6xl mb-4 ${gameState.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                {gameState.isCorrect ? '✅' : '❌'}
              </div>

              <h2 className="text-2xl font-bold mb-4">
                {gameState.isCorrect ? 'Đúng rồi!' : 'Chưa chính xác'}
              </h2>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="text-sm text-muted-foreground mb-2">Câu hỏi:</div>
                <div className="font-medium">{gameState.currentCard.front}</div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="text-sm text-muted-foreground mb-2">Đáp án đúng:</div>
                <div className="font-medium text-blue-800">{gameState.currentCard.back}</div>
              </div>

              {!gameState.isCorrect && (
                <div className="bg-red-50 p-4 rounded-lg mb-4">
                  <div className="text-sm text-muted-foreground mb-2">Bạn trả lời:</div>
                  <div className="font-medium text-red-800">{gameState.userAnswer || '(trống)'}</div>
                </div>
              )}

              <div className="text-lg font-medium mb-6">
                Thời gian: {formatReactionTime(gameState.reactionTime)}
              </div>

              <div className="flex gap-3 justify-center">
                {!gameState.showAnswer && (
                  <Button variant="outline" onClick={handleShowAnswer}>
                    <Eye className="mr-2 h-4 w-4" />
                    Xem đáp án
                  </Button>
                )}
                <Button onClick={handleNextCard}>
                  {gameState.currentAttempt >= maxAttemptsTarget ? 'Xem kết quả' : 'Câu tiếp theo'}
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
            <li>• Nhìn vào câu hỏi trong 2 giây</li>
            <li>• Trả lời nhanh và chính xác nhất có thể</li>
            <li>• Nhấn Enter hoặc nút "Trả lời" để submit</li>
            <li>• {difficultySettings.description}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}