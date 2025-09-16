import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { H1 } from '@/shared/components/ui/typography';
import { ArrowLeft, Settings, Shuffle, Target, Zap } from 'lucide-react';

interface MatchingSettings {
  difficulty: 'easy' | 'medium' | 'hard';
  pairsCount: number;
  timeLimit?: number;
  showHints: boolean;
}

export default function MatchingSettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<MatchingSettings>({
    difficulty: 'easy',
    pairsCount: 6,
    timeLimit: undefined,
    showHints: true,
  });

  const handleStartGame = () => {
    navigate('/games/matching/play', { state: { settings } });
  };

  const getDifficultyDescription = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '6 cặp thẻ - Nhanh chóng';
      case 'medium':
        return '8 cặp thẻ - Trung bình';
      case 'hard':
        return '10 cặp thẻ - Thử thách';
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
          <H1 className="mb-0">Cài đặt trò chơi ghép đôi</H1>
        </div>
        <Badge className="bg-purple-100 text-purple-800">
          <Settings className="mr-1 h-3 w-3" />
          Cài đặt
        </Badge>
      </div>

      {/* Game Description */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Shuffle className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Trò chơi ghép đôi</h2>
              <p className="text-muted-foreground mb-4">
                Ghép đôi các thẻ flashcards để củng cố kiến thức. Mỗi cặp bao gồm câu hỏi và đáp án tương ứng.
                Trò chơi giúp phát triển trí nhớ và khả năng liên kết thông tin.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Shuffle className="h-4 w-4 text-purple-500" />
                  <span>Phát triển trí nhớ</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span>Liên kết thông tin</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span>Phản hồi tức thì</span>
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
                  pairsCount: value === 'easy' ? 6 : value === 'medium' ? 8 : 10
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
                    <span>6 cặp thẻ</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-100 text-yellow-800">Trung bình</Badge>
                    <span>8 cặp thẻ</span>
                  </div>
                </SelectItem>
                <SelectItem value="hard">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-100 text-red-800">Khó</Badge>
                    <span>10 cặp thẻ</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {getDifficultyDescription(settings.difficulty)}
            </p>
          </div>

          {/* Pairs Count */}
          <div className="space-y-2">
            <Label htmlFor="pairsCount">Số cặp thẻ</Label>
            <Select
              value={settings.pairsCount.toString()}
              onValueChange={(value) =>
                setSettings(prev => ({ ...prev, pairsCount: parseInt(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn số cặp thẻ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 cặp thẻ</SelectItem>
                <SelectItem value="6">6 cặp thẻ</SelectItem>
                <SelectItem value="8">8 cặp thẻ</SelectItem>
                <SelectItem value="10">10 cặp thẻ</SelectItem>
                <SelectItem value="12">12 cặp thẻ</SelectItem>
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
                <SelectItem value="60">1 phút mỗi cặp</SelectItem>
                <SelectItem value="90">1.5 phút mỗi cặp</SelectItem>
                <SelectItem value="120">2 phút mỗi cặp</SelectItem>
                <SelectItem value="180">3 phút mỗi cặp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Show Hints */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="showHints">Hiển thị gợi ý</Label>
              <p className="text-sm text-muted-foreground">
                Cho phép xem thẻ đã lật khi cần gợi ý
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
              <Label className="text-sm font-medium">Số cặp thẻ</Label>
              <div className="mt-1 text-lg font-semibold">{settings.pairsCount}</div>
            </div>
            <div>
              <Label className="text-sm font-medium">Thời gian</Label>
              <div className="mt-1 text-sm">
                {settings.timeLimit ? `${settings.timeLimit}s mỗi cặp` : 'Không giới hạn'}
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
          <Shuffle className="mr-2 h-5 w-5" />
          Bắt đầu trò chơi
        </Button>
      </div>
    </div>
  );
}