import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import { H2, H3 } from '@/shared/components/ui/typography'
import { BookOpen, Keyboard, Check, X, Volume2 } from 'lucide-react'
import type { Question, Result, LearnEngine as LearnEngineType } from '@/features/study/utils/learnEngine'
import type { Card as LearnCard } from '@/features/study/utils/learnEngine'

interface QuestionCardProps {
  currentQuestion: Question
  engine: LearnEngineType
  cards: LearnCard[]
  userAnswer: string
  setUserAnswer: (value: string) => void
  showResult: boolean
  lastResult: Result | null
  selectedOptionIndex: number | null
  correctOptionIndex: number | null
  autoAdvance: boolean
  autoRead: boolean
  readLanguage: string
  speakQuestion: (text: string, lang: string) => void
  handleAnswer: (answer: string | number) => void
  handleNext: () => void
}

export function QuestionCard({
  currentQuestion,
  engine,
  cards,
  userAnswer,
  setUserAnswer,
  showResult,
  lastResult,
  selectedOptionIndex,
  correctOptionIndex,
  autoAdvance,
  autoRead,
  readLanguage,
  speakQuestion,
  handleAnswer,
  handleNext
}: QuestionCardProps) {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {currentQuestion.mode === "MULTIPLE_CHOICE" ? (
              <BookOpen className="h-6 w-6 text-green-600" />
            ) : (
              <Keyboard className="h-6 w-6 text-purple-600" />
            )}
            <CardTitle>
              {currentQuestion.mode === "MULTIPLE_CHOICE" ? 'Trắc nghiệm' : 'Nhập đáp án'}
            </CardTitle>
          </div>

          {(() => {
            const cardState = engine.getCardState(currentQuestion.cardId)
            if (cardState) {
              return (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => speakQuestion(currentQuestion.prompt, readLanguage)}
                    title="Đọc câu hỏi"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <Badge variant="outline">
                    Thành thạo: {cardState.mastery}/5
                  </Badge>
                  {cardState.wrongCount > 0 && (
                    <Badge variant="destructive">
                      Sai: {cardState.wrongCount} lần
                    </Badge>
                  )}
                </div>
              )
            }
            return null
          })()}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question */}
        <div className="text-center">
          <H2 className="text-2xl font-bold mb-4">{currentQuestion.prompt}</H2>
        </div>

        {/* Answer Section */}
        {!showResult ? (
          <div className="space-y-4">
            {currentQuestion.mode === "MULTIPLE_CHOICE" ? (
              // Multiple Choice
              <div className="grid gap-3">
                {currentQuestion.options.map((option: string, index: number) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="p-4 h-auto text-left justify-start"
                    onClick={() => handleAnswer(option)}
                  >
                    <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Button>
                ))}
              </div>
            ) : (
              // Typing
              <div className="space-y-4">
                <Input
                  placeholder="Nhập câu trả lời..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && userAnswer.trim()) {
                      handleAnswer(userAnswer)
                    }
                  }}
                  className="text-lg p-4"
                />
                <Button
                  onClick={() => handleAnswer(userAnswer)}
                  disabled={!userAnswer.trim()}
                  className="w-full"
                >
                  Kiểm tra
                </Button>
              </div>
            )}
          </div>
        ) : (
          // Result
          <div className="text-center space-y-4">
            {(lastResult === "Correct" || lastResult === "CorrectMinor") ? (
              <div className="space-y-2">
                <Check className="h-16 w-16 text-green-500 mx-auto" />
                <H3 className="text-2xl font-bold text-green-600">
                  {lastResult === "Correct" ? "Chính xác!" : "Gần đúng!"}
                </H3>
                {lastResult === "CorrectMinor" && (
                  <p className="text-muted-foreground">
                    Có sai chính tả nhỏ nhưng vẫn được chấp nhận
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <X className="h-16 w-16 text-red-500 mx-auto" />
                <H3 className="text-2xl font-bold text-red-600">Chưa đúng!</H3>
                {(() => {
                  const card = cards.find(c => c.id.toString() === currentQuestion.cardId)
                  return card ? (
                    <p className="text-muted-foreground">
                      Đáp án đúng: <strong>{card.back}</strong>
                    </p>
                  ) : null
                })()}

                {/* Show selected vs correct for MC */}
                {currentQuestion.mode === "MULTIPLE_CHOICE" && selectedOptionIndex !== null && correctOptionIndex !== null && (
                  <div className="mt-4 space-y-2">
                    <div className="grid gap-2">
                      {currentQuestion.options.map((option: string, index: number) => (
                        <div
                          key={index}
                          className={`p-2 rounded text-sm ${
                            index === correctOptionIndex
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : index === selectedOptionIndex
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-gray-50 text-gray-600'
                          }`}
                        >
                          <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span>
                          {option}
                          {index === correctOptionIndex && <span className="ml-2">✓</span>}
                          {index === selectedOptionIndex && index !== correctOptionIndex && <span className="ml-2">✗</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!autoAdvance ? (
              <Button onClick={handleNext} className="mt-4">
                Câu tiếp theo
              </Button>
            ) : (
              <div className="text-sm text-muted-foreground mt-4">
                Sẽ tự chuyển sang câu tiếp theo trong giây lát...
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
