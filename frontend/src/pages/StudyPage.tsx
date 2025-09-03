import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { 
  ArrowLeft,
  BookOpen,
  Keyboard,
  Home,
  Library,
  Check,
  X,
  Trophy,
  BarChart3,
  RotateCcw,
  Settings
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
// Firestore services
import { getLibraryMeta, listCards } from "@/lib/firebaseLibraryService"
import { loadProgress, saveProgress } from "@/lib/firebaseProgressService"
import { LearnEngine, type Question, type Result, type Card as LearnCard, type SerializedState } from "@/lib/learnEngine"
import type { LibraryMeta } from "@/lib/models"
import { idbGetItem, idbSetItem } from "@/lib/indexedDB"
import { useAuth } from "@/components/authContext"

export default function StudyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // LearnEngine state
  const [engine, setEngine] = useState<LearnEngine | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [lastResult, setLastResult] = useState<Result | null>(null)
  const [isFinished, setIsFinished] = useState(false)
  
  // UI state
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null)
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number | null>(null)
  
  // New features state
  const [showCardProgress, setShowCardProgress] = useState(false)
  // Toggle show/hide answers in card progress detail
  const [showCardAnswers, setShowCardAnswers] = useState(false)
  // Mode preferences UI state
  const [allowMC, setAllowMC] = useState(true)
  const [allowTyped, setAllowTyped] = useState(true)
  // Auto advance option
  const [autoAdvance, setAutoAdvance] = useState(true)

  // Auth (ensures user loaded)
  // Ensure auth loaded (could extend for access checks later)
  useAuth()

  // Firestore driven state
  const libraryId = id || ''
  const [library, setLibrary] = useState<LibraryMeta | null>(null)
  const [cards, setCards] = useState<LearnCard[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Debounce timer ref for progress save
  // No live Firestore save during answering (only on exit) per requirement

  // Load library metadata & cards from Firestore
  useEffect(() => {
    let cancelled = false
    if (!libraryId) return
    ;(async () => {
      setLoadingData(true)
      setLoadError(null)
      try {
        const meta = await getLibraryMeta(libraryId)
        if (!meta) {
          if (!cancelled) navigate('/dashboard/my-library')
          return
        }
        const c = await listCards(libraryId)
        if (cancelled) return
        setLibrary(meta)
        // adapt to LearnCard (already conforms except id type is string)
        setCards(c.map(card => ({ ...card, domain: meta.subject || card.domain })))
      } catch (e: unknown) {
        const msg = (e as { message?: string })?.message || 'Không tải được dữ liệu'
        if (!cancelled) setLoadError(msg)
      } finally {
        if (!cancelled) setLoadingData(false)
      }
    })()
    return () => { cancelled = true }
  }, [libraryId, navigate])

  // Initialize / restore engine after cards loaded
  useEffect(() => {
    if (loadingData) return
    if (!library) return
    if (!cards.length) return

    const newEngine = new LearnEngine({ cards })

    ;(async () => {
      // Try remote (Firestore) progress first
      let restored = false
      try {
        const remote = await loadProgress(libraryId)
        if (remote) {
          newEngine.restore(remote)
          restored = true
          console.log('Khôi phục tiến độ từ Firestore')
        }
      } catch (e) {
        console.warn('Không thể tải tiến độ Firestore:', e)
      }
      if (!restored) {
        // fallback to local IndexedDB
        try {
          const local = await idbGetItem<unknown>(`study-session-${libraryId}`)
          if (local && typeof local === 'object' && local !== null && 'params' in local && 'states' in local) {
            newEngine.restore(local as SerializedState)
            restored = true
            console.log('Khôi phục tiến độ từ IndexedDB')
          }
        } catch (e) {
          console.warn('Không thể khôi phục từ IndexedDB:', e)
        }
      }

      setEngine(newEngine)
      const q = newEngine.nextQuestion()
      setCurrentQuestion(q)
      if (!q || newEngine.isFinished()) setIsFinished(true)
    })()
  }, [cards, library, libraryId, loadingData])

  // Auto-save session when leaving page or closing browser
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (engine && !isFinished) {
        const serializedState = engine.serialize()
        idbSetItem(`study-session-${libraryId}`, serializedState)
        // best-effort sync remote
  // lưu Firestore chỉ khi thoát
  saveProgress(libraryId, serializedState).catch(()=>{})
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && engine && !isFinished) {
        const serializedState = engine.serialize()
        idbSetItem(`study-session-${libraryId}`, serializedState)
  saveProgress(libraryId, serializedState).catch(()=>{})
      }
    }

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup function
    return () => {
      // Save before cleanup
      if (engine && !isFinished) {
        const serializedState = engine.serialize()
        idbSetItem(`study-session-${libraryId}`, serializedState)
  saveProgress(libraryId, serializedState).catch(()=>{})
      }
      
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [engine, isFinished, libraryId])

  // Sync mode preferences to engine whenever toggled; regenerate only if current mode invalid
  useEffect(() => {
    if (!engine) return

    // Enforce at least one mode
    if (!allowMC && !allowTyped) {
      setAllowMC(true)
      engine.setModePreferences({ mc: true, typed: false })
      return
    }

    engine.setModePreferences({ mc: allowMC, typed: allowTyped })

    // Only regenerate if current question's mode is now disallowed
    if (currentQuestion) {
      const needChange = (
        (currentQuestion.mode === 'MULTIPLE_CHOICE' && !allowMC) ||
        (currentQuestion.mode === 'TYPED_RECALL' && !allowTyped)
      )
      if (needChange) {
        try {
          const regenerated = engine.generateQuestionForCard(currentQuestion.cardId)
          setCurrentQuestion(regenerated)
          setShowResult(false)
          setUserAnswer('')
          setLastResult(null)
          setSelectedOptionIndex(null)
          setCorrectOptionIndex(null)
        } catch {
          const fallback = engine.nextQuestion()
          setCurrentQuestion(fallback)
        }
      }
    }
  }, [allowMC, allowTyped, engine, currentQuestion])

  // Handle answer submission
  let debounceTimer: number | undefined;
  const DEBOUNCE_MS = 4000;
  const handleAnswer = (answer: string | number) => {
    if (!engine || !currentQuestion) return

    let answerToSubmit = answer
    let selectedIndex: number | null = null
    let correctIndex: number | null = null

    // For multiple choice, we need to handle the index mapping
    if (currentQuestion.mode === "MULTIPLE_CHOICE" && typeof answer === "string") {
      // Find the index of the selected option
      selectedIndex = currentQuestion.options.findIndex(option => option === answer)
      
      // Find the correct answer in the options
      const card = cards.find(c => c.id.toString() === currentQuestion.cardId)
      if (card) {
        correctIndex = currentQuestion.options.findIndex(option => option === card.back)
        // Submit the index where 0 means correct answer
        answerToSubmit = selectedIndex === correctIndex ? 0 : selectedIndex
      }
    }

    // Submit answer to engine
    const result = engine.submitAnswer(currentQuestion.cardId, answerToSubmit)

    // Chỉ lưu local trong khi học
    try {
      const serializedState = engine.serialize()
      idbSetItem(`study-session-${libraryId}`, serializedState)
      // debounce remote incremental save
      if (debounceTimer) window.clearTimeout(debounceTimer)
      debounceTimer = window.setTimeout(() => {
        saveProgress(libraryId, serializedState).catch(()=>{})
      }, DEBOUNCE_MS)
    } catch (e) {
      console.warn('Autosave local failed:', e)
    }
    
    // Update UI state
    setLastResult(result)
    setShowResult(true)
    setSelectedOptionIndex(selectedIndex)
    setCorrectOptionIndex(correctIndex)
  }

  // Handle next question
  const handleNext = useCallback(() => {
    if (!engine) return
    setShowResult(false)
    setUserAnswer('')
    setLastResult(null)
    setSelectedOptionIndex(null)
    setCorrectOptionIndex(null)
    const nextQuestion = engine.nextQuestion()
    setCurrentQuestion(nextQuestion)
    if (!nextQuestion || engine.isFinished()) {
      setIsFinished(true)
    }
  }, [engine])

  // Auto advance effect (decoupled for easier toggling)
  useEffect(() => {
    if (showResult && autoAdvance) {
      const t = setTimeout(() => {
        handleNext()
      }, 2000)
      return () => clearTimeout(t)
    }
  }, [showResult, autoAdvance, handleNext])

  // Handle study completion
  const handleFinish = () => {
    if (engine) {
      const serializedState = engine.serialize()
      saveProgress(libraryId, serializedState).catch(()=>{})
      idbSetItem(`study-session-${libraryId}`, serializedState)
    }
    navigate(`/dashboard/library/${id}`)
  }

  // Manual restore session function
  const handleRestoreSession = () => {
    if (!engine) return
    ;(async () => {
      // Try remote first
      try {
        const remote = await loadProgress(libraryId)
        if (remote) {
          engine.restore(remote)
          const q = engine.nextQuestion()
          setCurrentQuestion(q)
          if (!q || engine.isFinished()) setIsFinished(true)
          console.log('Khôi phục phiên từ Firestore')
          return
        }
      } catch (e) {
        console.warn('Không thể khôi phục từ Firestore:', e)
      }
      // fallback local
      const saved = await idbGetItem<unknown>(`study-session-${libraryId}`)
      if (saved && typeof saved === 'object' && saved !== null && 'params' in saved && 'states' in saved) {
        try {
          engine.restore(saved as SerializedState)
          const nextQuestion = engine.nextQuestion()
          setCurrentQuestion(nextQuestion)
          if (!nextQuestion || engine.isFinished()) setIsFinished(true)
          console.log('Khôi phục phiên từ IndexedDB')
        } catch (error) {
          console.error('Không thể khôi phục phiên học tập:', error)
          alert('Không thể khôi phục phiên học tập. Dữ liệu có thể đã bị hỏng.')
        }
      } else {
        alert('Không tìm thấy phiên học tập đã lưu.')
      }
    })()
  }


  // Loading state
  if (loadingData) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard">
                  <Home className="h-4 w-4" />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard/my-library">
                  <Library className="h-4 w-4 mr-2" />
                  Thư viện
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Học tập</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Đang tải dữ liệu...</h2>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard">
                  <Home className="h-4 w-4" />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard/my-library">
                  <Library className="h-4 w-4 mr-2" />
                  Thư viện
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Card className="max-w-xl mx-auto">
          <CardContent className="py-12 text-center space-y-4">
            <h2 className="text-xl font-semibold">Lỗi tải dữ liệu</h2>
            <p className="text-muted-foreground">{loadError}</p>
            <Button onClick={() => window.location.reload()}>Thử lại</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!library) return null

  // Finished state
  if (isFinished) {
    const progress = engine?.getProgressDetailed()
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard">
                  <Home className="h-4 w-4" />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard/my-library">
                  <Library className="h-4 w-4 mr-2" />
                  Thư viện
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/dashboard/library/${id}`}>
                  {library.title}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Học tập</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="text-center py-12">
            <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">🎉 Chúc mừng!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Bạn đã hoàn thành việc học tập với {library.title}
            </p>
            
            {progress && (
              <div className="space-y-6">
                {/* Main Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">{progress.total}</div>
                    <div className="text-sm text-blue-700">Tổng thuật ngữ</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">{progress.masteryLevels.level5.count}</div>
                    <div className="text-sm text-green-700">Đã thành thạo</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">{Math.round(progress.accuracyOverall * 100)}%</div>
                    <div className="text-sm text-purple-700">Độ chính xác</div>
                  </div>
                </div>

                {/* Mastery Level Breakdown */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Phân tích mức độ thành thạo</h3>
                  <div className="grid grid-cols-6 gap-3 text-center">
                    <div className="bg-gray-200 rounded p-3">
                      <div className="text-lg font-bold text-gray-600">{progress.masteryLevels.level0.count}</div>
                      <div className="text-xs text-gray-500">Lv 0</div>
                      <div className="text-xs text-gray-500">{progress.masteryLevels.level0.percent}%</div>
                    </div>
                    <div className="bg-red-100 rounded p-3">
                      <div className="text-lg font-bold text-red-600">{progress.masteryLevels.level1.count}</div>
                      <div className="text-xs text-red-500">Lv 1</div>
                      <div className="text-xs text-red-500">{progress.masteryLevels.level1.percent}%</div>
                    </div>
                    <div className="bg-orange-100 rounded p-3">
                      <div className="text-lg font-bold text-orange-600">{progress.masteryLevels.level2.count}</div>
                      <div className="text-xs text-orange-500">Lv 2</div>
                      <div className="text-xs text-orange-500">{progress.masteryLevels.level2.percent}%</div>
                    </div>
                    <div className="bg-yellow-100 rounded p-3">
                      <div className="text-lg font-bold text-yellow-600">{progress.masteryLevels.level3.count}</div>
                      <div className="text-xs text-yellow-600">Lv 3</div>
                      <div className="text-xs text-yellow-600">{progress.masteryLevels.level3.percent}%</div>
                    </div>
                    <div className="bg-blue-100 rounded p-3">
                      <div className="text-lg font-bold text-blue-600">{progress.masteryLevels.level4.count}</div>
                      <div className="text-xs text-blue-500">Lv 4</div>
                      <div className="text-xs text-blue-500">{progress.masteryLevels.level4.percent}%</div>
                    </div>
                    <div className="bg-green-100 rounded p-3">
                      <div className="text-lg font-bold text-green-600">{progress.masteryLevels.level5.count}</div>
                      <div className="text-xs text-green-500">Lv 5</div>
                      <div className="text-xs text-green-500">{progress.masteryLevels.level5.percent}%</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col items-center gap-4 mt-8">
              <Button onClick={handleFinish} size="lg" className="w-60">
                Quay lại thư viện
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-60"
                onClick={() => {
                  if (!library) return;
                  // clear local session & restart fresh
                  // remove previous serialized session
                  idbSetItem(`study-session-${libraryId}`, undefined as unknown as never).catch(()=>{});
                  const fresh = new LearnEngine({ cards });
                  setEngine(fresh);
                  const q = fresh.nextQuestion();
                  setCurrentQuestion(q);
                  setIsFinished(!q || fresh.isFinished());
                }}
              >
                Học lại từ đầu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No current question
  if (!currentQuestion) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard">
                  <Home className="h-4 w-4" />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard/my-library">
                  <Library className="h-4 w-4 mr-2" />
                  Thư viện
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/dashboard/library/${id}`}>
                  {library.title}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Học tập</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="text-center py-12">
          <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Đang khởi tạo...</h2>
          <p className="text-muted-foreground">
            Vui lòng đợi trong giây lát
          </p>
        </div>
      </div>
    )
  }

  const progress = engine?.getProgressDetailed()

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard">
                <Home className="h-4 w-4" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard/my-library">
                Thư viện
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/dashboard/library-detail/${id}`}>
                {library.title}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Học tập</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={`/dashboard/library/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Học với {library.title}</h1>
            <p className="text-muted-foreground">
              Thuật toán học tập thích ứng - {currentQuestion.mode === "MULTIPLE_CHOICE" ? "Trắc nghiệm" : "Đánh máy"}
            </p>
          </div>
        </div>
        
        {/* Study Options Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-sm font-medium">Tùy chọn học tập</div>
                <p className="text-xs text-muted-foreground">Bật / tắt chế độ câu hỏi</p>
              </div>
              <div className="space-y-3">
                <Switch
                  checked={allowMC}
                  onCheckedChange={(v) => setAllowMC(!!v)}
                  label="Trắc nghiệm"
                />
                <Switch
                  checked={allowTyped}
                  onCheckedChange={(v) => setAllowTyped(!!v)}
                  label="Viết đáp án"
                />
                <Switch
                  checked={autoAdvance}
                  onCheckedChange={(v) => setAutoAdvance(!!v)}
                  label="Tự chuyển câu"
                />
              </div>
              <div className="pt-2 border-t space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRestoreSession}
                  className="w-full justify-start"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Khôi phục phiên
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowCardProgress(!showCardProgress)}
                  className="w-full justify-start"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {showCardProgress ? "Ẩn chi tiết" : "Xem chi tiết"}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Phiên được tự động lưu. Ít nhất một chế độ phải bật.
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Progress */}
      {progress && (
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Tiến độ học tập</span>
              <span>{progress.masteryLevels.level5.count}/{progress.total} thuật ngữ đã thành thạo ({progress.percentMastered}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress.percentMastered}%` }}
              />
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            Độ chính xác: {Math.round(progress.accuracyOverall * 100)}% • Đã thành thạo: {progress.masteryLevels.level5.count}/{progress.total}
          </div>
        </div>
      )}

      {/* Question Card */}
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
            
            {engine && (() => {
              const cardState = engine.getCardState(currentQuestion.cardId)
              if (cardState) {
                return (
                  <div className="flex items-center space-x-2">
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
            <h2 className="text-2xl font-bold mb-4">{currentQuestion.prompt}</h2>
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
                  <h3 className="text-2xl font-bold text-green-600">
                    {lastResult === "Correct" ? "Chính xác!" : "Gần đúng!"}
                  </h3>
                  {lastResult === "CorrectMinor" && (
                    <p className="text-muted-foreground">
                      Có sai chính tả nhỏ nhưng vẫn được chấp nhận
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <X className="h-16 w-16 text-red-500 mx-auto" />
                  <h3 className="text-2xl font-bold text-red-600">Chưa đúng!</h3>
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

      {/* Stats Card */}
      {progress && (
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-4">
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{progress.total}</div>
                <div className="text-sm text-muted-foreground">Tổng thuật ngữ</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{progress.masteryLevels.level5.count}</div>
                <div className="text-sm text-muted-foreground">Đã thành thạo</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{progress.masteryLevels.level1.count + progress.masteryLevels.level2.count + progress.masteryLevels.level3.count + progress.masteryLevels.level4.count}</div>
                <div className="text-sm text-muted-foreground">Đang học</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{Math.round(progress.accuracyOverall * 100)}%</div>
                <div className="text-sm text-muted-foreground">Độ chính xác</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card Progress Detail - Using getCardProgress() */}
      {showCardProgress && engine && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Chi tiết tiến độ từng thẻ
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCardAnswers(v => !v)}
                >
                  {showCardAnswers ? 'Ẩn đáp án' : 'Hiện đáp án'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Using getCardProgress() */}
              {engine.getCardProgress().map((cardProgress) => {
                const currentState = engine.getCardState(cardProgress.id) // Using getCardState()
                return (
                  <div key={cardProgress.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-semibold">{cardProgress.front}</div>
                        <div className="text-sm text-muted-foreground">
                          {showCardAnswers ? (
                            cardProgress.back
                          ) : (
                            <span className="select-none tracking-wider opacity-70">••••••</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 ml-4">
                        <Badge variant={cardProgress.mastery >= 5 ? "default" : "outline"}>
                          Lv {cardProgress.mastery}
                        </Badge>
                        {cardProgress.wrongCount > 0 && (
                          <Badge variant="destructive">
                            {cardProgress.wrongCount} sai
                          </Badge>
                        )}
                        <Badge variant="outline">
                          Seen: {cardProgress.seenCount}
                        </Badge>
                        {currentState && (
                          <Badge variant="outline">
                            Next: {currentState.nextDue}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress bar for this card */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          cardProgress.mastery >= 5 ? 'bg-green-500' : 
                          cardProgress.mastery >= 3 ? 'bg-blue-500' :
                          cardProgress.mastery >= 1 ? 'bg-orange-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${(cardProgress.mastery / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              
              {/* Summary using getAllCardStates() */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold mb-2">Tổng quan trạng thái</h4>
                <div className="text-sm text-muted-foreground">
                  Tổng số thẻ: {engine.getAllCardStates().length} | 
                  Đã hoàn thành: {engine.getAllCardStates().filter(state => state.mastery >= 5).length} | 
                  Trung bình mastery: {(engine.getAllCardStates().reduce((sum, state) => sum + state.mastery, 0) / engine.getAllCardStates().length).toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
