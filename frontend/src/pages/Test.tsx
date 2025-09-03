import { useState, useEffect, useCallback } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Target,
  BarChart3,
  RefreshCw
} from "lucide-react"
import { getLibraryMeta, listCards } from '@/lib/firebaseLibraryService'
import { idbGetItem } from "@/lib/indexedDB"

interface TestConfig {
  libraryId: number
  questionType: 'multiple-choice' | 'true-false' | 'fill-blank'
  questionCount: number
  timeLimit: number | null
  showAnswerImmediately: boolean
}

interface Question {
  id: number
  question: string
  options?: string[]
  correctAnswer: string
  userAnswer?: string
  isCorrect?: boolean
}

interface TestResult {
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  score: number
  timeSpent: number
  questions: Question[]
}

export default function Test() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [config, setConfig] = useState<TestConfig | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({})
  const [showAnswer, setShowAnswer] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [startTime] = useState(Date.now())

  const libraryId = id || ''
  const [libraryTitle, setLibraryTitle] = useState<string>('')
  const [loadingLib, setLoadingLib] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!libraryId) return
      const meta = await getLibraryMeta(libraryId)
      if (!cancelled) setLibraryTitle(meta?.title || '')
      const parsedConfig = await idbGetItem<TestConfig>('testConfig')
      if (!parsedConfig) {
        if (!cancelled) navigate(`/dashboard/test-setup/${id}`)
        return
      }
      if (!cancelled) {
        setConfig(parsedConfig)
        setTimeLeft(parsedConfig.timeLimit ? parsedConfig.timeLimit * 60 : null)
      }
      const cards = await listCards(libraryId)
      if (cancelled) return
      const shuffledCards = [...cards].sort(() => Math.random() - 0.5)
      const selectedCards = shuffledCards.slice(0, parsedConfig.questionCount)
      const generatedQuestions = selectedCards.map((card, index) => {
        const question: Question = { id: index, question: card.front, correctAnswer: card.back }
        if (parsedConfig.questionType === 'multiple-choice') {
          const wrongOptions = cards.filter(c => c.id !== card.id).sort(() => Math.random() - 0.5).slice(0, 3).map(c => c.back)
          question.options = [card.back, ...wrongOptions].sort(() => Math.random() - 0.5)
        } else if (parsedConfig.questionType === 'true-false') {
          question.options = ['Đúng', 'Sai']
        }
        return question
      })
      setQuestions(generatedQuestions)
      setLoadingLib(false)
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libraryId])

  const handleFinishTest = useCallback(() => {
    const endTime = Date.now()
    const timeSpent = Math.round((endTime - startTime) / 1000)
    
    let correctCount = 0
    const questionsWithResults = questions.map((question, index) => {
      const userAnswer = userAnswers[index]
      const isCorrect = userAnswer === question.correctAnswer
      if (isCorrect) correctCount++
      
      return {
        ...question,
        userAnswer,
        isCorrect
      }
    })

    const result: TestResult = {
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      incorrectAnswers: questions.length - correctCount,
      score: Math.round((correctCount / questions.length) * 100),
      timeSpent,
      questions: questionsWithResults
    }

    setTestResult(result)
    setTestCompleted(true)
  }, [questions, userAnswers, startTime])

  useEffect(() => {
    // Timer countdown
    if (timeLeft !== null && timeLeft > 0 && !testCompleted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev && prev <= 1) {
            handleFinishTest()
            return 0
          }
          return prev ? prev - 1 : null
        })
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [timeLeft, testCompleted, handleFinishTest])

  const currentQuestion = questions[currentQuestionIndex]

  const handleAnswerSelect = (answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }))

    if (config?.showAnswerImmediately) {
      setShowAnswer(true)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setShowAnswer(false)
    } else {
      handleFinishTest()
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if ((!libraryTitle || loadingLib) && !config) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Target className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Đang tải...</h2>
      </div>
    )
  }

  if (testCompleted && testResult) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link to={`/dashboard/library/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Kết quả kiểm tra</h1>
            <p className="text-muted-foreground">{libraryTitle}</p>
          </div>
        </div>

        {/* Test Results Summary */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold text-primary">{testResult.score}%</div>
              <div className="text-sm text-muted-foreground">Điểm số</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-3xl font-bold text-green-600">{testResult.correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Câu đúng</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <div className="text-3xl font-bold text-red-600">{testResult.incorrectAnswers}</div>
              <div className="text-sm text-muted-foreground">Câu sai</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-3xl font-bold text-blue-600">{formatTime(testResult.timeSpent)}</div>
              <div className="text-sm text-muted-foreground">Thời gian</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Results */}
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết câu trả lời</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {testResult.questions.map((question, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  {question.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium mb-2">
                      Câu {index + 1}: {question.question}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Đáp án của bạn:</span>
                        <Badge variant={question.isCorrect ? "default" : "destructive"}>
                          {question.userAnswer || "Chưa trả lời"}
                        </Badge>
                      </div>
                      {!question.isCorrect && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Đáp án đúng:</span>
                          <Badge variant="default">{question.correctAnswer}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button onClick={() => navigate(`/dashboard/test-setup/${id}`)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm lại
          </Button>
          <Button variant="outline" onClick={() => navigate(`/dashboard/library/${id}`)}>
            Quay về thư viện
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={`/dashboard/test-setup/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Kiểm tra</h1>
            <p className="text-muted-foreground">{libraryTitle}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {timeLeft !== null && (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span className={`font-mono ${timeLeft < 60 ? 'text-red-600' : ''}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
          <Badge variant="outline">
            {currentQuestionIndex + 1} / {questions.length}
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <Progress value={(currentQuestionIndex + 1) / questions.length * 100} className="h-2" />

      {/* Question */}
      {currentQuestion && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Câu {currentQuestionIndex + 1}: {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {config && (config.questionType === 'multiple-choice' || config.questionType === 'true-false') ? (
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <Button
                    key={index}
                    variant={userAnswers[currentQuestionIndex] === option ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto p-4"
                    onClick={() => handleAnswerSelect(option)}
                    disabled={showAnswer}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  className="w-full p-3 border rounded-md"
                  placeholder="Nhập câu trả lời của bạn"
                  value={userAnswers[currentQuestionIndex] || ''}
                  onChange={(e) => handleAnswerSelect(e.target.value)}
                  disabled={showAnswer}
                />
              </div>
            )}

            {showAnswer && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  {userAnswers[currentQuestionIndex] === currentQuestion.correctAnswer ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {userAnswers[currentQuestionIndex] === currentQuestion.correctAnswer ? 'Chính xác!' : 'Sai rồi!'}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Đáp án đúng: <span className="font-medium">{currentQuestion.correctAnswer}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
        >
          Câu trước
        </Button>
        
        <div className="space-x-2">
          {userAnswers[currentQuestionIndex] && (
            <Button onClick={handleNextQuestion}>
              {currentQuestionIndex === questions.length - 1 ? 'Hoàn thành' : 'Câu tiếp'}
            </Button>
          )}
          
          <Button variant="destructive" onClick={handleFinishTest}>
            Nộp bài
          </Button>
        </div>
      </div>
    </div>
  )
}
