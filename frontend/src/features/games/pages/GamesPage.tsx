import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Brain, Target, Zap, Settings, CheckCircle, Shuffle, Mic, FileText, RotateCcw } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageSection } from '@/shared/components/PageSection';
import { ROUTES } from '@/shared/constants/routes';

interface Game {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  route: string;
  settingsRoute: string;
  focus: string;
}

const games: Game[] = [
  {
    id: 'memory',
    title: 'Trò chơi ghi nhớ',
    description: 'Ghép đôi các thẻ để cải thiện trí nhớ và tập trung.',
    icon: Brain,
    difficulty: 'Dễ',
    route: ROUTES.MEMORY_GAME,
    settingsRoute: ROUTES.MEMORY_SETTINGS,
    focus: 'Tăng cường trí nhớ ngắn hạn'
  },
  {
    id: 'quiz',
    title: 'Đố vui kiến thức',
    description: 'Trả lời câu hỏi để kiểm tra kiến thức của bạn.',
    icon: Target,
    difficulty: 'Trung bình',
    route: ROUTES.QUIZ_GAME,
    settingsRoute: ROUTES.QUIZ_SETTINGS,
    focus: 'Củng cố kiến thức trọng tâm'
  },
  {
    id: 'speed',
    title: 'Trò chơi tốc độ',
    description: 'Thử thách tốc độ phản ứng và sự nhanh nhạy.',
    icon: Zap,
    difficulty: 'Khó',
    route: ROUTES.SPEED_GAME,
    settingsRoute: ROUTES.SPEED_SETTINGS,
    focus: 'Rèn luyện phản xạ và sự tập trung'
  },
  {
    id: 'true-false',
    title: 'Trò chơi đúng/sai',
    description: 'Xác định câu phát biểu có đúng hay không để củng cố kiến thức.',
    icon: CheckCircle,
    difficulty: 'Trung bình',
    route: ROUTES.TRUE_FALSE_GAME,
    settingsRoute: ROUTES.TRUE_FALSE_SETTINGS,
    focus: 'Kiểm tra khả năng suy luận nhanh'
  },
  {
    id: 'fill-blank',
    title: 'Điền khuyết',
    description: 'Điền từ đúng vào chỗ trống để hoàn thành câu.',
    icon: FileText,
    difficulty: 'Trung bình',
    route: ROUTES.FILL_BLANK_GAME,
    settingsRoute: ROUTES.FILL_BLANK_SETTINGS,
    focus: 'Phát triển khả năng ngôn ngữ'
  },
  {
    id: 'word-scramble',
    title: 'Xáo trộn từ',
    description: 'Sắp xếp lại các chữ cái để tạo thành từ đúng.',
    icon: RotateCcw,
    difficulty: 'Trung bình',
    route: ROUTES.WORD_SCRAMBLE_GAME,
    settingsRoute: ROUTES.WORD_SCRAMBLE_SETTINGS,
    focus: 'Mở rộng vốn từ vựng'
  },
  {
    id: 'matching',
    title: 'Trò chơi ghép đôi',
    description: 'Ghép đôi các thẻ flashcards để phát triển trí nhớ và liên kết thông tin.',
    icon: Shuffle,
    difficulty: 'Trung bình',
    route: ROUTES.MATCHING_GAME,
    settingsRoute: ROUTES.MATCHING_SETTINGS,
    focus: 'Kết nối kiến thức đa chiều'
  },
  {
    id: 'spelling-bee',
    title: 'Spelling Bee',
    description: 'Luyện tập kỹ năng đánh vần từ vựng thông qua việc nghe và viết chính tả.',
    icon: Mic,
    difficulty: 'Trung bình',
    route: ROUTES.SPELLING_BEE_GAME,
    settingsRoute: ROUTES.SPELLING_BEE_SETTINGS,
    focus: 'Cải thiện phát âm và chính tả'
  }
];

export default function GamesPage() {
  const navigate = useNavigate();

  const handlePlayGame = (game: Game) => {
    navigate(game.route);
  };

  const handleGameSettings = (game: Game) => {
    navigate(game.settingsRoute);
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      <PageHeader
        title="Trung tâm trò chơi"
        description="Kết hợp học và chơi với các mini game giúp bạn ôn luyện kiến thức một cách nhẹ nhàng và hiệu quả."
        icon={<Gamepad2 className="h-6 w-6 text-primary" />}
      />

      <PageSection
        heading="Danh sách trò chơi"
        description="Chọn trò chơi phù hợp với mục tiêu luyện tập của bạn. Mỗi trò chơi có thể tùy chỉnh riêng."
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {games.map((game) => {
            const IconComponent = game.icon;
            return (
              <Card key={game.id} className="h-full transition-shadow hover:shadow-lg">
                <CardHeader className="space-y-4 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <IconComponent className="h-7 w-7 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{game.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {game.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Độ khó</span>
                    <Badge variant="secondary">{game.difficulty}</Badge>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                    {game.focus}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleGameSettings(game)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Tùy chỉnh
                    </Button>
                    <Button onClick={() => handlePlayGame(game)} className="flex-1">
                      <Gamepad2 className="mr-2 h-4 w-4" />
                      Chơi ngay
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </PageSection>

      <PageSection
        heading="Mẹo luyện tập hiệu quả"
        description="Tối ưu phiên chơi của bạn với vài gợi ý nhỏ."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Lập kế hoạch nhanh</CardTitle>
              <CardDescription className="text-sm">
                Chọn 2-3 trò chơi khác nhau cho mỗi buổi học để giữ nhịp độ thú vị.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Theo dõi tiến độ</CardTitle>
              <CardDescription className="text-sm">
                Kết hợp với bảng điều khiển để xem trò chơi nào giúp bạn tiến bộ nhanh nhất.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Chia sẻ với bạn</CardTitle>
              <CardDescription className="text-sm">
                Mời bạn bè cùng chơi để tăng động lực và trao đổi mẹo học tập.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </PageSection>
    </div>
  );
}