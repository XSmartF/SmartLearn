import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { libraryRepository } from '@/shared/lib/repositories/LibraryRepository'
import { cardRepository } from '@/shared/lib/repositories/CardRepository'
import { loadProgress, saveProgress } from '@/shared/lib/firebaseProgressService'
import type { Question, Result, Card as LearnCard, SerializedState, LearnEngine as LearnEngineType, DifficultyMeta } from '@/features/study/utils/learnEngine'
import type { LibraryMeta } from '@/shared/lib/models'
import { idbGetItem, idbSetItem } from '@/shared/lib/indexedDB'
import { useAuth } from '@/shared/hooks/useAuthRedux'
import { getLibraryDetailPath, ROUTES } from '@/shared/constants/routes'
import { Alert, AlertTitle } from '@/shared/components/ui/alert'
import type { ReviewDifficultyChoice } from '@/shared/lib/reviewScheduler'
import { scheduleAutoReview } from '@/shared/lib/reviewScheduler'
import { consumeReviewSession } from '@/shared/constants/review'
import { toast } from 'sonner'
import {
  StudyHeader,
  QuestionCard,
  StatsCard,
  CardProgressCard,
  StudyLoading,
  StudyError,
  StudyFinished
} from '../components'
import { Loader } from '@/shared/components/ui/loader'

const DIFFICULTY_CHOICES: Array<{ value: ReviewDifficultyChoice; label: string; description: string }> = [
  { value: 'veryHard', label: 'Rất khó', description: 'Gặp nhiều lỗi liên tiếp - cần ôn ngay.' },
  { value: 'hard', label: 'Khó', description: 'Vẫn còn bối rối, cần hỏi lại sớm.' },
  { value: 'again', label: 'Ôn lại', description: 'Để ôn trong ngày hôm nay.' },
  { value: 'normal', label: 'Đã nhớ', description: 'Đưa thẻ về lịch ôn tiêu chuẩn.' }
]

type StudyPreferences = {
  allowMC: boolean
  allowTyped: boolean
  autoAdvance: boolean
  showCardProgress: boolean
  autoRead: boolean
  readLanguage: string
  showKeyboardShortcuts: boolean
  answerSide: 'front' | 'back'
}

const STUDY_PREFERENCES_KEY = 'smartlearn-study-preferences'

const DEFAULT_STUDY_PREFERENCES: StudyPreferences = {
  allowMC: true,
  allowTyped: true,
  autoAdvance: true,
  showCardProgress: false,
  autoRead: false,
  readLanguage: 'en-US',
  showKeyboardShortcuts: true,
  answerSide: 'back'
}

const loadStoredPreferences = (): StudyPreferences => {
  if (typeof window === 'undefined') return { ...DEFAULT_STUDY_PREFERENCES }
  try {
    const raw = window.localStorage.getItem(STUDY_PREFERENCES_KEY)
    if (!raw) return { ...DEFAULT_STUDY_PREFERENCES }
    const parsed = JSON.parse(raw) as Partial<StudyPreferences>
    return { ...DEFAULT_STUDY_PREFERENCES, ...parsed }
  } catch (error) {
    console.error('Không thể đọc tùy chọn học tập từ localStorage', error)
    return { ...DEFAULT_STUDY_PREFERENCES }
  }
}

