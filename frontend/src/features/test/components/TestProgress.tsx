import { Progress } from "@/shared/components/ui/progress"
import { Badge } from "@/shared/components/ui/badge"
import { Target, CheckCircle } from "lucide-react"

interface TestProgressProps {
  currentQuestionIndex: number
  totalQuestions: number
  answeredCount: number
  correctCount: number
  timeLeft: number | null
}

export default function TestProgress({
  currentQuestionIndex,
  totalQuestions,
  answeredCount,
  correctCount,
  timeLeft
}: TestProgressProps) {
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100
  const accuracy = answeredCount > 0 ? (correctCount / answeredCount) * 100 : 0

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
        <span>Tiến độ làm bài</span>
        <span>{currentQuestionIndex + 1} / {totalQuestions}</span>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <Badge variant="outline" className="flex items-center space-x-1 text-xs">
            <Target className="h-3 w-3" />
            <span>{answeredCount} đã trả lời</span>
          </Badge>

          {answeredCount > 0 && (
            <Badge variant="outline" className="flex items-center space-x-1 text-xs">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>{Math.round(accuracy)}% đúng</span>
            </Badge>
          )}
        </div>

        {timeLeft !== null && (
          <Badge variant="outline" className="flex items-center space-x-1 text-xs">
            <span className={timeLeft < 300 ? 'text-red-600' : ''}>
              {formatTime(timeLeft)}
            </span>
          </Badge>
        )}
      </div>
    </div>
  )
}
