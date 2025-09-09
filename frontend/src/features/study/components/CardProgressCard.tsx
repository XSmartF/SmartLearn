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
    <Card className="w-full shadow-lg border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            Chi tiết tiến độ từng thẻ
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCardAnswers(!showCardAnswers)}
            className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            {showCardAnswers ? 'Ẩn đáp án' : 'Hiện đáp án'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-6">
        <div className="space-y-4">
          {engine.getCardProgress().map((cardProgress) => {
            const currentState = engine.getCardState(cardProgress.id)
            return (
              <div key={cardProgress.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm sm:text-base mb-1">{cardProgress.front}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {showCardAnswers ? (
                        cardProgress.back
                      ) : (
                        <span className="select-none tracking-wider opacity-70">••••••</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={cardProgress.mastery >= 5 ? "default" : "outline"}
                      className={cardProgress.mastery >= 5 ? "bg-green-600" : ""}
                    >
                      Lv {cardProgress.mastery}
                    </Badge>
                    {cardProgress.wrongCount > 0 && (
                      <Badge variant="destructive" className="bg-red-100 dark:bg-red-900/30">
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

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      cardProgress.mastery >= 5 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                      cardProgress.mastery >= 3 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                      cardProgress.mastery >= 1 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                      'bg-gradient-to-r from-gray-400 to-gray-600'
                    }`}
                    style={{ width: `${(cardProgress.mastery / 5) * 100}%` }}
                  />
                </div>
              </div>
            )
          })}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
            <H4 className="font-semibold mb-3 text-center">Tổng quan trạng thái</H4>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{engine.getAllCardStates().length}</div>
                  <div className="text-sm text-muted-foreground">Tổng số thẻ</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {engine.getAllCardStates().filter((state) => state.mastery >= 5).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Đã hoàn thành</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {(engine.getAllCardStates().reduce((sum, state) => sum + state.mastery, 0) / engine.getAllCardStates().length).toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Mastery TB</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
