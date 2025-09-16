import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { H1 } from '@/shared/components/ui/typography';
import { ArrowLeft, Zap, Settings, Target, Clock, Brain } from 'lucide-react';

interface SpeedSettings {
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  timeLimit?: number;
  showHints: boolean;
}

export default function SpeedSettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SpeedSettings>({
    difficulty: 'easy',
    questionCount: 10,
    timeLimit: 30,
    showHints: false,
  });

  const handleStartGame = () => {
    navigate('/games/speed/play', { state: { settings } });
  };

  const getDifficultyDescription = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '10 từ - Thời gian 45 giây';
      case 'medium':
        return '15 từ - Thời gian 30 giây';
      case 'hard':
        return '20 từ - Thời gian 20 giây';
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
          <H1 className="mb-0">Cài đặt trò chơi tốc độ</H1>
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
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Trò chơi tốc độ</h2>
              <p className="text-muted-foreground mb-4">
                Thử thách tốc độ phản ứng và khả năng ghi nhớ nhanh. Bạn sẽ thấy từ vựng
                trong thời gian ngắn và phải nhập chính xác từ đó.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span>Tốc độ phản ứng</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span>Ghi nhớ nhanh</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <span>Tập trung cao</span>
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
                  questionCount: value === 'easy' ? 10 : value === 'medium' ? 15 : 20,
                  timeLimit: value === 'easy' ? 45 : value === 'medium' ? 30 : 20
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
                    <span>10 từ - 45s</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-100 text-yellow-800">Trung bình</Badge>
                    <span>15 từ - 30s</span>
                  </div>
                </SelectItem>
                <SelectItem value="hard">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-100 text-red-800">Khó</Badge>
                    <span>20 từ - 20s</span>
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
            <Label htmlFor="timeLimit">Thời gian hiển thị mỗi từ</Label>
            <Select
              value={settings.timeLimit?.toString() || '30'}
              onValueChange={(value) =>
                setSettings(prev => ({
                  ...prev,
                  timeLimit: parseInt(value)
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn thời gian hiển thị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 giây</SelectItem>
                <SelectItem value="20">20 giây</SelectItem>
                <SelectItem value="30">30 giây</SelectItem>
                <SelectItem value="45">45 giây</SelectItem>
                <SelectItem value="60">60 giây</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Show Hints */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="showHints">Hiển thị gợi ý</Label>
              <p className="text-sm text-muted-foreground">
                Cho phép xem đáp án đúng sau khi trả lời sai
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
                {settings.timeLimit}s mỗi từ
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Gợi ý</Label>
              <div className="mt-1">
                <Badge variant={settings.showHints ? "default" : "secondary"}>
                  {settings.showHints ? 'Bật' : 'Tắt'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Game */}
      <div className="flex justify-center">
        <Button onClick={handleStartGame} size="lg" className="px-8">
          <Zap className="mr-2 h-5 w-5" />
          Bắt đầu trò chơi
        </Button>
      </div>
    </div>
  );
}