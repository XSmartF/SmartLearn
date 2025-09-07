import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { H4 } from '@/shared/components/ui/typography'
import { BarChart3 } from 'lucide-react'
import type { LearnEngine as LearnEngineType } from '@/features/study/utils/learnEngine'

interface CardProgressCardProps {
  engine: LearnEngineType
  showCardAnswers: boolean
  setShowCardAnswers: (value: boolean) => void
}

export function CardProgressCard({ engine, showCardAnswers, setShowCardAnswers }: CardProgressCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between flex-wrap">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
            Chi tiết tiến độ từng thẻ
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCardAnswers(!showCardAnswers)}
              className="text-xs sm:text-sm"
            >
              {showCardAnswers ? 'Ẩn đáp án' : 'Hiện đáp án'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {/* Using getCardProgress() */}
          {engine.getCardProgress().map((cardProgress) => {
            const currentState = engine.getCardState(cardProgress.id) // Using getCardState()
            return (
              <div key={cardProgress.id} className="border rounded-lg p-3 sm:p-4">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm sm:text-base truncate">{cardProgress.front}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {showCardAnswers ? (
                        cardProgress.back
                      ) : (
                        <span className="select-none tracking-wider opacity-70">••••••</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-4">
                    <Badge variant={cardProgress.mastery >= 5 ? "default" : "outline"}>
                      Lv {cardProgress.mastery}
                    </Badge>
                    {cardProgress.wrongCount > 0 && (
                      <Badge variant="destructive">
                        {cardProgress.wrongCount} sai
                      </Badge>
                    )}
                    <Badge variant="outline">
                      Seen: {cardProgress.seenCount}
                    </Badge>
                    {currentState && (
                      <Badge variant="outline">
                        Next: {currentState.nextDue}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Progress bar for this card */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      cardProgress.mastery >= 5 ? 'bg-green-500' :
                      cardProgress.mastery >= 3 ? 'bg-blue-500' :
                      cardProgress.mastery >= 1 ? 'bg-orange-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${(cardProgress.mastery / 5) * 100}%` }}
                  />
                </div>
              </div>
            )
          })}

          {/* Summary using getAllCardStates() */}
          <div className="border-t pt-4 mt-4">
            <H4 className="font-semibold mb-2">Tổng quan trạng thái</H4>
            <div className="text-sm text-muted-foreground">
              Tổng số thẻ: {engine.getAllCardStates().length} |
              Đã hoàn thành: {engine.getAllCardStates().filter((state) => state.mastery >= 5).length} |
              Trung bình mastery: {(engine.getAllCardStates().reduce((sum, state) => sum + state.mastery, 0) / engine.getAllCardStates().length).toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
