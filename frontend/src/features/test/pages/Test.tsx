import { useState, useEffect, useCallback, startTransition } from "react"
import { H1, H3 } from '@/shared/components/ui/typography'
import { useParams, Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Progress } from "@/shared/components/ui/progress"
import { Badge } from "@/shared/components/ui/badge"
import { getLibraryDetailPath, getTestSetupPath } from '@/shared/constants/routes'
import { 
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Target,
  BarChart3,
  RefreshCw
} from "lucide-react"
import { libraryRepository } from '@/shared/lib/repositories/LibraryRepository'
import { cardRepository } from '@/shared/lib/repositories/CardRepository'
import { loadTestQuestionGenerator } from '@/shared/lib/lazyModules'
import { idbGetItem } from "@/shared/lib/indexedDB"

interface TestConfig {
  libraryId: string
  questionTypes: Array<'multiple-choice' | 'true-false' | 'fill-blank'>
  questionCount: number
  timeLimit: number | null
  showAnswerImmediately: boolean
  selectedCardIds: string[] | null
}

interface Question {
  id: number
  type: 'multiple-choice' | 'true-false' | 'fill-blank'
  question: string
  options?: string[]
  correctAnswer: string // For true-false this will be 'Đúng' or 'Sai'
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
  const meta = await libraryRepository.getLibraryMeta(libraryId)
      if (!cancelled) setLibraryTitle(meta?.title || '')
      // Load test config với retry & fallback
      async function loadConfig(): Promise<TestConfig | null> {
        const fromIDB = await idbGetItem<TestConfig>('testConfig')
        if (fromIDB) return fromIDB
        // Fallback sessionStorage
        try {
          const ss = sessionStorage.getItem('testConfig')
          if (ss) return JSON.parse(ss)
  } catch { /* ignore sessionStorage parse */ }
        try {
          const ls = localStorage.getItem('testConfigBackup')
          if (ls) return JSON.parse(ls)
  } catch { /* ignore localStorage parse */ }
        return null
      }
      let parsedConfig = await loadConfig()
      if (!parsedConfig) {
        // Retry nhẹ sau 150ms phòng race-condition lưu async
        await new Promise(r => setTimeout(r, 150))
        parsedConfig = await loadConfig()
      }
      if (!parsedConfig) {
        if (!cancelled && id) navigate(getTestSetupPath(id))
        return
      }
      // Backward compatibility: single questionType -> array
      type Legacy = TestConfig & { questionType?: 'multiple-choice' | 'true-false' | 'fill-blank' }
      const legacy = parsedConfig as Legacy
      if (legacy.questionType && !legacy.questionTypes) {
        parsedConfig = { ...legacy, questionTypes: [legacy.questionType] }
      }
      if (!cancelled) {
        setConfig(parsedConfig as TestConfig)
        setTimeLeft(parsedConfig.timeLimit ? parsedConfig.timeLimit * 60 : null)
      }
  const cards = await cardRepository.listCards(libraryId)
      if (cancelled) return
  // Dynamic import question generator to split bundle
  const { generateQuestions } = await loadTestQuestionGenerator()
      const generated = generateQuestions(parsedConfig, cards)
      startTransition(() => {
        setQuestions(generated as Question[])
      })
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
  // Số câu đã trả lời (bỏ qua câu nhập còn trống)
  const answeredCount = questions.reduce((acc, _q, i) => {
    const val = userAnswers[i]
    if (val !== undefined && val !== '') return acc + 1
    return acc
  }, 0)

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

  // Hiển thị màn hình tạo bài kiểm tra cho đến khi đã sinh xong danh sách câu hỏi (tránh nháy header + progress trước câu hỏi)
  if (loadingLib) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Target className="h-16 w-16 text-muted-foreground mb-4 animate-pulse" />
  <H3 className="text-2xl font-semibold mb-2">Đang tạo bài kiểm tra...</H3>
        <p className="text-sm text-muted-foreground">Vui lòng đợi trong giây lát</p>
      </div>
    )
  }

  // Trường hợp không có câu hỏi (vd thư viện rỗng) -> hiển thị thông báo thân thiện
  if (config && questions.length === 0 && !loadingLib && !testCompleted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Target className="h-16 w-16 text-muted-foreground" />
  <H3 className="text-xl font-semibold">Không thể tạo câu hỏi</H3>
        <p className="text-muted-foreground text-sm">Thư viện chưa có thẻ nào. Hãy thêm thẻ rồi thử lại.</p>
        <div className="flex gap-2">
          <Button onClick={() => id && navigate(getLibraryDetailPath(id))}>Quay lại thư viện</Button>
          <Button variant="outline" onClick={() => id && navigate(getTestSetupPath(id))}>Cài đặt lại</Button>
        </div>
      </div>
    )
  }

  if (testCompleted && testResult) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link to={id ? getLibraryDetailPath(id) : '#'}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <H1 className="text-3xl font-bold">Kết quả kiểm tra</H1>
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
          <Button onClick={() => id && navigate(getTestSetupPath(id))}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm lại
          </Button>
          <Button variant="outline" onClick={() => id && navigate(getLibraryDetailPath(id))}>
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
          <Link to={id ? getTestSetupPath(id) : '#'}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <H1 className="text-2xl font-bold">Kiểm tra</H1>
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

  {/* Progress: số câu đã làm / tổng số câu */}
  <div className="space-y-1">
    <Progress value={questions.length > 0 ? (answeredCount / questions.length) * 100 : 0} className="h-2" />
    <div className="text-xs text-muted-foreground">Đã làm {answeredCount}/{questions.length}</div>
  </div>

      {/* Question Navigator */}
      {questions.length > 1 && (
        <div className="flex flex-wrap gap-2 border rounded-md p-3 bg-muted/30">
          {questions.map((_, i) => {
            const rawAnswer = userAnswers[i]
            const answered = rawAnswer !== undefined && rawAnswer !== ''
            const isCurrent = i === currentQuestionIndex
            return (
              <Button
                key={i}
                type="button"
                onClick={() => setCurrentQuestionIndex(i)}
                variant={answered ? 'default' : 'outline'}
                className={`w-8 h-8 p-0 text-xs font-medium flex items-center justify-center ${isCurrent ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                aria-label={`Tới câu ${i + 1}${answered ? ' (đã trả lời)' : ''}`}
              >
                {i + 1}
              </Button>
            )
          })}
        </div>
      )}

      {/* Question */}
      {currentQuestion && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Câu {currentQuestionIndex + 1}: {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion && (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false') ? (
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
