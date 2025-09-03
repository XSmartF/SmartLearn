import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  Settings,
  Play
} from "lucide-react"
import { useEffect, useState as useStateReact } from 'react'
import { getLibraryMeta, listCards } from '@/lib/firebaseLibraryService'
import { idbSetItem } from "@/lib/indexedDB"

export default function TestSetup() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'true-false' | 'fill-blank'>('multiple-choice')
  const [questionCount, setQuestionCount] = useState(10)
  const [timeLimit, setTimeLimit] = useState<number | null>(null)
  const [hasTimeLimit, setHasTimeLimit] = useState(false)
  const [showAnswerImmediately, setShowAnswerImmediately] = useState(false)

  const libraryId = id || ''
  const [libraryTitle, setLibraryTitle] = useStateReact<string>('')
  const [cardCountState, setCardCountState] = useStateReact<number>(0)
  const [loadingLib, setLoadingLib] = useStateReact(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!libraryId) return
      setLoadingLib(true)
      const meta = await getLibraryMeta(libraryId)
      if (!cancelled) {
        if (meta) {
          setLibraryTitle(meta.title)
          // Nếu meta.cardCount có sẵn dùng luôn; nếu chưa chính xác thì đếm thực tế
          if (meta.cardCount) setCardCountState(meta.cardCount)
          const cards = await listCards(libraryId)
          if (!cancelled) setCardCountState(cards.length)
        } else {
          setLibraryTitle('')
        }
        setLoadingLib(false)
      }
    })()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libraryId])

  if (!loadingLib && !libraryTitle) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Target className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Không tìm thấy thư viện</h2>
        <p className="text-muted-foreground mb-4">
          Thư viện với ID "{id}" không tồn tại.
        </p>
        <Link to="/dashboard/my-library">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay về thư viện
          </Button>
        </Link>
      </div>
    )
  }

  const questionTypes = [
    {
      id: 'multiple-choice',
      name: 'Trắc nghiệm',
      description: 'Chọn đáp án đúng từ 4 lựa chọn',
      icon: CheckCircle
    },
    {
      id: 'true-false',
      name: 'Đúng/Sai',
      description: 'Xác định câu trả lời đúng hay sai',
      icon: AlertCircle
    },
    {
      id: 'fill-blank',
      name: 'Điền từ',
      description: 'Điền từ còn thiếu vào chỗ trống',
      icon: Target
    }
  ]

  const handleStartTest = () => {
    const testConfig = {
      libraryId,
      questionType,
      questionCount,
      timeLimit: hasTimeLimit ? timeLimit : null,
      showAnswerImmediately
    }
    
  // Lưu cấu hình test vào IndexedDB
  idbSetItem('testConfig', testConfig)
    
    // Chuyển đến trang kiểm tra
    navigate(`/dashboard/test/${id}`)
  }

  const maxQuestions = Math.min(cardCountState, 50)

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
          <h1 className="text-3xl font-bold">Cài đặt kiểm tra</h1>
          <p className="text-muted-foreground text-sm">
            {loadingLib ? 'Đang tải...' : `${libraryTitle} • ${cardCountState} thẻ`}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Question Type Selection */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Dạng câu hỏi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {questionTypes.map((type) => (
              <div
                key={type.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors min-h-[80px] flex items-center ${
                  questionType === type.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setQuestionType(type.id as 'multiple-choice' | 'true-false' | 'fill-blank')}
              >
                <div className="flex items-start space-x-3 w-full">
                  <type.icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                    questionType === type.id ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{type.name}</div>
                    <div className="text-sm text-muted-foreground leading-tight">{type.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Test Configuration */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Cấu hình kiểm tra
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question Count */}
            <div className="space-y-2">
              <Label htmlFor="questionCount">Số câu hỏi</Label>
              <Input
                id="questionCount"
                type="number"
                min="1"
                max={maxQuestions}
                value={questionCount}
                onChange={(e) => setQuestionCount(Math.min(parseInt(e.target.value) || 1, maxQuestions))}
              />
              <p className="text-xs text-muted-foreground">
                Tối đa {maxQuestions} câu hỏi từ thư viện này
              </p>
            </div>

            <Separator />

            {/* Time Limit */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Giới hạn thời gian</Label>
                <Button
                  variant={hasTimeLimit ? "default" : "outline"}
                  size="sm"
                  onClick={() => setHasTimeLimit(!hasTimeLimit)}
                >
                  {hasTimeLimit ? "Có" : "Vô hạn"}
                </Button>
              </div>
              
              {hasTimeLimit && (
                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Thời gian (phút)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="1"
                    max="180"
                    value={timeLimit || 15}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value) || 15)}
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Show Answer Immediately */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Hiển thị đáp án ngay lập tức</Label>
                  <p className="text-xs text-muted-foreground">
                    Xem đúng/sai ngay sau khi trả lời
                  </p>
                </div>
                <Button
                  variant={showAnswerImmediately ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAnswerImmediately(!showAnswerImmediately)}
                >
                  {showAnswerImmediately ? "Bật" : "Tắt"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Tóm tắt kiểm tra</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{questionCount}</div>
              <div className="text-sm text-muted-foreground">Câu hỏi</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {questionTypes.find(t => t.id === questionType)?.name}
              </div>
              <div className="text-sm text-muted-foreground">Dạng câu hỏi</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                <Clock className="h-5 w-5" />
                {hasTimeLimit ? `${timeLimit}p` : '∞'}
              </div>
              <div className="text-sm text-muted-foreground">Thời gian</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {showAnswerImmediately ? 'Có' : 'Không'}
              </div>
              <div className="text-sm text-muted-foreground">Xem đáp án ngay</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Test Button */}
      <div className="flex justify-center">
        <Button size="lg" onClick={handleStartTest} className="px-8">
          <Play className="h-5 w-5 mr-2" />
          Bắt đầu kiểm tra
        </Button>
      </div>
    </div>
  )
}
