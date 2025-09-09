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
    <Card className="w-full shadow-lg border-0 bg-card backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
            <div className="p-2 bg-primary/10 rounded-full">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            Chi tiết tiến độ từng thẻ
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCardAnswers(!showCardAnswers)}
            className="hover:bg-accent transition-colors"
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
                      className={cardProgress.mastery >= 5 ? "bg-success" : ""}
                    >
                      Lv {cardProgress.mastery}
                    </Badge>
                    {cardProgress.wrongCount > 0 && (
                      <Badge variant="destructive" className="bg-destructive/10">
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

                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      cardProgress.mastery >= 5 ? 'bg-gradient-to-r from-success to-success' :
                      cardProgress.mastery >= 3 ? 'bg-gradient-to-r from-primary to-primary' :
                      cardProgress.mastery >= 1 ? 'bg-gradient-to-r from-warning to-warning' :
                      'bg-gradient-to-r from-muted to-muted-foreground'
                    }`}
                    style={{ width: `${(cardProgress.mastery / 5) * 100}%` }}
                  />
                </div>
              </div>
            )
          })}

          <div className="border-t border-border pt-4 mt-6">
            <H4 className="font-semibold mb-3 text-center">Tổng quan trạng thái</H4>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{engine.getAllCardStates().length}</div>
                  <div className="text-sm text-muted-foreground">Tổng số thẻ</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-success">
                    {engine.getAllCardStates().filter((state) => state.mastery >= 5).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Đã hoàn thành</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-info">
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
