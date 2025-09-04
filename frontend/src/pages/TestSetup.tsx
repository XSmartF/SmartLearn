import { useState } from "react"
import { H1, H3 } from '@/components/ui/typography';
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
import { libraryRepository } from '@/lib/repositories/LibraryRepository'
import { cardRepository } from '@/lib/repositories/CardRepository'
import { idbSetItem } from "@/lib/indexedDB"
import { loadTestQuestionGenerator } from '@/lib/lazyModules'

export default function TestSetup() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [questionTypes, setQuestionTypes] = useState<Array<'multiple-choice' | 'true-false' | 'fill-blank'>>(['multiple-choice'])
  const [questionCount, setQuestionCount] = useState(10)
  const [questionCountInput, setQuestionCountInput] = useState('10')
  const [timeLimit, setTimeLimit] = useState<number | null>(null)
  const [hasTimeLimit, setHasTimeLimit] = useState(false)
  const [showAnswerImmediately, setShowAnswerImmediately] = useState(false)

  const libraryId = id || ''
  const [libraryTitle, setLibraryTitle] = useStateReact<string>('')
  const [cardCountState, setCardCountState] = useStateReact<number>(0)
  const [cards, setCards] = useStateReact<{id:string; front:string; back:string}[]>([])
  const [selectedCardIds, setSelectedCardIds] = useStateReact<Set<string>>(new Set())
  const [showCardPicker, setShowCardPicker] = useStateReact(false)
  const [cardSearch, setCardSearch] = useStateReact('')
  const [loadingLib, setLoadingLib] = useStateReact(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!libraryId) return
      setLoadingLib(true)
  const meta = await libraryRepository.getLibraryMeta(libraryId)
      if (!cancelled) {
        if (meta) {
          setLibraryTitle(meta.title)
          // Nếu meta.cardCount có sẵn dùng luôn; nếu chưa chính xác thì đếm thực tế
          if (meta.cardCount) setCardCountState(meta.cardCount)
          const cardsFetched = await cardRepository.listCards(libraryId)
          if (!cancelled) {
            setCardCountState(cardsFetched.length)
            setCards(cardsFetched)
          }
        } else {
          setLibraryTitle('')
        }
        setLoadingLib(false)
      }
    })()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libraryId])
  // Derived values & auto adjust before any conditional return
  const effectiveCardPoolSize = selectedCardIds.size ? selectedCardIds.size : cardCountState
  const maxQuestions = Math.min(effectiveCardPoolSize || 0, 200)
  useEffect(()=>{
    if (!loadingLib && effectiveCardPoolSize > 0 && questionCount > effectiveCardPoolSize) {
      setQuestionCount(effectiveCardPoolSize)
      setQuestionCountInput(String(effectiveCardPoolSize))
    }
  }, [loadingLib, effectiveCardPoolSize, questionCount])

  if (!loadingLib && !libraryTitle) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Target className="h-16 w-16 text-muted-foreground mb-4" />
  <H3 className="text-2xl font-semibold mb-2">Không tìm thấy thư viện</H3>
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

  const questionTypeOptions = [
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

  const handleStartTest = async () => {
    if (loadingLib || cardCountState === 0) return
    if (questionTypes.length === 0) return
    const adjustedCount = Math.min(questionCount, cardCountState)
    const testConfig = {
      libraryId, // string id cho thống nhất
      questionTypes,
      questionCount: adjustedCount,
      timeLimit: hasTimeLimit ? timeLimit : null,
      showAnswerImmediately,
      selectedCardIds: selectedCardIds.size ? Array.from(selectedCardIds) : null
    }
    // Đảm bảo lưu xong rồi mới chuyển trang để tránh race-condition đọc null
    try {
      await idbSetItem('testConfig', testConfig)
    } catch (e) {
      console.warn('IndexedDB lưu thất bại, dùng fallback sessionStorage', e)
    }
    try {
      sessionStorage.setItem('testConfig', JSON.stringify(testConfig))
    } catch { /* ignore sessionStorage failure */ }
    try {
      localStorage.setItem('testConfigBackup', JSON.stringify(testConfig))
    } catch { /* ignore localStorage failure */ }
    navigate(`/dashboard/test/${id}`)
  }

  // (moved derived values & effect above)

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
          <H1 className="text-3xl font-bold">Cài đặt kiểm tra</H1>
          <p className="text-muted-foreground text-sm">
            {loadingLib ? 'Đang tải...' : `${libraryTitle} • ${cardCountState} thẻ`}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Question Type Selection (Multi) */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Dạng câu hỏi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {questionTypeOptions.map((type) => {
              const id = type.id as 'multiple-choice' | 'true-false' | 'fill-blank'
              const active = questionTypes.includes(id)
              return (
                <div
                  key={type.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors min-h-[80px] flex items-center ${
                    active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => {
                    setQuestionTypes(prev => {
                      if (prev.includes(id)) {
                        const next = prev.filter(t => t !== id)
                        return next.length ? next : prev // giữ ít nhất 1 dạng
                      }
                      return [...prev, id]
                    })
                  }}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <type.icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium flex items-center gap-2">{type.name}{active && <span className="text-xs px-2 py-0.5 bg-primary/10 rounded-full text-primary">Chọn</span>}</div>
                      <div className="text-sm text-muted-foreground leading-tight">{type.description}</div>
                    </div>
                  </div>
                </div>
              )
            })}
            <p className="text-xs text-muted-foreground">Nhấp để bật/tắt. Cần ít nhất 1 dạng.</p>
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
                value={questionCountInput}
                onChange={(e) => {
                  const val = e.target.value
                  setQuestionCountInput(val)
                  if (val === '') return // cho phép xóa tạm thời
                  const parsed = parseInt(val, 10)
                  if (!isNaN(parsed)) {
                    const bounded = Math.min(Math.max(parsed, 1), maxQuestions || 1)
                    setQuestionCount(bounded)
                  }
                }}
                onBlur={()=>{
                  if (questionCountInput === '' || parseInt(questionCountInput,10) < 1) {
                    const fallback = Math.min(1, maxQuestions || 1)
                    setQuestionCount(fallback)
                    setQuestionCountInput(String(fallback))
                  } else if (parseInt(questionCountInput,10) !== questionCount) {
                    // đồng bộ nếu người dùng nhập vượt quá giới hạn
                    const bounded = Math.min(Math.max(parseInt(questionCountInput,10),1), maxQuestions || 1)
                    setQuestionCount(bounded)
                    setQuestionCountInput(String(bounded))
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Tối đa {maxQuestions} câu hỏi từ thư viện này
              </p>
              {questionCountInput === '' && (
                <p className="text-xs text-amber-600">Nhập số lượng rồi rời khỏi ô để xác nhận.</p>
              )}
              {questionCountInput !== '' && parseInt(questionCountInput,10) > (maxQuestions||0) && (
                <p className="text-xs text-red-600">Vượt quá tối đa, sẽ tự giảm về {maxQuestions}.</p>
              )}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg flex flex-col items-center justify-center gap-1 min-h-[110px] text-center">
              <div className="text-3xl font-bold text-primary leading-none">{questionCountInput === '' ? '-' : questionCount}</div>
              <div className="text-xs text-muted-foreground tracking-wide">CÂU HỎI</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg flex flex-col items-center justify-center gap-2 min-h-[110px] text-center">
              <div className="text-sm font-semibold text-primary leading-snug">
                {questionTypes.map(t => questionTypeOptions.find(o=>o.id===t)?.name).filter(Boolean).join(' • ')}
              </div>
              <div className="text-xs text-muted-foreground tracking-wide">DẠNG</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg flex flex-col items-center justify-center gap-1 min-h-[110px] text-center">
              <div className="text-2xl font-bold text-primary flex items-center gap-1 leading-none">
                <Clock className="h-5 w-5" /> {hasTimeLimit ? `${timeLimit}p` : '∞'}
              </div>
              <div className="text-xs text-muted-foreground tracking-wide">THỜI GIAN</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg flex flex-col items-center justify-center gap-1 min-h-[110px] text-center">
              <div className="text-2xl font-bold text-primary leading-none">{showAnswerImmediately ? 'Có' : 'Không'}</div>
              <div className="text-xs text-muted-foreground tracking-wide text-center">HIỆN ĐÁP ÁN</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg flex flex-col items-center justify-center gap-1 min-h-[110px] text-center">
              <div className="text-3xl font-bold text-primary leading-none">{selectedCardIds.size || cardCountState}</div>
              <div className="text-xs text-muted-foreground tracking-wide">PHẠM VI</div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Card Picker */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" /> Chọn thuật ngữ (tuỳ chọn)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>Giới hạn phạm vi kiểm tra bằng cách chọn các thẻ cụ thể. Nếu bỏ trống sẽ dùng toàn bộ.</span>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <Input
              placeholder="Tìm kiếm mặt trước..."
              value={cardSearch}
              onChange={e=>setCardSearch(e.target.value)}
              className="w-60"
            />
            <Button variant="outline" size="sm" onClick={()=>setShowCardPicker(s=>!s)}>
              {showCardPicker ? 'Ẩn danh sách' : 'Hiện danh sách'}
            </Button>
            <Button variant="outline" size="sm" onClick={()=>{
              if (selectedCardIds.size) setSelectedCardIds(new Set())
              else setSelectedCardIds(new Set(cards.map(c=>c.id)))
            }} disabled={!cards.length}>{selectedCardIds.size? 'Bỏ chọn tất cả' : 'Chọn tất cả'}</Button>
          </div>
          {showCardPicker && (
            <div className="border rounded-md max-h-64 overflow-y-auto divide-y">
              {cards
                .filter(c=>!cardSearch || c.front.toLowerCase().includes(cardSearch.toLowerCase()))
                .map(c=>{
                  const active = selectedCardIds.has(c.id)
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={()=>setSelectedCardIds(prev=>{ const n = new Set(prev); if(n.has(c.id)) n.delete(c.id); else n.add(c.id); return n; })}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between ${active? 'bg-primary/10' : 'hover:bg-muted/50'}`}
                    >
                      <span className="truncate max-w-[70%]">{c.front}</span>
                      {active && <span className="text-primary text-xs">Đã chọn</span>}
                    </button>
                  )
                })}
              {!cards.length && <div className="p-3 text-sm text-muted-foreground">Chưa có thẻ.</div>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Start Test Button */}
      <div className="flex flex-col items-center gap-2">
        {cardCountState === 0 && !loadingLib && (
          <div className="text-sm text-red-500">Thư viện chưa có thẻ nào – hãy thêm thẻ trước khi kiểm tra.</div>
        )}
        <Button
          size="lg"
          onClick={handleStartTest}
          onMouseEnter={() => { loadTestQuestionGenerator().catch(()=>{}) }}
          onFocus={() => { loadTestQuestionGenerator().catch(()=>{}) }}
          className="px-8"
          disabled={loadingLib || cardCountState === 0 || questionTypes.length === 0 || questionCountInput === ''}
        >
          <Play className="h-5 w-5 mr-2" />
          Bắt đầu kiểm tra
        </Button>
      </div>
    </div>
  )
}