export default function StudyPage(){
  const { id } = useParams(); const navigate = useNavigate(); const libraryId = id || '';
  const [searchParams] = useSearchParams();
  const isReviewSession = searchParams.get('mode') === 'review';
  useAuth();
  const initialPreferences = useMemo(() => loadStoredPreferences(), []);
  // Core state
  const [engine,setEngine]=useState<LearnEngineType|null>(null);
  const [currentQuestion,setCurrentQuestion]=useState<Question|null>(null);
  const [userAnswer,setUserAnswer]=useState('');
  const [showResult,setShowResult]=useState(false);
  const [lastResult,setLastResult]=useState<Result|null>(null);
  const [isFinished,setIsFinished]=useState(false);
  const [selectedOptionIndex,setSelectedOptionIndex]=useState<number|null>(null);
  const [correctOptionIndex,setCorrectOptionIndex]=useState<number|null>(null);
  const [submittingChoice,setSubmittingChoice]=useState<ReviewDifficultyChoice|null>(null);
  // Preferences & detail controls
  const [allowMC,setAllowMC]=useState(initialPreferences.allowMC);
  const [allowTyped,setAllowTyped]=useState(initialPreferences.allowTyped);
  const [autoAdvance,setAutoAdvance]=useState(initialPreferences.autoAdvance);
  const [showCardProgress,setShowCardProgress]=useState(initialPreferences.showCardProgress);
  const [showCardAnswers,setShowCardAnswers]=useState(false);
  const [autoRead,setAutoRead]=useState(initialPreferences.autoRead);
  const [readLanguage,setReadLanguage]=useState(initialPreferences.readLanguage);
  const [showKeyboardShortcuts,setShowKeyboardShortcuts]=useState(initialPreferences.showKeyboardShortcuts);
  // Which side is the answer when prompting (default back)
  const [answerSide, setAnswerSide] = useState<'front' | 'back'>(initialPreferences.answerSide);
  const lastAppliedSideRef = useRef<'front' | 'back'>('back');
  // Data
  const [library,setLibrary]=useState<LibraryMeta|null>(null);
  const [cards,setCards]=useState<LearnCard[]>([]);
  const [reviewContext,setReviewContext]=useState<{ cardIds: string[]; missingCount: number } | null>(null);
  const [loadingData,setLoadingData]=useState(true);
  const [loadError,setLoadError]=useState<string|null>(null);
  const currentCardId=currentQuestion?.cardId;
  const currentDifficultyMeta: DifficultyMeta | null = currentCardId && engine ? engine.getDifficultyMeta(currentCardId) : null;
  const mustRateBeforeNext = currentDifficultyMeta?.shouldPrompt ?? false;
  const effectiveAutoAdvance=autoAdvance && !mustRateBeforeNext && submittingChoice === null;

  // Function to speak the question using Web Speech API
  const speakQuestion = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      // Add a small delay to prevent cutting off the beginning
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 200);
    }
  };

  // Load data
  useEffect(()=>{
    let cancelled=false;
    if(!libraryId) return;
    (async()=>{
      setLoadingData(true);
      setLoadError(null);
      setReviewContext(null);
      try {
        const meta=await libraryRepository.getLibraryMeta(libraryId);
        if(!meta){ if(!cancelled) navigate(ROUTES.MY_LIBRARY); return; }
        const fetched=await cardRepository.listCards(libraryId);
        if(cancelled) return;
        const normalized=fetched.map(cd=> ({...cd, domain: meta.subject || cd.domain }));
        let nextCards=normalized;
        let reviewInfo:{ cardIds:string[]; missingCount:number } | null=null;

        if(isReviewSession){
          const session=consumeReviewSession(libraryId);
          if(!session){
            if(!cancelled) toast.info('Phiên ôn tập đã hết hạn hoặc không hợp lệ. Hiển thị toàn bộ thư viện.');
          } else if(!session.cardIds.length){
            if(!cancelled) toast.info('Không có thẻ nào trong phiên ôn tập. Hiển thị toàn bộ thư viện.');
          } else {
            const requestedIds=new Set(session.cardIds.map(id=> String(id)));
            const filtered=normalized.filter(card=> requestedIds.has(String(card.id)));
            const missingCount=session.cardIds.length-filtered.length;
            if(!filtered.length){
              if(!cancelled) toast.info('Các thẻ đã chọn không còn khả dụng. Hiển thị toàn bộ thư viện.');
            } else {
              nextCards=filtered;
              reviewInfo={ cardIds: session.cardIds, missingCount: Math.max(0, missingCount) };
              if(!cancelled && missingCount>0){
                toast.warning(`${missingCount} thẻ đã bị xoá hoặc bạn không còn quyền truy cập.`);
              }
            }
          }
        }

        if(cancelled) return;
        setLibrary(meta);
        setCards(nextCards);
        setReviewContext(reviewInfo);
      } catch(e: unknown){
        if(!cancelled) setLoadError(e instanceof Error ? e.message : 'Không tải được dữ liệu');
      } finally {
        if(!cancelled) setLoadingData(false);
      }
    })();
    return ()=>{ cancelled=true };
  }, [libraryId,navigate,isReviewSession]);

  // Init engine & restore
  useEffect(()=>{ let cancelled=false; async function init(){ if(loadingData||!library||!cards.length) return; try { const { LearnEngine } = await import('@/features/study/utils/learnEngine'); if(cancelled) return; const eng=new LearnEngine({ cards }); let restored=false; try { const remote=await loadProgress(libraryId); if(remote){ eng.restore(remote); restored=true; } } catch(e){ console.error(e); } if(!restored){ try { const local=await idbGetItem<SerializedState | null>(`study-session-${libraryId}`); if(local && 'params' in local && 'states' in local){ eng.restore(local); restored=true; } } catch(e){ console.error(e); } } if(cancelled) return; // set answer side from restored snapshot if any
  try { const snap = eng.serialize(); if (snap.answerSide) { setAnswerSide(snap.answerSide); eng.setAnswerSide(snap.answerSide); } else { eng.setAnswerSide('back'); } } catch { /* ignore */ }
    setEngine(eng); const q=eng.nextQuestion(); setCurrentQuestion(q); if(!q||eng.isFinished()) setIsFinished(true); } catch(e){ console.error('Khởi tạo LearnEngine thất bại:', e);} } init(); return ()=>{ cancelled=true }; }, [cards,library,libraryId,loadingData]);

  // Autosave
  useEffect(()=>{ const saveFn=()=>{ if(engine && !isFinished){ const s=engine.serialize(); idbSetItem(`study-session-${libraryId}`, s); saveProgress(libraryId, s).catch((e: unknown) => console.error(e)); } }; const vis=()=>{ if(document.visibilityState==='hidden') saveFn(); }; window.addEventListener('beforeunload', saveFn); document.addEventListener('visibilitychange', vis); return ()=>{ saveFn(); window.removeEventListener('beforeunload', saveFn); document.removeEventListener('visibilitychange', vis);} }, [engine,isFinished,libraryId]);

  // Mode preference sync
  useEffect(()=>{ if(!engine) return; if(!allowMC && !allowTyped){ setAllowMC(true); engine.setModePreferences({ mc:true, typed:false }); return; } engine.setModePreferences({ mc:allowMC, typed:allowTyped }); if(currentQuestion){ const needChange=(currentQuestion.mode==='MULTIPLE_CHOICE' && !allowMC) || (currentQuestion.mode==='TYPED_RECALL' && !allowTyped); if(needChange){ try { const regen=engine.generateQuestionForCard(currentQuestion.cardId); setCurrentQuestion(regen); setShowResult(false); setUserAnswer(''); setLastResult(null); setSelectedOptionIndex(null); setCorrectOptionIndex(null); } catch(e){ console.error(e); const fb=engine.nextQuestion(); setCurrentQuestion(fb); } } } }, [allowMC,allowTyped,engine,currentQuestion]);

  // Sync answer side preference to engine once per change and regenerate current question to reflect side
  useEffect(() => {
    if (!engine) return;
    if (lastAppliedSideRef.current === answerSide) return;
    engine.setAnswerSide(answerSide);
    lastAppliedSideRef.current = answerSide;
    if (currentQuestion) {
      try {
        const regen = engine.generateQuestionForCard(currentQuestion.cardId);
        setCurrentQuestion(regen);
        setShowResult(false);
        setUserAnswer('');
        setLastResult(null);
        setSelectedOptionIndex(null);
        setCorrectOptionIndex(null);
      } catch (e) {
        console.error(e);
      }
    }
  }, [answerSide, engine, currentQuestion]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const preferences: StudyPreferences = {
      allowMC,
      allowTyped,
      autoAdvance,
      showCardProgress,
      autoRead,
      readLanguage,
      showKeyboardShortcuts,
      answerSide
    };
    try {
      window.localStorage.setItem(STUDY_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Không thể lưu tùy chọn học tập vào localStorage', error);
    }
  }, [allowMC, allowTyped, autoAdvance, showCardProgress, autoRead, readLanguage, showKeyboardShortcuts, answerSide]);

  // Answer handling
  const debounceTimerRef = useRef<number | undefined>(undefined);
  const DEBOUNCE_MS=4000;
  const handleAnswer=useCallback((answer:string|number)=>{ if(!engine||!currentQuestion) return; let ans=answer; if(currentQuestion.mode==='MULTIPLE_CHOICE' && typeof answer==='string'){ ans=answer; } const result=engine.submitAnswer(currentQuestion.cardId, ans); try { const state=engine.serialize(); idbSetItem(`study-session-${libraryId}`, state); if(debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current); debounceTimerRef.current=window.setTimeout(()=>{ saveProgress(libraryId,state).catch((e: unknown) => console.error(e)); }, DEBOUNCE_MS); } catch(e){ console.error(e); } setLastResult(result); setShowResult(true); setSelectedOptionIndex(typeof answer==='string' && currentQuestion.mode==='MULTIPLE_CHOICE' ? currentQuestion.options.findIndex((o: string)=>o===answer) : null); setCorrectOptionIndex(typeof answer==='string' && currentQuestion.mode==='MULTIPLE_CHOICE' ? (()=>{ const card=cards.find((c: LearnCard)=>c.id.toString()===currentQuestion.cardId); const correctAnswer= answerSide==='back' ? card?.back : card?.front; return currentQuestion.options.findIndex((o: string)=>o===correctAnswer); })() : null); }, [engine, currentQuestion, cards, libraryId, answerSide]);

  const handleDifficultyChoice=useCallback((cardId: string, choice: ReviewDifficultyChoice)=>{ if(!engine) return; setSubmittingChoice(choice); try { const cardDetail=cards.find((c: LearnCard)=>c.id.toString()===cardId) || null; engine.recordDifficultyChoice(cardId, choice); scheduleAutoReview({ cardId, libraryId, cardFront: cardDetail?.front ?? '', cardBack: cardDetail?.back || undefined, libraryTitle: library?.title, choice }); const state=engine.serialize(); idbSetItem(`study-session-${libraryId}`, state); if(debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current); debounceTimerRef.current=window.setTimeout(()=>{ saveProgress(libraryId,state).catch((e: unknown) => console.error(e)); }, DEBOUNCE_MS); } finally { setSubmittingChoice(null); } }, [engine,cards,libraryId,library]);

  const handleNext=useCallback(()=>{ if(!engine) return; if(submittingChoice) return; if(currentQuestion){ const meta=engine.getDifficultyMeta(currentQuestion.cardId); if(meta?.shouldPrompt){ return; } } setShowResult(false); setUserAnswer(''); setLastResult(null); setSelectedOptionIndex(null); setCorrectOptionIndex(null); const nq=engine.nextQuestion(); setCurrentQuestion(nq); if(!nq || engine.isFinished()) setIsFinished(true); }, [engine,currentQuestion,submittingChoice]);

  const handleSelectDifficulty=useCallback((choice: ReviewDifficultyChoice)=>{ if(!currentQuestion || submittingChoice) return; handleDifficultyChoice(currentQuestion.cardId, choice); }, [currentQuestion, handleDifficultyChoice, submittingChoice]);

  useEffect(()=>{ if(showResult && effectiveAutoAdvance){ const t=setTimeout(()=> handleNext(), 2000); return ()=> clearTimeout(t); } }, [showResult,effectiveAutoAdvance,handleNext]);

  // Speak the question when it changes
  useEffect(() => {
    if (currentQuestion && autoRead) {
      speakQuestion(currentQuestion.prompt, readLanguage);
    }
  }, [currentQuestion, autoRead, readLanguage]);

  const handleFinish=()=>{ if(engine){ const s=engine.serialize(); saveProgress(libraryId,s).catch((e: unknown) => console.error(e)); idbSetItem(`study-session-${libraryId}`, s); } if(id) navigate(getLibraryDetailPath(id)); };
  const handleResetSession=useCallback(()=>{ (async()=>{ try { const { LearnEngine } = await import('@/features/study/utils/learnEngine'); const fresh=new LearnEngine({ cards }); setEngine(fresh); const q=fresh.nextQuestion(); setCurrentQuestion(q); setIsFinished(!q||fresh.isFinished()); const s=fresh.serialize(); idbSetItem(`study-session-${libraryId}`, s); saveProgress(libraryId,s).catch((e: unknown) => console.error(e)); } catch(e){ console.error('Không thể reset phiên học tập:', e);} })(); }, [cards, libraryId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore if user is typing in input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Don't trigger shortcuts if modal or dialog is open
      if (document.querySelector('[role="dialog"]') || document.querySelector('.modal')) {
        return;
      }

      const key = event.key;

      // Multiple choice shortcuts (1-4)
      if (currentQuestion?.mode === 'MULTIPLE_CHOICE' && !showResult) {
        const optionIndex = parseInt(key) - 1;
        if (optionIndex >= 0 && optionIndex < (currentQuestion.options?.length || 0)) {
          event.preventDefault();
          setSelectedOptionIndex(optionIndex);
          const selectedAnswer = currentQuestion.options[optionIndex];
          handleAnswer(selectedAnswer);
          return;
        }
      }

      // Enter to submit typed answer
      if (key === 'Enter' && currentQuestion?.mode === 'TYPED_RECALL' && !showResult && userAnswer.trim()) {
        event.preventDefault();
        handleAnswer(userAnswer);
        return;
      }

      // Space or Arrow Right to go to next question
      if ((key === ' ' || key === 'ArrowRight') && showResult) {
        event.preventDefault();
        handleNext();
        return;
      }

      // Arrow Left to go back (if possible)
      if (key === 'ArrowLeft' && showResult) {
        event.preventDefault();
        // Could implement going back to previous question if needed
        return;
      }

      // Escape to clear answer or reset
      if (key === 'Escape') {
        event.preventDefault();
        if (!showResult) {
          setUserAnswer('');
          setSelectedOptionIndex(null);
        }
        return;
      }

      // R to reset session
      if (key === 'r' || key === 'R') {
        event.preventDefault();
        if (confirm('Bạn có muốn reset phiên học tập không?')) {
          handleResetSession();
        }
        return;
      }

      // S to toggle auto-read
      if (key === 's' || key === 'S') {
        event.preventDefault();
        setAutoRead(!autoRead);
        return;
      }

      // D or Q to speak/read the current question
      if ((key === 'd' || key === 'D' || key === 'q' || key === 'Q') && currentQuestion) {
        event.preventDefault();
        speakQuestion(currentQuestion.prompt, readLanguage);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestion, showResult, userAnswer, handleAnswer, handleNext, handleResetSession, autoRead, readLanguage]);

  if(loadingData) return <StudyLoading />;
  if(loadError) return <StudyError error={loadError} />;
  if(!library) return null;

  const progress=engine?.getProgressDetailed();

  // Finished state
  if(isFinished){ return <StudyFinished handleFinish={handleFinish} handleResetSession={handleResetSession} />; }

  if(!currentQuestion) return (
    <div className='py-12 flex items-center justify-center'>
      <Loader label="Đang khởi tạo" />
    </div>
  );

  return (
    <>
      <div className='min-h-screen bg-background'>
        <div className='container mx-auto px-4 py-6 space-y-6 lg:space-y-8'>
          <StudyHeader
            library={library}
            libraryId={libraryId}
            currentQuestion={currentQuestion}
            allowMC={allowMC}
            allowTyped={allowTyped}
            autoAdvance={autoAdvance}
            showCardProgress={showCardProgress}
            autoRead={autoRead}
            readLanguage={readLanguage}
            showKeyboardShortcuts={showKeyboardShortcuts}
            answerSide={answerSide}
            setAllowMC={setAllowMC}
            setAllowTyped={setAllowTyped}
            setAutoAdvance={setAutoAdvance}
            setShowCardProgress={setShowCardProgress}
            setAutoRead={setAutoRead}
            setReadLanguage={setReadLanguage}
            setShowKeyboardShortcuts={setShowKeyboardShortcuts}
            setAnswerSide={setAnswerSide}
            handleResetSession={handleResetSession}
          />

          {reviewContext && (
            <Alert className='border-primary bg-primary/10'>
              <AlertTitle className='text-primary flex items-center gap-2'>
                🔁 Phiên ôn tập
              </AlertTitle>
              <div className='mt-2 text-sm text-primary/80'>
                Đang ôn {reviewContext.cardIds.length} thẻ đã chọn từ trang ôn tập.
              </div>
              {reviewContext.missingCount > 0 && (
                <div className='mt-1 text-xs text-primary/70'>
                  {reviewContext.missingCount} thẻ không tìm thấy và đã bị bỏ qua.
                </div>
              )}
            </Alert>
          )}

          <div className='space-y-6 lg:space-y-8'>
            {/* Keyboard Shortcuts Help */}
            {showKeyboardShortcuts && (
              <div className='w-full'>
                <Alert className="border-info bg-info/10">
                  <AlertTitle className="text-info flex items-center gap-2">
                    ⌨️ Phím tắt bàn phím
                  </AlertTitle>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-info/20 text-info rounded text-xs font-mono">1-4</kbd>
                      <span className="text-info">Chọn đáp án trắc nghiệm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-info/20 text-info rounded text-xs font-mono">Enter</kbd>
                      <span className="text-info">Gửi câu trả lời</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-info/20 text-info rounded text-xs font-mono">Space/→</kbd>
                      <span className="text-info">Câu hỏi tiếp theo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-info/20 text-info rounded text-xs font-mono">Esc</kbd>
                      <span className="text-info">Xóa câu trả lời</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-info/20 text-info rounded text-xs font-mono">R</kbd>
                      <span className="text-info">Reset phiên học</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-info/20 text-info rounded text-xs font-mono">S</kbd>
                      <span className="text-info">Bật/tắt đọc tự động</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-info/20 text-info rounded text-xs font-mono">D/Q</kbd>
                      <span className="text-info">Đọc câu hỏi</span>
                    </div>
                  </div>
                </Alert>
              </div>
            )}

            {/* Main Question Card */}
            <div className='w-full'>
              {engine && (
                <QuestionCard
                  currentQuestion={currentQuestion}
                  engine={engine}
                  cards={cards}
                  userAnswer={userAnswer}
                  setUserAnswer={setUserAnswer}
                  showResult={showResult}
                  lastResult={lastResult}
                  selectedOptionIndex={selectedOptionIndex}
                  correctOptionIndex={correctOptionIndex}
                  autoAdvance={effectiveAutoAdvance}
                  readLanguage={readLanguage}
                  speakQuestion={speakQuestion}
                  handleAnswer={handleAnswer}
                  handleNext={handleNext}
                    disableNext={mustRateBeforeNext}
                    answerSide={answerSide}
                    difficultyMeta={currentDifficultyMeta}
                    difficultyChoices={DIFFICULTY_CHOICES}
                    onDifficultyChoice={handleSelectDifficulty}
                    submittingChoice={submittingChoice}
                />
              )}
            </div>

            {/* Card Progress (if enabled) */}
            {showCardProgress && engine && (
              <div className='w-full'>
                <CardProgressCard
                  engine={engine}
                  showCardAnswers={showCardAnswers}
                  setShowCardAnswers={setShowCardAnswers}
                />
              </div>
            )}

            {/* Study Progress */}
            {progress && engine && (
              <div className='w-full'>
                <StatsCard engine={engine} progress={progress} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
