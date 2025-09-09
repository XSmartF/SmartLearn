import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { BookOpen, CheckCircle, Clock, Target } from 'lucide-react'
import type { LearnEngine as LearnEngineType } from '@/features/study/utils/learnEngine'

interface StatsCardProps {
  progress: ReturnType<LearnEngineType['getProgressDetailed']>
}

export function StatsCard({ progress }: StatsCardProps) {
  if (!progress) return null

  const learningCount = progress.masteryLevels.level1.count +
                       progress.masteryLevels.level2.count +
                       progress.masteryLevels.level3.count +
                       progress.masteryLevels.level4.count

  const stats = [
    {
      icon: BookOpen,
      value: progress.total,
      label: 'Tổng thuật ngữ',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      icon: CheckCircle,
      value: progress.masteryLevels.level5.count,
      label: 'Đã thành thạo',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      icon: Clock,
      value: learningCount,
      label: 'Đang học',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      icon: Target,
      value: `${Math.round(progress.accuracyOverall * 100)}%`,
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

        {/* Progress breakdown */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-5 gap-2 text-center">
            {[1, 2, 3, 4, 5].map(level => (
              <div key={level} className="space-y-1">
                <Badge
                  variant={progress.masteryLevels[`level${level}` as keyof typeof progress.masteryLevels].count > 0 ? "default" : "outline"}
                  className="w-full justify-center text-xs"
                >
                  {progress.masteryLevels[`level${level}` as keyof typeof progress.masteryLevels].count}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  M{level}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
