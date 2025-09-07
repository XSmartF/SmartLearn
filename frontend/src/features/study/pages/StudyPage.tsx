import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { libraryRepository } from '@/shared/lib/repositories/LibraryRepository'
import { cardRepository } from '@/shared/lib/repositories/CardRepository'
import { loadProgress, saveProgress } from '@/shared/lib/firebaseProgressService'
import type { Question, Result, Card as LearnCard, SerializedState, LearnEngine as LearnEngineType } from '@/features/study/utils/learnEngine'
import type { LibraryMeta } from '@/shared/lib/models'
import { idbGetItem, idbSetItem } from '@/shared/lib/indexedDB'
import { useAuth } from '@/shared/hooks/useAuthRedux'
import { getLibraryDetailPath, ROUTES } from '@/shared/constants/routes'
import {
  StudyBreadcrumb,
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
      window.speechSynthesis.speak(utterance);
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
  let debounceTimer: number | undefined; const DEBOUNCE_MS=4000;
  const handleAnswer=(answer:string|number)=>{ if(!engine||!currentQuestion) return; let ans=answer; let sel:number|null=null; let cor:number|null=null; if(currentQuestion.mode==='MULTIPLE_CHOICE' && typeof answer==='string'){ sel=currentQuestion.options.findIndex((o: string)=>o===answer); const card=cards.find((c: LearnCard)=>c.id.toString()===currentQuestion.cardId); if(card){ cor=currentQuestion.options.findIndex((o: string)=>o===card.back); ans= sel===cor?0:sel; } } const result=engine.submitAnswer(currentQuestion.cardId, ans); try { const state=engine.serialize(); idbSetItem(`study-session-${libraryId}`, state); if(debounceTimer) window.clearTimeout(debounceTimer); debounceTimer=window.setTimeout(()=>{ saveProgress(libraryId,state).catch((e: unknown) => console.error(e)); }, DEBOUNCE_MS); } catch(e){ console.error(e); } setLastResult(result); setShowResult(true); setSelectedOptionIndex(sel); setCorrectOptionIndex(cor); };

  const handleNext=useCallback(()=>{ if(!engine) return; setShowResult(false); setUserAnswer(''); setLastResult(null); setSelectedOptionIndex(null); setCorrectOptionIndex(null); const nq=engine.nextQuestion(); setCurrentQuestion(nq); if(!nq || engine.isFinished()) setIsFinished(true); }, [engine]);

  useEffect(()=>{ if(showResult && autoAdvance){ const t=setTimeout(()=> handleNext(), 2000); return ()=> clearTimeout(t); } }, [showResult,autoAdvance,handleNext]);

  // Speak the question when it changes
  useEffect(() => {
    if (currentQuestion && autoRead) {
      speakQuestion(currentQuestion.prompt, readLanguage);
    }
  }, [currentQuestion, autoRead, readLanguage]);

  const handleFinish=()=>{ if(engine){ const s=engine.serialize(); saveProgress(libraryId,s).catch((e: unknown) => console.error(e)); idbSetItem(`study-session-${libraryId}`, s); } if(id) navigate(getLibraryDetailPath(id)); };
  const handleResetSession=()=>{ (async()=>{ try { const { LearnEngine } = await import('@/features/study/utils/learnEngine'); const fresh=new LearnEngine({ cards }); setEngine(fresh); const q=fresh.nextQuestion(); setCurrentQuestion(q); setIsFinished(!q||fresh.isFinished()); const s=fresh.serialize(); idbSetItem(`study-session-${libraryId}`, s); saveProgress(libraryId,s).catch((e: unknown) => console.error(e)); } catch(e){ console.error('Không thể reset phiên học tập:', e);} })(); };

  if(loadingData) return <StudyLoading />;
  if(loadError) return <StudyError error={loadError} />;
  if(!library) return null;

  const progress=engine?.getProgressDetailed();

  // Finished state
  if(isFinished){ return <StudyFinished handleFinish={handleFinish} handleResetSession={handleResetSession} />; }

  if(!currentQuestion) return (<div className='py-12 text-center'>Đang khởi tạo...</div>);

  return (
    <div className='space-y-6'>
      <StudyBreadcrumb />
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
        setAllowMC={setAllowMC}
        setAllowTyped={setAllowTyped}
        setAutoAdvance={setAutoAdvance}
        setShowCardProgress={setShowCardProgress}
        setAutoRead={setAutoRead}
        setReadLanguage={setReadLanguage}
        handleResetSession={handleResetSession}
      />
    

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
          autoRead={autoRead}
          readLanguage={readLanguage}
          speakQuestion={speakQuestion}
          handleAnswer={handleAnswer}
          handleNext={handleNext}
        />
      )}

      {progress && <StatsCard progress={progress} />}

      {showCardProgress && engine && (
        <CardProgressCard
          engine={engine}
          showCardAnswers={showCardAnswers}
          setShowCardAnswers={setShowCardAnswers}
        />
      )}
    </div>
  )
}
