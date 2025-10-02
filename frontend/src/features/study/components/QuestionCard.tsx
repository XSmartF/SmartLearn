import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import { H2, H3 } from '@/shared/components/ui/typography'
import { BookOpen, Keyboard, Check, X, Volume2, Lightbulb, Frown, Timer, AlertTriangle, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { Question, Result, LearnEngine as LearnEngineType, Card as LearnCard, DifficultyMeta } from '@/features/study/utils/learnEngine'
import type { ReviewDifficultyChoice } from '@/shared/lib/reviewScheduler'
import { normalize } from '@/features/study/utils/learnEngine'
import { cn } from '@/shared/lib/utils'

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
  disableNext?: boolean
  answerSide: 'front' | 'back'
  difficultyMeta: DifficultyMeta | null
  difficultyChoices: Array<{ value: ReviewDifficultyChoice; label: string; description: string }>
  onDifficultyChoice: (choice: ReviewDifficultyChoice) => void
  submittingChoice: ReviewDifficultyChoice | null
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
  handleNext,
  disableNext = false,
  answerSide,
  difficultyMeta,
  difficultyChoices,
  onDifficultyChoice,
  submittingChoice
}: QuestionCardProps) {
  const [showFullAnswer, setShowFullAnswer] = useState(false)
  const [fullAnswerText, setFullAnswerText] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [hintText, setHintText] = useState('')
  const [mustRetryAfterDontKnow, setMustRetryAfterDontKnow] = useState(false)
  const [justRetriedAfterDontKnow, setJustRetriedAfterDontKnow] = useState(false)

  // Reset state when question changes
  useEffect(() => {
    setShowFullAnswer(false)
    setFullAnswerText('')
    setShowHint(false)
    setHintText('')
    setMustRetryAfterDontKnow(false)
    setJustRetriedAfterDontKnow(false)
  }, [currentQuestion])

  const activeDifficultyChoice = submittingChoice ?? difficultyMeta?.lastChoice ?? null
  const isRatingRequired = difficultyMeta?.shouldPrompt ?? false
  const difficultyPalette: Record<ReviewDifficultyChoice, { idle: string; active: string }> = {
    veryHard: {
      idle: 'border-destructive/50 text-destructive hover:border-destructive/70 hover:bg-destructive/10',
      active: 'border-destructive bg-destructive/15 text-destructive shadow-sm'
    },
    hard: {
      idle: 'border-warning/60 text-warning hover:border-warning/70 hover:bg-warning/10',
      active: 'border-warning bg-warning/10 text-warning shadow-sm'
    },
    again: {
      idle: 'border-info/60 text-info hover:border-info/70 hover:bg-info/10',
      active: 'border-info bg-info/10 text-info shadow-sm'
    },
    normal: {
      idle: 'border-success/60 text-success hover:border-success/70 hover:bg-success/10',
      active: 'border-success bg-success/10 text-success shadow-sm'
    }
  }
  return (
    <Card className="w-full max-w-6xl mx-auto shadow-lg border-0 bg-card backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-4">
            {currentQuestion.mode === "MULTIPLE_CHOICE" ? (
              <div className="p-2 bg-success/10 rounded-full">
                <BookOpen className="h-6 w-6 text-success" />
              </div>
            ) : (
              <div className="p-2 bg-secondary/10 rounded-full">
                <Keyboard className="h-6 w-6 text-secondary" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg sm:text-xl">
                {currentQuestion.mode === "MULTIPLE_CHOICE" ? 'Trắc nghiệm' : 'Nhập đáp án'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Câu hỏi {engine.serialize().asked + 1}
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
                    className="hover:bg-accent"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-accent">
                      Thành thạo: {cardState.mastery}/5
                    </Badge>
                    {cardState.wrongCount > 0 && (
                      <Badge variant="destructive" className="bg-destructive/10">
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
                    className="p-4 sm:p-6 h-auto text-left justify-start text-base sm:text-lg hover:bg-accent hover:border-primary transition-all duration-200 group"
                    onClick={() => {
                      if (mustRetryAfterDontKnow) {
                        // Only allow selecting the correct answer
                        const cardObj = cards.find(c => c.id.toString() === currentQuestion.cardId)
                        const correctAnswer = answerSide === 'back' ? cardObj?.back : cardObj?.front
                        if (option === correctAnswer) {
                          // Submit with wrong answer to count as incorrect
                          handleAnswer(currentQuestion.options[0] !== correctAnswer ? currentQuestion.options[0] : currentQuestion.options[1] || '')
                          setMustRetryAfterDontKnow(false)
                          setJustRetriedAfterDontKnow(true)
                        }
                      } else {
                        handleAnswer(option)
                      }
                    }}
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
                        if (mustRetryAfterDontKnow) {
                          const cardObj = cards.find(c => c.id.toString() === currentQuestion.cardId)
                          const correctAnswer = (answerSide === 'back' ? cardObj?.back : cardObj?.front) || ''
                          if (normalize(userAnswer) === normalize(correctAnswer)) {
                            // Submit with empty string to count as incorrect
                            handleAnswer('')
                            setMustRetryAfterDontKnow(false)
                            setJustRetriedAfterDontKnow(true)
                            setShowFullAnswer(false)
                            setFullAnswerText('')
                          } else {
                            alert("Bạn phải nhập đúng đáp án!")
                          }
                        } else {
                          handleAnswer(userAnswer)
                        }
                      }
                    }}
                    className="text-lg sm:text-xl p-4 sm:p-6 h-14 sm:h-16 border-2 focus:border-blue-500 transition-colors"
                  />
                </div>
                <Button
                  onClick={() => {
                    if (mustRetryAfterDontKnow) {
                      const cardObj = cards.find(c => c.id.toString() === currentQuestion.cardId)
                      const correctAnswer = (answerSide === 'back' ? cardObj?.back : cardObj?.front) || ''
                      if (normalize(userAnswer) === normalize(correctAnswer)) {
                        // Submit with empty string to count as incorrect
                        handleAnswer('')
                        setMustRetryAfterDontKnow(false)
                        setJustRetriedAfterDontKnow(true)
                        setShowFullAnswer(false)
                        setFullAnswerText('')
                      } else {
                        alert("Bạn phải nhập đúng đáp án!")
                      }
                    } else {
                      handleAnswer(userAnswer)
                    }
                  }}
                  disabled={!userAnswer.trim()}
                  className="w-full h-12 sm:h-14 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-200"
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
                    className="flex-1 h-11 hover:bg-warning/10 hover:border-warning transition-colors"
                    disabled={showHint}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Gợi ý
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      engine.markCardAsHard(currentQuestion.cardId)
                      // Có thể thêm feedback như toast
                      alert("Đã đánh dấu thẻ này là khó, sẽ ôn lại sớm!")
                    }}
                    className="flex-1 h-11 hover:bg-orange/10 hover:border-orange transition-colors"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Đánh dấu khó
                  </Button>
                  {currentQuestion.fullAnswer && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowFullAnswer(true)
                        setFullAnswerText(currentQuestion.fullAnswer!)
                        setMustRetryAfterDontKnow(true)
                        // Don't submit answer yet, wait for user to retry
                      }}
                      className="flex-1 h-11 hover:bg-destructive/10 hover:border-destructive transition-colors"
                      disabled={showFullAnswer}
                    >
                      <Frown className="h-4 w-4 mr-2" />
                      Không biết
                    </Button>
                  )}
                </div>
                {/* Show hint when requested */}
                {showHint && (
                  <div className="mt-4 p-4 bg-warning/10 border border-warning rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-warning-foreground">
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
                        className="text-warning-foreground hover:text-warning"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                {/* Show full answer when requested */}
                {showFullAnswer && (
                  <div className="mt-4 p-4 bg-info/10 border border-info rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-info-foreground">
                          <strong>Đáp án đầy đủ:</strong> {fullAnswerText}
                        </p>
                        <p className="text-xs text-info mt-2">
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
                        className="text-info hover:text-info-foreground"
                      >
                        <X className="h-4 w-4" />
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
                <div className="mx-auto w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
                  <Check className="h-10 w-10 text-success" />
                </div>
                <div>
                  <H3 className="text-2xl sm:text-3xl font-bold text-success mb-2">
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
                <div className={`mx-auto w-20 h-20 ${justRetriedAfterDontKnow ? 'bg-warning/10' : 'bg-destructive/10'} rounded-full flex items-center justify-center`}>
                  <X className={`h-10 w-10 ${justRetriedAfterDontKnow ? 'text-warning' : 'text-destructive'}`} />
                </div>
                <div>
                  <H3 className={`text-2xl sm:text-3xl font-bold ${justRetriedAfterDontKnow ? 'text-warning' : 'text-destructive'} mb-2`}>
                    {justRetriedAfterDontKnow ? "Hãy cố gắng lên nhé!" : "Chưa chính xác"}
                  </H3>
                  {justRetriedAfterDontKnow ? (
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Bạn đã nhập đúng sau khi xem đáp án. Hãy cố gắng nhớ cho lần sau!
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Đáp án đúng là:
                    </p>
                  )}
                  {(() => {
                    const card = cards.find(c => c.id.toString() === currentQuestion.cardId)
                    return card ? (
                      <div className="bg-info/10 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Đáp án đúng:</p>
                        <p className="text-lg font-semibold text-info">{answerSide === 'back' ? card.back : card.front}</p>
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
                              ? 'bg-success/10 border-success text-success'
                              : index === selectedOptionIndex
                              ? 'bg-destructive/10 border-destructive text-destructive'
                              : 'bg-muted border-border text-muted-foreground'
                          }`}
                        >
                          <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                          {option}
                          {index === correctOptionIndex && <Check className="h-4 w-4 ml-2 text-success inline" />}
                          {index === selectedOptionIndex && index !== correctOptionIndex && <X className="h-4 w-4 ml-2 text-destructive inline" />}
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
                disabled={disableNext}
              >
                Tiếp tục
              </Button>
            )}
            {autoAdvance && (
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                <Timer className="h-4 w-4 inline mr-1" />
                Sẽ tự chuyển sang câu tiếp theo trong giây lát...
              </div>
            )}
          </div>
        )}

        <div className="mt-10 border-t border-border/40 pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <H3 className="text-lg font-semibold">Đánh giá độ khó của thẻ</H3>
            {activeDifficultyChoice && (
              <Badge variant="outline" className="w-fit bg-primary/10 text-primary border-primary/40">
                Đã chọn: {(() => {
                  const found = difficultyChoices.find(option => option.value === activeDifficultyChoice)
                  return found ? found.label : activeDifficultyChoice
                })()}
              </Badge>
            )}
          </div>
          {isRatingRequired && !activeDifficultyChoice && (
            <p className="mt-3 flex items-center gap-2 text-sm text-warning">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Thẻ này cần được đánh giá để SmartLearn sắp lịch ôn tập chính xác.
            </p>
          )}
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {difficultyChoices.map(option => {
              const isActive = activeDifficultyChoice === option.value
              const isSubmitting = submittingChoice === option.value
              const isDisabled = Boolean(submittingChoice && submittingChoice !== option.value)
              const palette = difficultyPalette[option.value]
              return (
                <Button
                  key={option.value}
                  type="button"
                  variant="outline"
                  disabled={isDisabled}
                  onClick={() => onDifficultyChoice(option.value)}
                  className={cn(
                    'h-auto justify-start py-3 px-4 text-left transition-all duration-200',
                    isActive ? palette.active : palette.idle,
                    isSubmitting && 'opacity-70 cursor-wait'
                  )}
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-sm font-semibold">{isSubmitting ? 'Đang lưu...' : option.label}</span>
                    <span className="text-xs text-muted-foreground break-words">{option.description}</span>
                  </div>
                </Button>
              )
            })}
          </div>
          {isRatingRequired && !activeDifficultyChoice && (
            <p className="mt-3 text-xs text-warning flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Hãy chọn một lựa chọn đánh giá để tiếp tục học hiệu quả hơn.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
