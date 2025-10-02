import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { H1, H3, P } from '@/shared/components/ui/typography';
import { ArrowLeft, Settings, Play, Clock, Target, Zap, Brain, BookOpen, CheckCircle, Shuffle, Mic } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface GameSettings {
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  questionCount?: number;
  showHints?: boolean;
  randomizeOrder?: boolean;
  allowSkips?: boolean;
}

interface GameConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  defaultSettings: GameSettings;
  availableSettings: {
    difficulty: boolean;
    timeLimit: boolean;
    questionCount: boolean;
    showHints: boolean;
    randomizeOrder: boolean;
    allowSkips: boolean;
  };
}

const gameConfigs: Record<string, GameConfig> = {
  memory: {
    id: 'memory',
    name: 'Trò chơi ghép đôi',
    description: 'Ghép đôi các flashcards để ôn tập kiến thức',
    icon: <Brain className="h-8 w-8" />,
    color: 'bg-blue-500',
    defaultSettings: {
      difficulty: 'easy',
      questionCount: 8,
      showHints: true,
      randomizeOrder: true,
      allowSkips: false,
    },
    availableSettings: {
      difficulty: true,
      timeLimit: false,
      questionCount: true,
      showHints: true,
      randomizeOrder: true,
      allowSkips: false,
    },
  },
  quiz: {
    id: 'quiz',
    name: 'Trò chơi đố vui',
    description: 'Trả lời câu hỏi trắc nghiệm từ flashcards',
    icon: <BookOpen className="h-8 w-8" />,
    color: 'bg-green-500',
    defaultSettings: {
      difficulty: 'easy',
      timeLimit: 30,
      questionCount: 10,
      showHints: false,
      randomizeOrder: true,
      allowSkips: true,
    },
    availableSettings: {
      difficulty: true,
      timeLimit: true,
      questionCount: true,
      showHints: false,
      randomizeOrder: true,
      allowSkips: true,
    },
  },
  speed: {
    id: 'speed',
    name: 'Trò chơi tốc độ học tập',
    description: 'Ôn tập nhanh với giới hạn thời gian',
    icon: <Zap className="h-8 w-8" />,
    color: 'bg-purple-500',
    defaultSettings: {
      difficulty: 'easy',
      timeLimit: 10,
      questionCount: 10,
      showHints: false,
      randomizeOrder: true,
      allowSkips: false,
    },
    availableSettings: {
      difficulty: true,
      timeLimit: true,
      questionCount: true,
      showHints: false,
      randomizeOrder: true,
      allowSkips: false,
    },
  },
  'true-false': {
    id: 'true-false',
    name: 'Trò chơi đúng/sai',
    description: 'Xác định câu phát biểu có đúng hay không',
    icon: <CheckCircle className="h-8 w-8" />,
    color: 'bg-emerald-500',
    defaultSettings: {
      difficulty: 'easy',
      timeLimit: undefined,
      questionCount: 10,
      showHints: true,
      randomizeOrder: true,
      allowSkips: false,
    },
    availableSettings: {
      difficulty: true,
      timeLimit: true,
      questionCount: true,
      showHints: true,
      randomizeOrder: true,
      allowSkips: false,
    },
  },
  matching: {
    id: 'matching',
    name: 'Trò chơi ghép đôi',
    description: 'Ghép đôi các thẻ flashcards để phát triển trí nhớ',
    icon: <Shuffle className="h-8 w-8" />,
    color: 'bg-purple-500',
    defaultSettings: {
      difficulty: 'easy',
      timeLimit: undefined,
      questionCount: 6,
      showHints: true,
      randomizeOrder: true,
      allowSkips: false,
    },
    availableSettings: {
      difficulty: true,
      timeLimit: true,
      questionCount: true,
      showHints: true,
      randomizeOrder: true,
      allowSkips: false,
    },
  },
  'spelling-bee': {
    id: 'spelling-bee',
    name: 'Spelling Bee',
    description: 'Luyện tập kỹ năng đánh vần từ vựng',
    icon: <Mic className="h-8 w-8" />,
    color: 'bg-blue-500',
    defaultSettings: {
      difficulty: 'easy',
      timeLimit: undefined,
      questionCount: 10,
      showHints: true,
      randomizeOrder: true,
      allowSkips: false,
    },
    availableSettings: {
      difficulty: true,
      timeLimit: true,
      questionCount: true,
      showHints: true,
      randomizeOrder: true,
      allowSkips: false,
    },
  },
};

