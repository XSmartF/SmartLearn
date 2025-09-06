import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"

interface Question {
  id: number
  type: 'multiple-choice' | 'true-false' | 'fill-blank'
  question: string
  options?: string[]
  correctAnswer: string
  userAnswer?: string
  isCorrect?: boolean
}

interface TestQuestionProps {
  question: Question
  showAnswer: boolean
  userAnswer: string
  onAnswerSelect: (answer: string) => void
}

export default function TestQuestion({
  question,
  showAnswer,
  userAnswer,
  onAnswerSelect
}: TestQuestionProps) {
  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple-choice': return 'Trắc nghiệm'
      case 'true-false': return 'Đúng/Sai'
      case 'fill-blank': return 'Điền khuyết'
      default: return type
    }
  }

  const renderOptions = () => {
    if (question.type === 'fill-blank') {
      return (
        <div className="space-y-2">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => onAnswerSelect(e.target.value)}
            placeholder="Nhập câu trả lời của bạn..."
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={showAnswer}
          />
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {question.options?.map((option, index) => {
          const isSelected = userAnswer === option
          const isCorrect = showAnswer && option === question.correctAnswer
          const isIncorrect = showAnswer && isSelected && option !== question.correctAnswer

          return (
            <Button
              key={index}
              variant={isSelected ? "default" : "outline"}
              className={`w-full justify-start text-left p-4 h-auto ${
                isCorrect ? 'bg-green-100 border-green-500 text-green-800' :
                isIncorrect ? 'bg-red-100 border-red-500 text-red-800' : ''
              }`}
              onClick={() => !showAnswer && onAnswerSelect(option)}
              disabled={showAnswer}
            >
              <div className="flex items-center space-x-3">
                <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                <span className="flex-1">{option}</span>
                {isCorrect && <CheckCircle className="h-4 w-4 text-green-600" />}
                {isIncorrect && <XCircle className="h-4 w-4 text-red-600" />}
              </div>
            </Button>
          )
        })}
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="secondary">
            {getQuestionTypeLabel(question.type)}
          </Badge>
          {showAnswer && (
            <Badge variant={question.isCorrect ? "default" : "destructive"}>
              {question.isCorrect ? 'Đúng' : 'Sai'}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg leading-relaxed">
          {question.question}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderOptions()}

        {showAnswer && question.type === 'fill-blank' && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Đáp án đúng:</strong> {question.correctAnswer}
            </p>
            {userAnswer && (
              <p className="text-sm text-gray-600 mt-1">
                <strong>Câu trả lời của bạn:</strong> {userAnswer}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
