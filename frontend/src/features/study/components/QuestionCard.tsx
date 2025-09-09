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
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-4">
            {currentQuestion.mode === "MULTIPLE_CHOICE" ? (
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Keyboard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg sm:text-xl">
                {currentQuestion.mode === "MULTIPLE_CHOICE" ? 'Trắc nghiệm' : 'Nhập đáp án'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Câu hỏi {engine.serialize().asked + 1} / {engine.getCardProgress().length}
              </p>
            </div>
          </div>

          {(() => {
            const cardState = engine.getCardState(currentQuestion.cardId)
            if (cardState) {
              return (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => speakQuestion(currentQuestion.prompt, readLanguage)}
                    title="Đọc câu hỏi"
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                      Thành thạo: {cardState.mastery}/5
                    </Badge>
                    {cardState.wrongCount > 0 && (
                      <Badge variant="destructive" className="bg-red-50 dark:bg-red-900/20">
                        Sai: {cardState.wrongCount}
                      </Badge>
                    )}
                  </div>
                </div>
              )
            }
            return null
          })()}
        </div>
      </CardHeader>

      <CardContent className="space-y-8 px-6 sm:px-8">
        {/* Question */}
        <div className="text-center">
          <H2 className="text-2xl sm:text-3xl font-bold mb-6 leading-relaxed">
            {currentQuestion.prompt}
          </H2>
        </div>

        {/* Answer Section */}
        {!showResult ? (
          <div className="space-y-6">
            {currentQuestion.mode === "MULTIPLE_CHOICE" ? (
              // Multiple Choice
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {currentQuestion.options.map((option: string, index: number) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="p-4 sm:p-6 h-auto text-left justify-start text-base sm:text-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 transition-all duration-200 group"
                    onClick={() => handleAnswer(option)}
                  >
                    <span className="font-bold mr-3 text-lg group-hover:scale-110 transition-transform">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="flex-1">{option}</span>
                  </Button>
                ))}
              </div>
            ) : (
              // Typing
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">Nhập câu trả lời của bạn</label>
                  <Input
                    placeholder="Gõ đáp án..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && userAnswer.trim()) {
                        handleAnswer(userAnswer)
                      }
                    }}
                    className="text-lg sm:text-xl p-4 sm:p-6 h-14 sm:h-16 border-2 focus:border-blue-500 transition-colors"
                  />
                </div>
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
                  className="w-full h-12 sm:h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  size="lg"
                >
                  {showFullAnswer ? "Xác nhận đáp án" : "Kiểm tra"}
                </Button>
                {/* Hint and Don't Know buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
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
                    className="flex-1 h-11 hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
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
                      className="flex-1 h-11 hover:bg-red-50 hover:border-red-300 transition-colors"
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
          <div className="text-center space-y-6">
            {(lastResult === "Correct" || lastResult === "CorrectMinor") ? (
              <div className="space-y-4">
                <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <H3 className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {lastResult === "Correct" ? "Tuyệt vời!" : "Gần đúng!"}
                  </H3>
                  {lastResult === "CorrectMinor" && (
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Có sai chính tả nhỏ nhưng vẫn được chấp nhận
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <X className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <H3 className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                    Chưa chính xác
                  </H3>
                  {(() => {
                    const card = cards.find(c => c.id.toString() === currentQuestion.cardId)
                    return card ? (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Đáp án đúng:</p>
                        <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                          {card.back}
                        </p>
                      </div>
                    ) : null
                  })()}
                </div>

                {/* Show selected vs correct for MC */}
                {currentQuestion.mode === "MULTIPLE_CHOICE" && selectedOptionIndex !== null && correctOptionIndex !== null && (
                  <div className="mt-6 space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Xem lại các lựa chọn:</p>
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                      {currentQuestion.options.map((option: string, index: number) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg text-sm border-2 transition-all ${
                            index === correctOptionIndex
                              ? 'bg-green-50 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-600'
                              : index === selectedOptionIndex
                              ? 'bg-red-50 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-600'
                              : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-600'
                          }`}
                        >
                          <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                          {option}
                          {index === correctOptionIndex && <span className="ml-2 text-green-600">✓</span>}
                          {index === selectedOptionIndex && index !== correctOptionIndex && <span className="ml-2 text-red-600">✗</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!autoAdvance && (
              <Button
                onClick={handleNext}
                className="h-12 sm:h-14 px-8 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                size="lg"
              >
                Tiếp tục
              </Button>
            )}
            {autoAdvance && (
              <div className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                ⏱️ Sẽ tự chuyển sang câu tiếp theo trong giây lát...
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
