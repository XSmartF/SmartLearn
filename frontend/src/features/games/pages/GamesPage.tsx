import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { H1 } from '@/shared/components/ui/typography';
import { Gamepad2, Brain, Target, Zap, Settings, CheckCircle, Shuffle, Mic, FileText, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';

interface Game {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  route: string;
}

const games: Game[] = [
  {
    id: 'memory',
    title: 'Trò chơi ghi nhớ',
    description: 'Ghép đôi các thẻ để cải thiện trí nhớ và tập trung.',
    icon: Brain,
    difficulty: 'Dễ',
    route: ROUTES.MEMORY_GAME
  },
  {
    id: 'quiz',
    title: 'Đố vui kiến thức',
    description: 'Trả lời câu hỏi để kiểm tra kiến thức của bạn.',
    icon: Target,
    difficulty: 'Trung bình',
    route: ROUTES.QUIZ_GAME
  },
  {
    id: 'speed',
    title: 'Trò chơi tốc độ',
    description: 'Thử thách tốc độ phản ứng và sự nhanh nhạy.',
    icon: Zap,
    difficulty: 'Khó',
    route: ROUTES.SPEED_GAME
  },
  {
    id: 'true-false',
    title: 'Trò chơi đúng/sai',
    description: 'Xác định câu phát biểu có đúng hay không để củng cố kiến thức.',
    icon: CheckCircle,
    difficulty: 'Trung bình',
    route: ROUTES.TRUE_FALSE_GAME
  },
  {
    id: 'fill-blank',
    title: 'Điền khuyết',
    description: 'Điền từ đúng vào chỗ trống để hoàn thành câu.',
    icon: FileText,
    difficulty: 'Trung bình',
    route: ROUTES.FILL_BLANK_GAME
  },
  {
    id: 'word-scramble',
    title: 'Xáo trộn từ',
    description: 'Sắp xếp lại các chữ cái để tạo thành từ đúng.',
    icon: RotateCcw,
    difficulty: 'Trung bình',
    route: ROUTES.WORD_SCRAMBLE_GAME
  },
  {
    id: 'matching',
    title: 'Trò chơi ghép đôi',
    description: 'Ghép đôi các thẻ flashcards để phát triển trí nhớ và liên kết thông tin.',
    icon: Shuffle,
    difficulty: 'Trung bình',
    route: ROUTES.MATCHING_GAME
  },
  {
    id: 'spelling-bee',
    title: 'Spelling Bee',
    description: 'Luyện tập kỹ năng đánh vần từ vựng thông qua việc nghe và viết chính tả.',
    icon: Mic,
    difficulty: 'Trung bình',
    route: ROUTES.SPELLING_BEE_GAME
  }
];

export default function GamesPage() {
  const navigate = useNavigate();

  const handlePlayGame = (game: Game) => {
    if (game.id === 'memory') {
      navigate(ROUTES.MEMORY_GAME);
    } else if (game.id === 'quiz') {
      navigate(ROUTES.QUIZ_GAME);
    } else if (game.id === 'speed') {
      navigate(ROUTES.SPEED_GAME);
    } else if (game.id === 'true-false') {
      navigate(ROUTES.TRUE_FALSE_GAME);
    } else if (game.id === 'matching') {
      navigate(ROUTES.MATCHING_GAME);
    } else if (game.id === 'spelling-bee') {
      navigate(ROUTES.SPELLING_BEE_GAME);
    } else if (game.id === 'fill-blank') {
      navigate(ROUTES.FILL_BLANK_GAME);
    } else if (game.id === 'word-scramble') {
      navigate(ROUTES.WORD_SCRAMBLE_GAME);
    } else {
      navigate(game.route);
    }
  };

  const handleGameSettings = (game: Game) => {
    if (game.id === 'memory') {
      navigate(ROUTES.MEMORY_SETTINGS);
    } else if (game.id === 'quiz') {
      navigate(ROUTES.QUIZ_SETTINGS);
    } else if (game.id === 'speed') {
      navigate(ROUTES.SPEED_SETTINGS);
    } else if (game.id === 'true-false') {
      navigate(ROUTES.TRUE_FALSE_SETTINGS);
    } else if (game.id === 'matching') {
      navigate(ROUTES.MATCHING_SETTINGS);
    } else if (game.id === 'spelling-bee') {
      navigate(ROUTES.SPELLING_BEE_SETTINGS);
    } else if (game.id === 'fill-blank') {
      navigate(ROUTES.FILL_BLANK_SETTINGS);
    } else if (game.id === 'word-scramble') {
      navigate(ROUTES.WORD_SCRAMBLE_SETTINGS);
    } else {
      navigate(`/games/${game.id}/settings`);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <H1 className="mb-2">Trò chơi</H1>
        <p className="text-muted-foreground">
          Chọn một trò chơi để bắt đầu học tập một cách vui vẻ!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => {
          const IconComponent = game.icon;
          return (
            <Card key={game.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{game.title}</CardTitle>
                <CardDescription>{game.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="text-sm text-muted-foreground">
                  Độ khó: <span className="font-medium">{game.difficulty}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleGameSettings(game)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Cài đặt
                  </Button>
                  <Button
                    onClick={() => handlePlayGame(game)}
                    className="flex-1"
                  >
                    <Gamepad2 className="mr-2 h-4 w-4" />
                    Chơi ngay
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}