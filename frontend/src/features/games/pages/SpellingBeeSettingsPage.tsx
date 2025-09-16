import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { H1 } from '@/shared/components/ui/typography';
import { ArrowLeft, Settings, Mic, Target, Volume2 } from 'lucide-react';

interface SpellingBeeSettings {
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  timeLimit?: number;
  showHints: boolean;
  autoPlay: boolean;
}

export default function SpellingBeeSettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SpellingBeeSettings>({
    difficulty: 'easy',
    questionCount: 10,
    timeLimit: undefined,
    showHints: true,
    autoPlay: false,
  });

  const handleStartGame = () => {
    navigate('/games/spelling-bee/play', { state: { settings } });
  };

  const getDifficultyDescription = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '10 từ - Phát âm chậm, rõ ràng';
      case 'medium':
        return '15 từ - Tốc độ trung bình';
      case 'hard':
        return '20 từ - Phát âm nhanh, thử thách';
      default:
        return '';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-green-100 text-green-800';
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
          <H1 className="mb-0">Cài đặt Spelling Bee</H1>
        </div>
        <Badge className="bg-blue-100 text-blue-800">
          <Settings className="mr-1 h-3 w-3" />
          Cài đặt
        </Badge>
      </div>

      {/* Game Description */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Mic className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Spelling Bee</h2>
              <p className="text-muted-foreground mb-4">
                Luyện tập kỹ năng đánh vần từ vựng thông qua việc nghe và viết chính tả.
                Trò chơi giúp cải thiện khả năng nghe, ghi nhớ và chính tả từ vựng.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Volume2 className="h-4 w-4 text-blue-500" />
                  <span>Luyện nghe</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-green-500" />
                  <span>Cải thiện chính tả</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mic className="h-4 w-4 text-purple-500" />
                  <span>Phát triển từ vựng</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Cài đặt trò chơi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">Độ khó</Label>
            <Select
              value={settings.difficulty}
              onValueChange={(value: 'easy' | 'medium' | 'hard') =>
                setSettings(prev => ({
                  ...prev,
                  difficulty: value,
                  questionCount: value === 'easy' ? 10 : value === 'medium' ? 15 : 20
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn độ khó" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Dễ</Badge>
                    <span>10 từ</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-100 text-yellow-800">Trung bình</Badge>
                    <span>15 từ</span>
                  </div>
                </SelectItem>
                <SelectItem value="hard">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-100 text-red-800">Khó</Badge>
                    <span>20 từ</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {getDifficultyDescription(settings.difficulty)}
            </p>
          </div>

          {/* Question Count */}
          <div className="space-y-2">
            <Label htmlFor="questionCount">Số từ</Label>
            <Select
              value={settings.questionCount.toString()}
              onValueChange={(value) =>
                setSettings(prev => ({ ...prev, questionCount: parseInt(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn số từ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 từ</SelectItem>
                <SelectItem value="10">10 từ</SelectItem>
                <SelectItem value="15">15 từ</SelectItem>
                <SelectItem value="20">20 từ</SelectItem>
                <SelectItem value="25">25 từ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Limit */}
          <div className="space-y-2">
            <Label htmlFor="timeLimit">Giới hạn thời gian (tùy chọn)</Label>
            <Select
              value={settings.timeLimit?.toString() || 'no-limit'}
              onValueChange={(value) =>
                setSettings(prev => ({
                  ...prev,
                  timeLimit: value === 'no-limit' ? undefined : parseInt(value)
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn giới hạn thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-limit">Không giới hạn</SelectItem>
                <SelectItem value="30">30 giây mỗi từ</SelectItem>
                <SelectItem value="45">45 giây mỗi từ</SelectItem>
                <SelectItem value="60">60 giây mỗi từ</SelectItem>
                <SelectItem value="90">90 giây mỗi từ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Show Hints */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="showHints">Hiển thị gợi ý</Label>
              <p className="text-sm text-muted-foreground">
                Cho phép nghe lại từ khi cần gợi ý
              </p>
            </div>
            <Button
              type="button"
              variant={settings.showHints ? "default" : "outline"}
              size="sm"
              onClick={() => setSettings(prev => ({ ...prev, showHints: !prev.showHints }))}
            >
              {settings.showHints ? 'Bật' : 'Tắt'}
            </Button>
          </div>

          {/* Auto Play */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="autoPlay">Tự động phát âm</Label>
              <p className="text-sm text-muted-foreground">
                Tự động phát âm từ khi chuyển sang từ mới
              </p>
            </div>
            <Button
              type="button"
              variant={settings.autoPlay ? "default" : "outline"}
              size="sm"
              onClick={() => setSettings(prev => ({ ...prev, autoPlay: !prev.autoPlay }))}
            >
              {settings.autoPlay ? 'Bật' : 'Tắt'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tổng quan cài đặt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Độ khó</Label>
              <div className="mt-1">
                <Badge className={getDifficultyColor(settings.difficulty)}>
                  {settings.difficulty === 'easy' ? 'Dễ' : settings.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Số từ</Label>
              <div className="mt-1 text-lg font-semibold">{settings.questionCount}</div>
            </div>
            <div>
              <Label className="text-sm font-medium">Thời gian</Label>
              <div className="mt-1 text-sm">
                {settings.timeLimit ? `${settings.timeLimit}s mỗi từ` : 'Không giới hạn'}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Tự động phát</Label>
              <div className="mt-1">
                <Badge variant={settings.autoPlay ? "default" : "secondary"}>
                  {settings.autoPlay ? 'Bật' : 'Tắt'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Game */}
      <div className="flex justify-center">
        <Button onClick={handleStartGame} size="lg" className="px-8">
          <Mic className="mr-2 h-5 w-5" />
          Bắt đầu Spelling Bee
        </Button>
      </div>
    </div>
  );
}