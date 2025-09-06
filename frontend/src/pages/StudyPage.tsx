import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { H1, H2, H3, H4 } from '@/shared/components/ui/typography'
import { Badge } from '@/shared/components/ui/badge'
import { Input } from '@/shared/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/shared/components/ui/breadcrumb'
import { ArrowLeft, BookOpen, Keyboard, Home, Check, X, BarChart3, RotateCcw, Settings } from 'lucide-react'
import { Switch } from '@/shared/components/ui/switch'
import { libraryRepository } from '@/shared/lib/repositories/LibraryRepository'
import { cardRepository } from '@/shared/lib/repositories/CardRepository'
import { loadProgress, saveProgress } from '@/shared/lib/firebaseProgressService'
import type { Question, Result, Card as LearnCard, SerializedState, LearnEngine as LearnEngineType } from '@/shared/lib/learnEngine'
import type { LibraryMeta } from '@/shared/lib/models'
import { idbGetItem, idbSetItem } from '@/shared/lib/indexedDB'
import { useAuth } from '@/shared/hooks/useAuthRedux'

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
  // Data
  const [library,setLibrary]=useState<LibraryMeta|null>(null);
  const [cards,setCards]=useState<LearnCard[]>([]);
  const [loadingData,setLoadingData]=useState(true);
  const [loadError,setLoadError]=useState<string|null>(null);

  // Load data
  useEffect(()=>{ let cancelled=false; if(!libraryId) return; (async()=>{ setLoadingData(true); setLoadError(null); try { const meta=await libraryRepository.getLibraryMeta(libraryId); if(!meta){ if(!cancelled) navigate('/dashboard/my-library'); return; } const c=await cardRepository.listCards(libraryId); if(cancelled) return; setLibrary(meta); setCards(c.map(cd=> ({...cd, domain: meta.subject || cd.domain }))); } catch(e:any){ if(!cancelled) setLoadError(e?.message||'Không tải được dữ liệu'); } finally { if(!cancelled) setLoadingData(false);} })(); return ()=>{ cancelled=true }; }, [libraryId,navigate]);

  // Init engine & restore
  useEffect(()=>{ let cancelled=false; async function init(){ if(loadingData||!library||!cards.length) return; try { const { LearnEngine } = await import('@/shared/lib/learnEngine'); if(cancelled) return; const eng=new LearnEngine({ cards }); let restored=false; try { const remote=await loadProgress(libraryId); if(remote){ eng.restore(remote); restored=true; } } catch{} if(!restored){ try { const local=await idbGetItem<unknown>(`study-session-${libraryId}`); if(local && typeof local==='object' && local!==null && 'params' in local && 'states' in local){ eng.restore(local as SerializedState); restored=true; } } catch{} } if(cancelled) return; setEngine(eng); const q=eng.nextQuestion(); setCurrentQuestion(q); if(!q||eng.isFinished()) setIsFinished(true); } catch(e){ console.error('Khởi tạo LearnEngine thất bại:', e);} } init(); return ()=>{ cancelled=true }; }, [cards,library,libraryId,loadingData]);

  // Autosave
  useEffect(()=>{ const saveFn=()=>{ if(engine && !isFinished){ const s=engine.serialize(); idbSetItem(`study-session-${libraryId}`, s); saveProgress(libraryId, s).catch(()=>{}) } }; const vis=()=>{ if(document.visibilityState==='hidden') saveFn(); }; window.addEventListener('beforeunload', saveFn); document.addEventListener('visibilitychange', vis); return ()=>{ saveFn(); window.removeEventListener('beforeunload', saveFn); document.removeEventListener('visibilitychange', vis);} }, [engine,isFinished,libraryId]);

  // Mode preference sync
  useEffect(()=>{ if(!engine) return; if(!allowMC && !allowTyped){ setAllowMC(true); engine.setModePreferences({ mc:true, typed:false }); return; } engine.setModePreferences({ mc:allowMC, typed:allowTyped }); if(currentQuestion){ const needChange=(currentQuestion.mode==='MULTIPLE_CHOICE' && !allowMC) || (currentQuestion.mode==='TYPED_RECALL' && !allowTyped); if(needChange){ try { const regen=engine.generateQuestionForCard(currentQuestion.cardId); setCurrentQuestion(regen); setShowResult(false); setUserAnswer(''); setLastResult(null); setSelectedOptionIndex(null); setCorrectOptionIndex(null); } catch { const fb=engine.nextQuestion(); setCurrentQuestion(fb); } } } }, [allowMC,allowTyped,engine,currentQuestion]);

  // Answer handling
  let debounceTimer: number | undefined; const DEBOUNCE_MS=4000;
  const handleAnswer=(answer:string|number)=>{ if(!engine||!currentQuestion) return; let ans=answer; let sel:number|null=null; let cor:number|null=null; if(currentQuestion.mode==='MULTIPLE_CHOICE' && typeof answer==='string'){ sel=currentQuestion.options.findIndex(o=>o===answer); const card=cards.find(c=>c.id.toString()===currentQuestion.cardId); if(card){ cor=currentQuestion.options.findIndex(o=>o===card.back); ans= sel===cor?0:sel; } } const result=engine.submitAnswer(currentQuestion.cardId, ans); try { const state=engine.serialize(); idbSetItem(`study-session-${libraryId}`, state); if(debounceTimer) window.clearTimeout(debounceTimer); debounceTimer=window.setTimeout(()=>{ saveProgress(libraryId,state).catch(()=>{}); }, DEBOUNCE_MS); } catch{} setLastResult(result); setShowResult(true); setSelectedOptionIndex(sel); setCorrectOptionIndex(cor); };

  const handleNext=useCallback(()=>{ if(!engine) return; setShowResult(false); setUserAnswer(''); setLastResult(null); setSelectedOptionIndex(null); setCorrectOptionIndex(null); const nq=engine.nextQuestion(); setCurrentQuestion(nq); if(!nq || engine.isFinished()) setIsFinished(true); }, [engine]);

  useEffect(()=>{ if(showResult && autoAdvance){ const t=setTimeout(()=> handleNext(), 2000); return ()=> clearTimeout(t); } }, [showResult,autoAdvance,handleNext]);

  const handleFinish=()=>{ if(engine){ const s=engine.serialize(); saveProgress(libraryId,s).catch(()=>{}); idbSetItem(`study-session-${libraryId}`, s); } navigate(`/dashboard/library/${id}`); };
  const handleResetSession=()=>{ (async()=>{ try { const { LearnEngine } = await import('@/shared/lib/learnEngine'); const fresh=new LearnEngine({ cards }); setEngine(fresh); const q=fresh.nextQuestion(); setCurrentQuestion(q); setIsFinished(!q||fresh.isFinished()); const s=fresh.serialize(); idbSetItem(`study-session-${libraryId}`, s); saveProgress(libraryId,s).catch(()=>{}); } catch(e){ console.error('Không thể reset phiên học tập:', e);} })(); };

  if(loadingData) return (<div className='space-y-6'><Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink asChild><Link to='/dashboard'><Home className='h-4 w-4'/></Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator/><BreadcrumbItem><BreadcrumbLink asChild><Link to='/dashboard/my-library'>Thư viện</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator/><BreadcrumbItem><BreadcrumbPage>Học tập</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb><div className='text-center py-12'><BookOpen className='mx-auto h-16 w-16 text-muted-foreground mb-4'/><H3 className='text-2xl font-semibold mb-2'>Đang tải dữ liệu...</H3></div></div>);
  if(loadError) return (<div className='space-y-6'><Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink asChild><Link to='/dashboard'><Home className='h-4 w-4'/></Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator/><BreadcrumbItem><BreadcrumbLink asChild><Link to='/dashboard/my-library'>Thư viện</Link></BreadcrumbLink></BreadcrumbItem></BreadcrumbList></Breadcrumb><Card className='max-w-xl mx-auto'><CardContent className='py-12 text-center space-y-4'><H3 className='font-semibold'>Lỗi tải dữ liệu</H3><p className='text-muted-foreground'>{loadError}</p><Button onClick={()=> window.location.reload()}>Thử lại</Button></CardContent></Card></div>);
  if(!library) return null;

  const progress=engine?.getProgressDetailed();

  // Finished state
  if(isFinished){ return (<div className='space-y-6'>/* simplified finished view omitted for brevity */<Button onClick={handleFinish}>Quay lại thư viện</Button><Button variant='outline' onClick={handleResetSession}>Học lại từ đầu</Button></div>); }

  if(!currentQuestion) return (<div className='py-12 text-center'>Đang khởi tạo...</div>);

  return (
    <div className='space-y-6'>
      <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink asChild><Link to='/dashboard'><Home className='h-4 w-4'/></Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator/><BreadcrumbItem><BreadcrumbLink asChild><Link to='/dashboard/my-library'>Thư viện</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator/><BreadcrumbItem><BreadcrumbPage>Học tập</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Link to={`/dashboard/library/${id}`}><Button variant='ghost' size='icon'><ArrowLeft className='h-4 w-4'/></Button></Link>
          <div><H1 className='text-3xl font-bold'>Học với {library.title}</H1><p className='text-muted-foreground'>Thuật toán thích ứng - {currentQuestion.mode==='MULTIPLE_CHOICE'?'Trắc nghiệm':'Đánh máy'}</p></div>
        </div>
                                <Popover><PopoverTrigger asChild><Button variant='outline' size='icon'><Settings className='h-4 w-4'/></Button></PopoverTrigger><PopoverContent className='w-72' align='end'><div className='space-y-4'><div className='space-y-1'><div className='text-sm font-medium'>Tùy chọn học tập</div></div><div className='space-y-3'><Switch checked={allowMC} onCheckedChange={v=> setAllowMC(!!v)} label='Trắc nghiệm'/><Switch checked={allowTyped} onCheckedChange={v=> setAllowTyped(!!v)} label='Viết đáp án'/><Switch checked={autoAdvance} onCheckedChange={v=> setAutoAdvance(!!v)} label='Tự chuyển câu'/></div><div className='pt-2 border-t space-y-2'><Button variant='outline' size='sm' onClick={handleResetSession} className='w-full justify-start'><RotateCcw className='h-4 w-4 mr-2'/>Reset phiên</Button><Button variant='outline' size='sm' onClick={()=> setShowCardProgress(s=>!s)} className='w-full justify-start'><BarChart3 className='h-4 w-4 mr-2'/>{showCardProgress?'Ẩn chi tiết':'Xem chi tiết'}</Button></div><div className='text-xs text-muted-foreground'>Phiên được tự động lưu.</div></div></PopoverContent></Popover>
      </div>
    

      {/* Question Card */}
      <Card className="max-w-4xl mx-auto">
      </Card>

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
            <H2 className="text-2xl font-bold mb-4">{currentQuestion.prompt}</H2>
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
                  <H3 className="text-2xl font-bold text-green-600">
                    {lastResult === "Correct" ? "Chính xác!" : "Gần đúng!"}
                  </H3>
                  {lastResult === "CorrectMinor" && (
                    <p className="text-muted-foreground">
                      Có sai chính tả nhỏ nhưng vẫn được chấp nhận
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <X className="h-16 w-16 text-red-500 mx-auto" />
                  <H3 className="text-2xl font-bold text-red-600">Chưa đúng!</H3>
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
                <H4 className="font-semibold mb-2">Tổng quan trạng thái</H4>
                <div className="text-sm text-muted-foreground">
                  Tổng số thẻ: {engine.getAllCardStates().length} | 
                  Đã hoàn thành: {engine.getAllCardStates().filter((state) => state.mastery >= 5).length} | 
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
