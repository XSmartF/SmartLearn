import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { BookOpen, CheckCircle, Clock, Target } from 'lucide-react'
import type { LearnEngine as LearnEngineType } from '@/features/study/utils/learnEngine'

interface StatsCardProps {
  engine: LearnEngineType
  progress: ReturnType<LearnEngineType['getProgressDetailed']>
}

export function StatsCard({ engine, progress }: StatsCardProps) {
  if (!progress) return null

  const sessionStats = engine.getSessionStats()
  const activeLearningCount =
    progress.masteryLevels.level1.count +
    progress.masteryLevels.level2.count +
    progress.masteryLevels.level3.count +
    progress.masteryLevels.level4.count
  const accuracyPercent = sessionStats.asked ? Math.round((sessionStats.correct / sessionStats.asked) * 100) : null
  const masteredCount = progress.masteryLevels.level5.count
  const formatAverageTime = (ms: number | null) => {
    if (!ms) return '—'
    if (ms < 1000) return `${Math.round(ms)} ms`
    const seconds = ms / 1000
    return `${seconds.toFixed(seconds >= 10 ? 0 : 1)} s`
  }

  const averageTimeLabel = formatAverageTime(progress.avgMsRecent ?? null)

  const stats = [
    {
      icon: BookOpen,
      value: sessionStats.asked,
      label: 'Câu đã luyện',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      icon: CheckCircle,
      value: sessionStats.correct,
      label: 'Trả lời đúng',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      icon: Clock,
      value: averageTimeLabel,
      label: 'Thời gian trung bình',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      icon: Target,
      value: accuracyPercent !== null ? `${accuracyPercent}%` : '—',
      label: 'Độ chính xác',
      color: 'text-info',
      bgColor: 'bg-info/10'
    }
  ]

  return (
    <Card className="w-full shadow-lg border-0 bg-card backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl font-semibold text-center">
          Tiến độ học tập
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-3">
              <div className={`mx-auto w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <div className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Personal card breakdown */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="mb-3 text-xs sm:text-sm text-muted-foreground text-center">
            Số liệu bên dưới phản ánh tiến trình của riêng bạn trong thư viện này.
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="space-y-1">
              <Badge variant={activeLearningCount > 0 ? 'default' : 'outline'} className="w-full justify-center text-xs">
                {activeLearningCount}
              </Badge>
              <div className="text-xs text-muted-foreground">Thẻ đang học</div>
            </div>
            <div className="space-y-1">
              <Badge variant={masteredCount > 0 ? 'default' : 'outline'} className="w-full justify-center text-xs">
                {masteredCount}
              </Badge>
              <div className="text-xs text-muted-foreground">Thẻ đã thành thạo</div>
            </div>
            <div className="space-y-1">
              <Badge variant={progress.masteryLevels.level0.count > 0 ? 'default' : 'outline'} className="w-full justify-center text-xs">
                {progress.masteryLevels.level0.count}
              </Badge>
              <div className="text-xs text-muted-foreground">Chưa học</div>
            </div>
            <div className="space-y-1">
              <Badge variant={sessionStats.incorrect > 0 ? 'destructive' : 'outline'} className="w-full justify-center text-xs">
                {sessionStats.incorrect}
              </Badge>
              <div className="text-xs text-muted-foreground">Trả lời sai</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
