import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { libraryRepository } from '@/shared/lib/repositories/LibraryRepository'
import { cardRepository } from '@/shared/lib/repositories/CardRepository'
import { loadProgress, saveProgress } from '@/shared/lib/firebaseProgressService'
import type { Question, Result, Card as LearnCard, SerializedState, LearnEngine as LearnEngineType } from '@/features/study/utils/learnEngine'
import type { LibraryMeta } from '@/shared/lib/models'
import { idbGetItem, idbSetItem } from '@/shared/lib/indexedDB'
import { useAuth } from '@/shared/hooks/useAuthRedux'
import { getLibraryDetailPath, ROUTES } from '@/shared/constants/routes'
import { Alert, AlertTitle } from '@/shared/components/ui/alert'
import {
  StudyHeader,
  QuestionCard,
  StatsCard,
  CardProgressCard,
  StudyLoading,
  StudyError,
  StudyFinished
} from '../components'

export default function StudyPage(){
  const { id } = useParams(); const navigate = useNavigate(); const libraryId = id || '';
  useAuth();
  // Core state
  const [engine,setEngine]=useState<LearnEngineType|null>(null);
  const [currentQuestion,setCurrentQuestion]=useState<Question|null>(null);
  const [userAnswer,setUserAnswer]=useState('');
  const [showResult,setShowResult]=useState(false);
  const [lastResult,setLastResult]=useState<Result|null>(null);
  const [isFinished,setIsFinished]=useState(false);
  const [selectedOptionIndex,setSelectedOptionIndex]=useState<number|null>(null);
  const [correctOptionIndex,setCorrectOptionIndex]=useState<number|null>(null);
  // Preferences & detail controls
  const [allowMC,setAllowMC]=useState(true); const [allowTyped,setAllowTyped]=useState(true); const [autoAdvance,setAutoAdvance]=useState(true);
  const [showCardProgress,setShowCardProgress]=useState(false); const [showCardAnswers,setShowCardAnswers]=useState(false);
  const [autoRead,setAutoRead]=useState(false); const [readLanguage,setReadLanguage]=useState('en-US');
  const [showKeyboardShortcuts,setShowKeyboardShortcuts]=useState(true);
  // Data
  const [library,setLibrary]=useState<LibraryMeta|null>(null);
  const [cards,setCards]=useState<LearnCard[]>([]);
  const [loadingData,setLoadingData]=useState(true);
  const [loadError,setLoadError]=useState<string|null>(null);

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
  useEffect(()=>{ let cancelled=false; if(!libraryId) return; (async()=>{ setLoadingData(true); setLoadError(null);       try { const meta=await libraryRepository.getLibraryMeta(libraryId); if(!meta){ if(!cancelled) navigate(ROUTES.MY_LIBRARY); return; } const c=await cardRepository.listCards(libraryId); if(cancelled) return; setLibrary(meta); setCards(c.map(cd=> ({...cd, domain: meta.subject || cd.domain }))); } catch(e: unknown){ if(!cancelled) setLoadError(e instanceof Error ? e.message : 'Không tải được dữ liệu'); } finally { if(!cancelled) setLoadingData(false);} })(); return ()=>{ cancelled=true }; }, [libraryId,navigate]);

  // Init engine & restore
  useEffect(()=>{ let cancelled=false; async function init(){ if(loadingData||!library||!cards.length) return; try { const { LearnEngine } = await import('@/features/study/utils/learnEngine'); if(cancelled) return; const eng=new LearnEngine({ cards }); let restored=false; try { const remote=await loadProgress(libraryId); if(remote){ eng.restore(remote); restored=true; } } catch(e){ console.error(e); } if(!restored){ try { const local=await idbGetItem<SerializedState | null>(`study-session-${libraryId}`); if(local && 'params' in local && 'states' in local){ eng.restore(local); restored=true; } } catch(e){ console.error(e); } } if(cancelled) return; setEngine(eng); const q=eng.nextQuestion(); setCurrentQuestion(q); if(!q||eng.isFinished()) setIsFinished(true); } catch(e){ console.error('Khởi tạo LearnEngine thất bại:', e);} } init(); return ()=>{ cancelled=true }; }, [cards,library,libraryId,loadingData]);

  // Autosave
  useEffect(()=>{ const saveFn=()=>{ if(engine && !isFinished){ const s=engine.serialize(); idbSetItem(`study-session-${libraryId}`, s); saveProgress(libraryId, s).catch((e: unknown) => console.error(e)); } }; const vis=()=>{ if(document.visibilityState==='hidden') saveFn(); }; window.addEventListener('beforeunload', saveFn); document.addEventListener('visibilitychange', vis); return ()=>{ saveFn(); window.removeEventListener('beforeunload', saveFn); document.removeEventListener('visibilitychange', vis);} }, [engine,isFinished,libraryId]);

  // Mode preference sync
  useEffect(()=>{ if(!engine) return; if(!allowMC && !allowTyped){ setAllowMC(true); engine.setModePreferences({ mc:true, typed:false }); return; } engine.setModePreferences({ mc:allowMC, typed:allowTyped }); if(currentQuestion){ const needChange=(currentQuestion.mode==='MULTIPLE_CHOICE' && !allowMC) || (currentQuestion.mode==='TYPED_RECALL' && !allowTyped); if(needChange){ try { const regen=engine.generateQuestionForCard(currentQuestion.cardId); setCurrentQuestion(regen); setShowResult(false); setUserAnswer(''); setLastResult(null); setSelectedOptionIndex(null); setCorrectOptionIndex(null); } catch(e){ console.error(e); const fb=engine.nextQuestion(); setCurrentQuestion(fb); } } } }, [allowMC,allowTyped,engine,currentQuestion]);

  // Answer handling
  const debounceTimerRef = useRef<number | undefined>(undefined);
  const DEBOUNCE_MS=4000;
  const handleAnswer=useCallback((answer:string|number)=>{ if(!engine||!currentQuestion) return; let ans=answer; let sel:number|null=null; let cor:number|null=null; if(currentQuestion.mode==='MULTIPLE_CHOICE' && typeof answer==='string'){ sel=currentQuestion.options.findIndex((o: string)=>o===answer); const card=cards.find((c: LearnCard)=>c.id.toString()===currentQuestion.cardId); if(card){ cor=currentQuestion.options.findIndex((o: string)=>o===card.back); ans= sel===cor?0:sel; } } const result=engine.submitAnswer(currentQuestion.cardId, ans); try { const state=engine.serialize(); idbSetItem(`study-session-${libraryId}`, state); if(debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current); debounceTimerRef.current=window.setTimeout(()=>{ saveProgress(libraryId,state).catch((e: unknown) => console.error(e)); }, DEBOUNCE_MS); } catch(e){ console.error(e); } setLastResult(result); setShowResult(true); setSelectedOptionIndex(sel); setCorrectOptionIndex(cor); }, [engine, currentQuestion, cards, libraryId]);

  const handleNext=useCallback(()=>{ if(!engine) return; setShowResult(false); setUserAnswer(''); setLastResult(null); setSelectedOptionIndex(null); setCorrectOptionIndex(null); const nq=engine.nextQuestion(); setCurrentQuestion(nq); if(!nq || engine.isFinished()) setIsFinished(true); }, [engine]);

  useEffect(()=>{ if(showResult && autoAdvance){ const t=setTimeout(()=> handleNext(), 2000); return ()=> clearTimeout(t); } }, [showResult,autoAdvance,handleNext]);

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

  if(!currentQuestion) return (<div className='py-12 text-center'>Đang khởi tạo...</div>);

  return (
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
          setAllowMC={setAllowMC}
          setAllowTyped={setAllowTyped}
          setAutoAdvance={setAutoAdvance}
          setShowCardProgress={setShowCardProgress}
          setAutoRead={setAutoRead}
          setReadLanguage={setReadLanguage}
          setShowKeyboardShortcuts={setShowKeyboardShortcuts}
          handleResetSession={handleResetSession}
        />

        <div className='space-y-6 lg:space-y-8'>
          {/* Keyboard Shortcuts Help */}
          {showKeyboardShortcuts && (
            <div className='w-full'>
              <Alert className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
                <AlertTitle className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
                  ⌨️ Phím tắt bàn phím
                </AlertTitle>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-mono">1-4</kbd>
                    <span className="text-blue-700 dark:text-blue-300">Chọn đáp án trắc nghiệm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-mono">Enter</kbd>
                    <span className="text-blue-700 dark:text-blue-300">Gửi câu trả lời</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-mono">Space/→</kbd>
                    <span className="text-blue-700 dark:text-blue-300">Câu hỏi tiếp theo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-mono">Esc</kbd>
                    <span className="text-blue-700 dark:text-blue-300">Xóa câu trả lời</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-mono">R</kbd>
                    <span className="text-blue-700 dark:text-blue-300">Reset phiên học</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-mono">S</kbd>
                    <span className="text-blue-700 dark:text-blue-300">Bật/tắt đọc tự động</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-mono">D/Q</kbd>
                    <span className="text-blue-700 dark:text-blue-300">Đọc câu hỏi</span>
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
                autoAdvance={autoAdvance}
                readLanguage={readLanguage}
                speakQuestion={speakQuestion}
                handleAnswer={handleAnswer}
                handleNext={handleNext}
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
          {progress && (
            <div className='w-full'>
              <StatsCard progress={progress} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