export default function GameSettingsPage() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const [settings, setSettings] = useState<GameSettings>(
    gameId ? gameConfigs[gameId]?.defaultSettings || gameConfigs.memory.defaultSettings : gameConfigs.memory.defaultSettings
  );

  const gameConfig = gameId ? gameConfigs[gameId] : gameConfigs.memory;

  if (!gameConfig) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center">
          <H3 className="text-2xl font-bold mb-4">Trò chơi không tồn tại</H3>
          <Button onClick={() => navigate('/games')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const handleSettingChange = (key: keyof GameSettings, value: GameSettings[keyof GameSettings]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleStartGame = () => {
    // Lưu settings vào localStorage hoặc context
    localStorage.setItem(`gameSettings_${gameId}`, JSON.stringify(settings));

    // Điều hướng đến trò chơi với settings
    navigate(`/games/${gameId}/play`, {
      state: { settings }
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getDifficultyDescription = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Dễ - Thời gian thoải mái, ít câu hỏi';
      case 'medium': return 'Trung bình - Cân bằng giữa thời gian và độ khó';
      case 'hard': return 'Khó - Ít thời gian, nhiều câu hỏi';
      default: return '';
    }
  };

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
          <H1 className="mb-0">Cài đặt trò chơi</H1>
        </div>
        <Badge className={getDifficultyColor(settings.difficulty)}>
          {settings.difficulty === 'easy' ? 'Dễ' :
           settings.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
        </Badge>
      </div>

      {/* Game Info */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-lg ${gameConfig.color} text-white`}>
              {gameConfig.icon}
            </div>
            <div>
              <H3 className="text-xl font-bold">{gameConfig.name}</H3>
              <P className="text-muted-foreground">{gameConfig.description}</P>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Cài đặt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Difficulty */}
          {gameConfig.availableSettings.difficulty && (
            <div>
              <label className="text-sm font-medium mb-3 block">Độ khó</label>
              <div className="grid grid-cols-3 gap-3">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => handleSettingChange('difficulty', level)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      settings.difficulty === level
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-medium capitalize">
                        {level === 'easy' ? 'Dễ' :
                         level === 'medium' ? 'Trung bình' : 'Khó'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {getDifficultyDescription(level)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Time Limit */}
          {gameConfig.availableSettings.timeLimit && (
            <div>
              <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Thời gian giới hạn mỗi câu (giây)
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[10, 20, 30, 60].map((time) => (
                  <button
                    key={time}
                    onClick={() => handleSettingChange('timeLimit', time)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      settings.timeLimit === time
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center font-medium">{time}s</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Question Count */}
          {gameConfig.availableSettings.questionCount && (
            <div>
              <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                <Target className="h-4 w-4" />
                Số lượng câu hỏi
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[5, 10, 15, 20].map((count) => (
                  <button
                    key={count}
                    onClick={() => handleSettingChange('questionCount', count)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      settings.questionCount === count
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center font-medium">{count}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Additional Settings */}
          <div className="space-y-4">
            {gameConfig.availableSettings.showHints && (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Hiển thị gợi ý</div>
                  <div className="text-sm text-muted-foreground">Hiển thị đáp án đúng khi trả lời sai</div>
                </div>
                <button
                  onClick={() => handleSettingChange('showHints', !settings.showHints)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.showHints ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.showHints ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            )}

            {gameConfig.availableSettings.randomizeOrder && (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Xáo trộn thứ tự</div>
                  <div className="text-sm text-muted-foreground">Ngẫu nhiên hóa thứ tự câu hỏi</div>
                </div>
                <button
                  onClick={() => handleSettingChange('randomizeOrder', !settings.randomizeOrder)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.randomizeOrder ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.randomizeOrder ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            )}

            {gameConfig.availableSettings.allowSkips && (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Cho phép bỏ qua</div>
                  <div className="text-sm text-muted-foreground">Cho phép bỏ qua câu hỏi khó</div>
                </div>
                <button
                  onClick={() => handleSettingChange('allowSkips', !settings.allowSkips)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.allowSkips ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.allowSkips ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Start Game */}
      <div className="text-center">
        <Button onClick={handleStartGame} size="lg" className="px-8">
          <Play className="mr-2 h-5 w-5" />
          Bắt đầu chơi
        </Button>
      </div>
    </div>
  );
}