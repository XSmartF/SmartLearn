import { Button } from "@/shared/components/ui/button"
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"

interface TestNavigationProps {
  currentQuestionIndex: number
  totalQuestions: number
  showAnswer: boolean
  onPrevious: () => void
  onNext: () => void
  onShowAnswer: () => void
  onFinish: () => void
  canFinish: boolean
}

export default function TestNavigation({
  currentQuestionIndex,
  totalQuestions,
  showAnswer,
  onPrevious,
  onNext,
  onShowAnswer,
  onFinish,
  canFinish
}: TestNavigationProps) {
  const isFirstQuestion = currentQuestionIndex === 0
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstQuestion}
        className="flex-1 sm:flex-none"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Câu trước</span>
        <span className="sm:hidden">Trước</span>
      </Button>

      <div className="flex items-center justify-center space-x-2">
        {!showAnswer ? (
          <Button onClick={onShowAnswer} className="flex-1 sm:flex-none">
            <span className="hidden sm:inline">Xem đáp án</span>
            <span className="sm:hidden">Đáp án</span>
          </Button>
        ) : !isLastQuestion ? (
          <Button onClick={onNext} className="flex-1 sm:flex-none">
            <span className="hidden sm:inline">Câu tiếp</span>
            <span className="sm:hidden">Tiếp</span>
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={onFinish}
            disabled={!canFinish}
            className="bg-success hover:bg-success/90 flex-1 sm:flex-none"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Hoàn thành</span>
            <span className="sm:hidden">Xong</span>
          </Button>
        )}
      </div>
    </div>
  )
}
