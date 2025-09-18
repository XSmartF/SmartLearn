import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { H1 } from '@/shared/components/ui/typography';
import { ArrowLeft, RotateCcw, Clock, CheckCircle, XCircle, HelpCircle, Trophy } from 'lucide-react';
import { Loader } from '@/shared/components/ui/loader';
import { useNavigate } from 'react-router-dom';
import {
  createQuizGame,
  selectAnswer,
  nextQuestion,
  updateTime,
  resetGame,
  getCurrentQuestion,
  getGameStats,
  type QuizGameState
} from '../utils/quizGame';
import { useAllGameCards } from '../hooks/useGameCards';

interface QuizGameProps {
  difficulty?: 'easy' | 'medium' | 'hard';
}

export default function QuizGame({ difficulty = 'easy' }: QuizGameProps) {
  const navigate = useNavigate();
  const { cards, loading: cardsLoading, error: cardsError } = useAllGameCards();
  const [gameState, setGameState] = useState<QuizGameState | null>(null);

  // Initialize game when cards are loaded
  useEffect(() => {
    if (cards.length > 0 && !gameState) {
      setGameState(createQuizGame(cards, difficulty));
    }
  }, [cards, difficulty, gameState]);

  // Timer effect
  useEffect(() => {
    if (!gameState || gameState.gameFinished || gameState.showResult) return;

    const interval = setInterval(() => {
      setGameState(prev => prev ? updateTime(prev) : prev);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (!gameState) return;
    setGameState(prev => prev ? selectAnswer(prev, answerIndex) : prev);
  }, [gameState]);

  const handleNextQuestion = () => {
    if (!gameState) return;
    setGameState(prev => prev ? nextQuestion(prev) : prev);
  };

  const handleReset = () => {
    if (!cards.length) return;
    setGameState(resetGame(cards, difficulty));
  };

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

  const currentQuestion = getCurrentQuestion(gameState);
  const stats = getGameStats(gameState);

  const getDifficultyLabel = () => {
    switch (difficulty) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      default: return 'Dễ';
    }
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (gameState.gameFinished) {
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
            <H1 className="mb-0">Kết quả trò chơi</H1>
          </div>
          <Badge className={getDifficultyColor()}>{getDifficultyLabel()}</Badge>
        </div>

        {/* Results */}
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-3xl font-bold mb-2">Hoàn thành!</h2>
            <div className="text-6xl font-bold text-blue-600 mb-4">
              {stats.percentage}%
            </div>
            <p className="text-lg text-muted-foreground mb-6">
              Bạn trả lời đúng {stats.correctAnswers}/{stats.totalQuestions} câu hỏi
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold text-green-600">{stats.correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Đúng</div>
              </div>
              <div className="text-center">
                <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <div className="text-2xl font-bold text-red-600">{stats.incorrectAnswers}</div>
                <div className="text-sm text-muted-foreground">Sai</div>
              </div>
              <div className="text-center">
                <HelpCircle className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                <div className="text-2xl font-bold text-gray-600">{stats.unanswered}</div>
                <div className="text-sm text-muted-foreground">Bỏ qua</div>
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

  if (!currentQuestion) return null;

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
          <H1 className="mb-0">Đố vui kiến thức</H1>
        </div>
        <Badge className={getDifficultyColor()}>{getDifficultyLabel()}</Badge>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            Câu hỏi {gameState.currentQuestionIndex + 1} / {gameState.questions.length}
          </span>
          <span className="text-sm font-medium">
            Điểm: {gameState.score}
          </span>
        </div>
        <Progress
          value={(gameState.currentQuestionIndex / gameState.questions.length) * 100}
          className="h-2"
        />
      </div>

      {/* Timer */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Thời gian còn lại:</span>
            </div>
            <div className={`text-2xl font-bold ${gameState.timeLeft <= 10 ? 'text-red-600' : 'text-blue-600'}`}>
              {gameState.timeLeft}s
            </div>
          </div>
          <Progress
            value={(gameState.timeLeft / 30) * 100}
            className="h-2 mt-2"
          />
        </CardContent>
      </Card>

      {/* Question */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="mb-4">
            <Badge variant="outline" className="mb-2">
              {currentQuestion.category}
            </Badge>
          </div>
          <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              let buttonClass = "w-full text-left p-4 rounded-lg border transition-all ";

              if (gameState.showResult) {
                if (index === currentQuestion.correctAnswer) {
                  buttonClass += "bg-green-100 border-green-300 text-green-800";
                } else if (index === gameState.selectedAnswer) {
                  buttonClass += "bg-red-100 border-red-300 text-red-800";
                } else {
                  buttonClass += "bg-gray-50 border-gray-200";
                }
              } else {
                buttonClass += "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={gameState.showResult}
                  className={buttonClass}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-medium">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                    {gameState.showResult && index === currentQuestion.correctAnswer && (
                      <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                    )}
                    {gameState.showResult && index === gameState.selectedAnswer && index !== currentQuestion.correctAnswer && (
                      <XCircle className="h-5 w-5 text-red-600 ml-auto" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Next Button */}
      {gameState.showResult && (
        <div className="text-center">
          <Button onClick={handleNextQuestion} size="lg">
            {gameState.currentQuestionIndex + 1 >= gameState.questions.length ? 'Xem kết quả' : 'Câu tiếp theo'}
          </Button>
        </div>
      )}
    </div>
  );
}