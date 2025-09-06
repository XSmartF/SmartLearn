import { Card, CardContent } from '@/shared/components/ui/card'
import type { LearnEngine as LearnEngineType } from '@/features/study/utils/learnEngine'

interface StatsCardProps {
  progress: ReturnType<LearnEngineType['getProgressDetailed']>
}

export function StatsCard({ progress }: StatsCardProps) {
  if (!progress) return null

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="p-4">
        <div className="grid md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{progress.total}</div>
            <div className="text-sm text-muted-foreground">Tổng thuật ngữ</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{progress.masteryLevels.level5.count}</div>
            <div className="text-sm text-muted-foreground">Đã thành thạo</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {progress.masteryLevels.level1.count +
               progress.masteryLevels.level2.count +
               progress.masteryLevels.level3.count +
               progress.masteryLevels.level4.count}
            </div>
            <div className="text-sm text-muted-foreground">Đang học</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{Math.round(progress.accuracyOverall * 100)}%</div>
            <div className="text-sm text-muted-foreground">Độ chính xác</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
