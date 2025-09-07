import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import { H2, H3 } from '@/shared/components/ui/typography'
import { BookOpen, Keyboard, Check, X, Volume2 } from 'lucide-react'
import { useState, useEffect } from 'react'
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
  readLanguage,
  speakQuestion,
  handleAnswer,
  handleNext
}: QuestionCardProps) {
  const [showFullAnswer, setShowFullAnswer] = useState(false)
  const [fullAnswerText, setFullAnswerText] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [hintText, setHintText] = useState('')

  // Reset state when question changes
  useEffect(() => {
    setShowFullAnswer(false)
    setFullAnswerText('')
    setShowHint(false)
    setHintText('')
  }, [currentQuestion])
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
                  onClick={() => {
                    if (showFullAnswer) {
                      if (userAnswer.toLowerCase().trim() === fullAnswerText.toLowerCase().trim()) {
                        handleAnswer(userAnswer)
                        setShowFullAnswer(false)
                        setFullAnswerText('')
                      } else {
                        alert("Bạn phải nhập đúng đáp án đã hiển thị!")
                      }
                    } else {
                      handleAnswer(userAnswer)
                    }
                  }}
                  disabled={!userAnswer.trim()}
                  className="w-full"
                >
                  {showFullAnswer ? "Xác nhận đáp án" : "Kiểm tra"}
                </Button>
                {/* Hint and Don't Know buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (currentQuestion.hint) {
                        setShowHint(true)
                        setHintText(currentQuestion.hint)
                      } else if (currentQuestion.fullAnswer) {
                        // Tạo hint từ full answer nếu không có hint
                        const answer = currentQuestion.fullAnswer
                        const hint = answer.length > 10 ? answer.substring(0, Math.ceil(answer.length / 2)) + '...' : answer.substring(0, Math.ceil(answer.length * 0.7)) + '...'
                        setShowHint(true)
                        setHintText(hint)
                      }
                    }}
                    className="flex-1"
                    disabled={showHint}
                  >
                    💡 Gợi ý
                  </Button>
                  {currentQuestion.fullAnswer && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowFullAnswer(true)
                        setFullAnswerText(currentQuestion.fullAnswer!)
                      }}
                      className="flex-1"
                      disabled={showFullAnswer}
                    >
                      🤔 Không biết
                    </Button>
                  )}
                </div>
                {/* Show hint when requested */}
                {showHint && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-yellow-800">
                          <strong>Gợi ý:</strong> {hintText}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowHint(false)
                          setHintText('')
                        }}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                )}
                {/* Show full answer when requested */}
                {showFullAnswer && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-blue-800">
                          <strong>Đáp án đầy đủ:</strong> {fullAnswerText}
                        </p>
                        <p className="text-xs text-blue-600 mt-2">
                          Hãy nhập lại đáp án chính xác vào ô trên để tiếp tục.
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowFullAnswer(false)
                          setFullAnswerText('')
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                )}
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
