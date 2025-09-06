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
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstQuestion}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Câu trước
      </Button>

      <div className="flex items-center space-x-2">
        {!showAnswer ? (
          <Button onClick={onShowAnswer}>
            Xem đáp án
          </Button>
        ) : !isLastQuestion ? (
          <Button onClick={onNext}>
            Câu tiếp
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={onFinish}
            disabled={!canFinish}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Hoàn thành
          </Button>
        )}
      </div>
    </div>
  )
}
