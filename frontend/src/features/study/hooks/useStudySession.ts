import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/shared/hooks/useAuthRedux'
import { libraryRepository } from '@/shared/lib/repositories/LibraryRepository'
import { cardRepository } from '@/shared/lib/repositories/CardRepository'
import { loadProgress, saveProgress } from '@/shared/lib/firebase'
import { idbGetItem, idbSetItem } from '@/shared/lib/indexedDB'
import { consumeReviewSession } from '@/shared/constants/review'
import { scheduleAutoReview } from '@/shared/lib/reviewScheduler'
import { STUDY_DIFFICULTY_CHOICES } from '@/features/study/constants/difficulty'
import { useStudyPreferences } from '@/features/study/hooks/useStudyPreferences'
import type { LibraryMeta } from '@/shared/lib/models'
import type {
  DifficultyMeta,
  LearnEngine as LearnEngineType,
  Question,
  Result,
  SerializedState,
  Card as LearnCard
} from '@/features/study/utils/learnEngine'
import type { ReviewDifficultyChoice } from '@/shared/lib/reviewScheduler'
import { ROUTES, getLibraryDetailPath } from '@/shared/constants/routes'

export type StudySessionStatus = 'loading' | 'error' | 'ready' | 'finished'

export interface StudyReviewContext {
  cardIds: string[]
  missingCount: number
}

export interface StudyHeaderModel {
  context: {
    library: LibraryMeta
    libraryId: string
    currentQuestion: Question | null
  }
  settings: ReturnType<typeof useStudyPreferences>['preferences']
  handlers: ReturnType<typeof useStudyPreferences>['handlers'] & {
    resetSession: () => void
  }
}

export interface StudyQuestionCardModel {
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
  difficultyChoices: typeof STUDY_DIFFICULTY_CHOICES
  onDifficultyChoice: (choice: ReviewDifficultyChoice) => void
  submittingChoice: ReviewDifficultyChoice | null
}

export interface StudyCardProgressModel {
  engine: LearnEngineType
  showCardAnswers: boolean
  setShowCardAnswers: (value: boolean) => void
}

export interface StudyStatsModel {
  engine: LearnEngineType
  progress: ReturnType<LearnEngineType['getProgressDetailed']>
}

export interface StudyFinishedModel {
  handleFinish: () => void
  handleResetSession: () => void
}

export interface StudySessionViewModel {
  status: StudySessionStatus
  errorMessage: string | null
  library: LibraryMeta | null
  reviewContext: StudyReviewContext | null
  header: StudyHeaderModel | null
  questionCard: StudyQuestionCardModel | null
  cardProgress: StudyCardProgressModel | null
  stats: StudyStatsModel | null
  finished: StudyFinishedModel | null
  isAutoAdvanceActive: boolean
  isRatingRequired: boolean
  isLoadingInitialData: boolean
}

export interface UseStudySessionParams {
  libraryId: string
  isReviewSession: boolean
}

const DEBOUNCE_MS = 4000

export function useStudySession({ libraryId, isReviewSession }: UseStudySessionParams): StudySessionViewModel {
  const navigate = useNavigate()
  useAuth()
  const { preferences, handlers: preferenceHandlers } = useStudyPreferences()
  const {
    allowMC,
    allowTyped,
    autoAdvance,
    showCardProgress,
    autoRead,
    readLanguage,
    answerSide
  } = preferences
  const {
    setAllowMC,
    setAllowTyped,
    setAutoAdvance,
    setShowCardProgress,
    setAutoRead,
    setReadLanguage,
    setAnswerSide
  } = preferenceHandlers

  const [engine, setEngine] = useState<LearnEngineType | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [lastResult, setLastResult] = useState<Result | null>(null)
  const [isFinished, setIsFinished] = useState(false)
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null)
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number | null>(null)
  const [submittingChoice, setSubmittingChoice] = useState<ReviewDifficultyChoice | null>(null)
  const [library, setLibrary] = useState<LibraryMeta | null>(null)
  const [cards, setCards] = useState<LearnCard[]>([])
  const [reviewContext, setReviewContext] = useState<StudyReviewContext | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showCardAnswers, setShowCardAnswers] = useState(false)

  const lastAppliedSideRef = useRef<'front' | 'back'>('back')
  const debounceTimerRef = useRef<number | undefined>(undefined)

  const currentCardId = currentQuestion?.cardId
  const currentDifficultyMeta: DifficultyMeta | null = currentCardId && engine ? engine.getDifficultyMeta(currentCardId) : null
  const mustRateBeforeNext = currentDifficultyMeta?.shouldPrompt ?? false
  const effectiveAutoAdvance = autoAdvance && submittingChoice === null


  const speakQuestion = useCallback((text: string, lang: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    window.setTimeout(() => {
      window.speechSynthesis.speak(utterance)
    }, 200)
  }, [])

  useEffect(() => {
    let cancelled = false
    if (!libraryId) {
      setLoadingData(false)
      setLoadError('Không tìm thấy thư viện học tập')
      return () => {
        cancelled = true
      }
    }

    async function loadStudyResources() {
      setLoadingData(true)
      setLoadError(null)
      setReviewContext(null)
      try {
        const meta = await libraryRepository.getLibraryMeta(libraryId)
        if (!meta) {
          if (!cancelled) navigate(ROUTES.MY_LIBRARY)
          return
        }
        const fetched = await cardRepository.listCards(libraryId)
        if (cancelled) return
        const normalized = fetched.map(card => ({ ...card, domain: meta.subject || card.domain }))
        let nextCards = normalized
        let reviewInfo: StudyReviewContext | null = null

        if (isReviewSession) {
          const session = consumeReviewSession(libraryId)
          if (!session) {
            if (!cancelled) toast.info('Phiên ôn tập đã hết hạn hoặc không hợp lệ. Hiển thị toàn bộ thư viện.')
          } else if (!session.cardIds.length) {
            if (!cancelled) toast.info('Không có thẻ nào trong phiên ôn tập. Hiển thị toàn bộ thư viện.')
          } else {
            const requestedIds = new Set(session.cardIds.map(id => String(id)))
            const filtered = normalized.filter(card => requestedIds.has(String(card.id)))
            const missingCount = session.cardIds.length - filtered.length
            if (!filtered.length) {
              if (!cancelled) toast.info('Các thẻ đã chọn không còn khả dụng. Hiển thị toàn bộ thư viện.')
            } else {
              nextCards = filtered
              reviewInfo = { cardIds: session.cardIds, missingCount: Math.max(0, missingCount) }
              if (!cancelled && missingCount > 0) {
                toast.warning(`${missingCount} thẻ đã bị xoá hoặc bạn không còn quyền truy cập.`)
              }
            }
          }
        }

        if (cancelled) return
        setLibrary(meta)
        setCards(nextCards)
        setReviewContext(reviewInfo)
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'Không tải được dữ liệu'
          setLoadError(message)
        }
      } finally {
        if (!cancelled) setLoadingData(false)
      }
    }

    loadStudyResources()

    return () => {
      cancelled = true
    }
  }, [libraryId, isReviewSession, navigate])

  useEffect(() => {
    let cancelled = false

    async function initEngine() {
      if (loadingData || !library || !cards.length) return
      try {
        const { LearnEngine } = await import('@/features/study/utils/learnEngine')
        if (cancelled) return
        const studyEngine = new LearnEngine({ cards })
        let restored = false

        try {
          const remote = await loadProgress(libraryId)
          if (remote) {
            studyEngine.restore(remote)
            restored = true
          }
        } catch (error) {
          console.error('Không thể tải tiến độ từ backend', error)
        }

        if (!restored) {
          try {
            const local = await idbGetItem<SerializedState | null>(`study-session-${libraryId}`)
            if (local && 'params' in local && 'states' in local) {
              studyEngine.restore(local)
              restored = true
            }
          } catch (error) {
            console.error('Không thể tải tiến độ từ IndexedDB', error)
          }
        }

        try {
          const snapshot = studyEngine.serialize()
          if (snapshot.answerSide) {
            setAnswerSide(snapshot.answerSide)
            studyEngine.setAnswerSide(snapshot.answerSide)
            lastAppliedSideRef.current = snapshot.answerSide
          } else {
            studyEngine.setAnswerSide('back')
            lastAppliedSideRef.current = 'back'
          }
        } catch (error) {
          console.error('Không thể đồng bộ trạng thái answerSide', error)
        }

        if (cancelled) return
        setEngine(studyEngine)
        const question = studyEngine.nextQuestion()
        setCurrentQuestion(question)
        if (!question || studyEngine.isFinished()) setIsFinished(true)
      } catch (error) {
        console.error('Khởi tạo LearnEngine thất bại', error)
      }
    }

    initEngine()

    return () => {
      cancelled = true
    }
  }, [cards, library, libraryId, loadingData, setAnswerSide])

  const persistState = useCallback((state: SerializedState) => {
    idbSetItem(`study-session-${libraryId}`, state)
    saveProgress(libraryId, state).catch(error => console.error(error))
  }, [libraryId])

  useEffect(() => {
    const saveFn = () => {
      if (engine && !isFinished) {
        const serialized = engine.serialize()
        persistState(serialized)
      }
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        saveFn()
      }
    }

    window.addEventListener('beforeunload', saveFn)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      saveFn()
      window.removeEventListener('beforeunload', saveFn)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [engine, isFinished, persistState])

  useEffect(() => {
    if (!engine) return
    if (!allowMC && !allowTyped) {
      setAllowMC(true)
      engine.setModePreferences({ mc: true, typed: false })
      return
    }

    engine.setModePreferences({ mc: allowMC, typed: allowTyped })

    if (currentQuestion) {
      const needChange = (currentQuestion.mode === 'MULTIPLE_CHOICE' && !allowMC) ||
        (currentQuestion.mode === 'TYPED_RECALL' && !allowTyped)
      if (needChange) {
        try {
          const regenerated = engine.generateQuestionForCard(currentQuestion.cardId)
          setCurrentQuestion(regenerated)
          setShowResult(false)
          setUserAnswer('')
          setLastResult(null)
          setSelectedOptionIndex(null)
          setCorrectOptionIndex(null)
        } catch (error) {
          console.error(error)
          const fallback = engine.nextQuestion()
          setCurrentQuestion(fallback)
        }
      }
    }
  }, [allowMC, allowTyped, engine, currentQuestion, setAllowMC])

  useEffect(() => {
    if (!engine) return
    if (lastAppliedSideRef.current === answerSide) return

    engine.setAnswerSide(answerSide)
    lastAppliedSideRef.current = answerSide

    if (currentQuestion) {
      try {
        const regenerated = engine.generateQuestionForCard(currentQuestion.cardId)
        setCurrentQuestion(regenerated)
        setShowResult(false)
        setUserAnswer('')
        setLastResult(null)
        setSelectedOptionIndex(null)
        setCorrectOptionIndex(null)
      } catch (error) {
        console.error(error)
      }
    }
  }, [answerSide, engine, currentQuestion])

  const handleAnswer = useCallback((answer: string | number) => {
    if (!engine || !currentQuestion) return
    let submittedAnswer = answer
    if (currentQuestion.mode === 'MULTIPLE_CHOICE' && typeof answer === 'string') {
      submittedAnswer = answer
    }

    const result = engine.submitAnswer(currentQuestion.cardId, submittedAnswer)

    try {
      const state = engine.serialize()
      idbSetItem(`study-session-${libraryId}`, state)
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = window.setTimeout(() => {
        saveProgress(libraryId, state).catch(error => console.error(error))
      }, DEBOUNCE_MS)
    } catch (error) {
      console.error(error)
    }

    setLastResult(result)
    setShowResult(true)
    setSelectedOptionIndex(typeof answer === 'string' && currentQuestion.mode === 'MULTIPLE_CHOICE'
      ? currentQuestion.options.findIndex(option => option === answer)
      : null)
    setCorrectOptionIndex(typeof answer === 'string' && currentQuestion.mode === 'MULTIPLE_CHOICE'
      ? (() => {
        const card = cards.find(cardItem => cardItem.id.toString() === currentQuestion.cardId)
        const correctAnswer = answerSide === 'back' ? card?.back : card?.front
        return currentQuestion.options.findIndex(option => option === correctAnswer)
      })()
      : null)
  }, [engine, currentQuestion, cards, libraryId, answerSide])

  const handleDifficultyChoice = useCallback((cardId: string, choice: ReviewDifficultyChoice) => {
    if (!engine) return
    setSubmittingChoice(choice)
    try {
      const cardDetail = cards.find(card => card.id.toString() === cardId) || null
      engine.recordDifficultyChoice(cardId, choice)
      scheduleAutoReview({
        cardId,
        libraryId,
        cardFront: cardDetail?.front ?? '',
        cardBack: cardDetail?.back || undefined,
        libraryTitle: library?.title,
        choice
      })
      const state = engine.serialize()
      idbSetItem(`study-session-${libraryId}`, state)
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = window.setTimeout(() => {
        saveProgress(libraryId, state).catch(error => console.error(error))
      }, DEBOUNCE_MS)
    } finally {
      setSubmittingChoice(null)
    }
  }, [engine, cards, libraryId, library])

  const handleNext = useCallback(() => {
    if (!engine || submittingChoice) return
    setShowResult(false)
    setUserAnswer('')
    setLastResult(null)
    setSelectedOptionIndex(null)
    setCorrectOptionIndex(null)
    const nextQuestion = engine.nextQuestion()
    setCurrentQuestion(nextQuestion)
    if (!nextQuestion || engine.isFinished()) setIsFinished(true)
  }, [engine, submittingChoice])

  const handleSelectDifficulty = useCallback((choice: ReviewDifficultyChoice) => {
    if (!currentQuestion || submittingChoice) return
    handleDifficultyChoice(currentQuestion.cardId, choice)
  }, [currentQuestion, submittingChoice, handleDifficultyChoice])

  useEffect(() => {
    if (showResult && effectiveAutoAdvance) {
      const timer = window.setTimeout(() => handleNext(), 2000)
      return () => window.clearTimeout(timer)
    }
  }, [showResult, effectiveAutoAdvance, handleNext])

  useEffect(() => {
    if (!currentQuestion || !autoRead) return
    speakQuestion(currentQuestion.prompt, readLanguage)
  }, [currentQuestion, autoRead, readLanguage, speakQuestion])

  const handleFinish = useCallback(() => {
    if (engine) {
      const state = engine.serialize()
      saveProgress(libraryId, state).catch(error => console.error(error))
      idbSetItem(`study-session-${libraryId}`, state)
    }
    navigate(getLibraryDetailPath(libraryId))
  }, [engine, libraryId, navigate])

  const handleResetSession = useCallback(() => {
    ;(async () => {
      try {
        const { LearnEngine } = await import('@/features/study/utils/learnEngine')
        const fresh = new LearnEngine({ cards })
        setEngine(fresh)
        const question = fresh.nextQuestion()
        setCurrentQuestion(question)
        setIsFinished(!question || fresh.isFinished())
        const state = fresh.serialize()
        idbSetItem(`study-session-${libraryId}`, state)
        saveProgress(libraryId, state).catch(error => console.error(error))
      } catch (error) {
        console.error('Không thể reset phiên học tập', error)
      }
    })()
  }, [cards, libraryId])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }
      if (document.querySelector('[role="dialog"]') || document.querySelector('.modal')) {
        return
      }

      const key = event.key

      if (currentQuestion?.mode === 'MULTIPLE_CHOICE' && !showResult) {
        const optionIndex = parseInt(key, 10) - 1
        if (optionIndex >= 0 && optionIndex < (currentQuestion.options?.length || 0)) {
          event.preventDefault()
          setSelectedOptionIndex(optionIndex)
          const selectedAnswer = currentQuestion.options[optionIndex]
          handleAnswer(selectedAnswer)
          return
        }
      }

      if (key === 'Enter' && currentQuestion?.mode === 'TYPED_RECALL' && !showResult && userAnswer.trim()) {
        event.preventDefault()
        handleAnswer(userAnswer)
        return
      }

      if ((key === ' ' || key === 'ArrowRight') && showResult) {
        event.preventDefault()
        handleNext()
        return
      }

      if (key === 'Escape') {
        event.preventDefault()
        if (!showResult) {
          setUserAnswer('')
          setSelectedOptionIndex(null)
        }
        return
      }

      if (key === 'r' || key === 'R') {
        event.preventDefault()
        if (window.confirm('Bạn có muốn reset phiên học tập không?')) {
          handleResetSession()
        }
        return
      }

      if (key === 's' || key === 'S') {
        event.preventDefault()
        setAutoRead(!autoRead)
        return
      }

      if ((key === 'd' || key === 'D' || key === 'q' || key === 'Q') && currentQuestion) {
        event.preventDefault()
        speakQuestion(currentQuestion.prompt, readLanguage)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentQuestion, showResult, userAnswer, handleAnswer, handleNext, handleResetSession, autoRead, readLanguage, setAutoRead, speakQuestion])

  const headerModel: StudyHeaderModel | null = useMemo(() => {
    if (!library) return null
    return {
      context: { library, libraryId, currentQuestion },
      settings: preferences,
      handlers: {
        setAllowMC,
        setAllowTyped,
        setAutoAdvance,
        setShowCardProgress,
        setAutoRead,
        setReadLanguage,
        setAnswerSide,
        resetSession: handleResetSession
      }
    }
  }, [library, libraryId, currentQuestion, preferences, setAllowMC, setAllowTyped, setAutoAdvance, setShowCardProgress, setAutoRead, setReadLanguage, setAnswerSide, handleResetSession])

  const questionCardModel: StudyQuestionCardModel | null = useMemo(() => {
    if (!engine || !currentQuestion) return null
    return {
      currentQuestion,
      engine,
      cards,
      userAnswer,
      setUserAnswer,
      showResult,
      lastResult,
      selectedOptionIndex,
      correctOptionIndex,
      autoAdvance: effectiveAutoAdvance,
      readLanguage,
      speakQuestion,
      handleAnswer,
      handleNext,
      disableNext: Boolean(submittingChoice),
      answerSide,
      difficultyMeta: currentDifficultyMeta,
      difficultyChoices: STUDY_DIFFICULTY_CHOICES,
      onDifficultyChoice: handleSelectDifficulty,
      submittingChoice
    }
  }, [engine, currentQuestion, cards, userAnswer, showResult, lastResult, selectedOptionIndex, correctOptionIndex, effectiveAutoAdvance, readLanguage, speakQuestion, handleAnswer, handleNext, answerSide, currentDifficultyMeta, handleSelectDifficulty, submittingChoice])

  const cardProgressModel: StudyCardProgressModel | null = useMemo(() => {
    if (!engine || !showCardProgress) return null
    return {
      engine,
      showCardAnswers,
      setShowCardAnswers
    }
  }, [engine, showCardProgress, showCardAnswers, setShowCardAnswers])

  const statsModel: StudyStatsModel | null = useMemo(() => {
    if (!engine) return null
    const progress = engine.getProgressDetailed()
    if (!progress) return null
    return { engine, progress }
  }, [engine])

  const finishedModel: StudyFinishedModel | null = useMemo(() => {
    if (!isFinished) return null
    return {
      handleFinish,
      handleResetSession
    }
  }, [isFinished, handleFinish, handleResetSession])

  const status: StudySessionStatus = useMemo(() => {
    if (loadingData) return 'loading'
    if (loadError) return 'error'
    if (isFinished) return 'finished'
    return 'ready'
  }, [loadingData, loadError, isFinished])

  return {
    status,
    errorMessage: loadError,
    library,
    reviewContext,
    header: headerModel,
    questionCard: questionCardModel,
    cardProgress: cardProgressModel,
    stats: statsModel,
    finished: finishedModel,
    isAutoAdvanceActive: effectiveAutoAdvance,
    isRatingRequired: mustRateBeforeNext,
    isLoadingInitialData: loadingData
  }
}
