import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
// Tabs removed (merged views)
import { 
  ArrowLeft,
  Share2,
  Download,
  Heart,
  Target,
  BookOpen,
  BarChart3,
  LayoutGrid,
  List as ListIcon,
  UserPlus,
} from "lucide-react"
import { getLibraryMeta, listCards, createCard, createCardsBulk, updateCard, deleteCardsBulk, listShares, addShare, removeShare as removeShareRecord, updateShareRole, getUserProfile, findUserByEmail, createAccessRequest, listUserAccessRequests, listenCurrentUserShareForLibrary } from '@/lib/firebaseLibraryService'
import FlashCard from '@/components/FlashCard'
import { useFavoriteLibraries } from '@/hooks/useFavorites'
import { useLibraryProgress } from '@/hooks/useLibraryProgress'
import { useProgressSummary } from '@/hooks/useProgressSummary'
import type { Card as EngineCard, LibraryMeta } from '@/lib/models'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
// Table import removed (switched to card/grid layout)
import { CardPagination } from '@/components/ui/pagination'
// Icons for future enhancements can be added here
// ...existing imports...

// Simple Progress component without external dependency
const Progress = ({ value, className = "" }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${value}%` }}
    />
  </div>
)

export default function LibraryDetail() {
  const { id } = useParams()
  const { favoriteIds, toggleFavorite } = useFavoriteLibraries();
  const isFavorite = id ? favoriteIds.includes(id) : false;
  const [library, setLibrary] = useState<LibraryMeta | null>(null)
  const [cards, setCards] = useState<EngineCard[]>([])
  const [loading, setLoading] = useState(true)
  const [openAddCard, setOpenAddCard] = useState(false)
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [adding, setAdding] = useState(false)
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [bulkPreview, setBulkPreview] = useState<{front: string; back: string}[]>([])
  // Card management state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editCardId, setEditCardId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editDomain, setEditDomain] = useState('');
  const [editDifficulty, setEditDifficulty] = useState<'easy'|'medium'|'hard'|''>('');
  // Share dialog state
  const [shareOpen, setShareOpen] = useState(false);
  const [shares, setShares] = useState<Awaited<ReturnType<typeof listShares>>>([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer'|'contributor'>('viewer');
  const [inviteLoading, setInviteLoading] = useState(false);
  // const [updatingShareId, setUpdatingShareId] = useState<string|null>(null); // optional visual spinner
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [emailLookupResults, setEmailLookupResults] = useState<{ id: string; email?: string; displayName?: string }[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [ownerProfile, setOwnerProfile] = useState<{ id: string; email?: string; displayName?: string; avatarUrl?: string }|null>(null);
  const [accessRequests, setAccessRequests] = useState<Awaited<ReturnType<typeof listUserAccessRequests>>>([]);
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [liveShareRole, setLiveShareRole] = useState<'viewer'|'contributor'|null>(null);
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  // View mode (grid or list) for unified cards/progress view
  const [viewMode, setViewMode] = useState<'grid'|'list'>('grid');
  // (filters moved below after rawState hook)

  // progress hook
  const { stats: progStats, rawState } = useLibraryProgress(id); // basic stats + raw engine state
  const { summary } = useProgressSummary(id); // new detailed summary from engineState

  // Filters (after rawState is available)
  const [search, setSearch] = useState('');
  const [filterDomain, setFilterDomain] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterMastery, setFilterMastery] = useState('');
  const domainOptions = Array.from(new Set(cards.map(c => c.domain).filter(Boolean))) as string[];
  const difficultyOptions = Array.from(new Set(cards.map(c => c.difficulty).filter(Boolean))) as string[];
  interface CSLiteF { id: string; mastery?: number; seenCount?: number }
  const masteryMap = useMemo(()=>{
    const map = new Map<string, CSLiteF>();
    if (rawState && typeof rawState === 'object' && Array.isArray((rawState as { states?: unknown }).states)) {
      for (const s of (rawState as { states: unknown[] }).states) {
        if (s && typeof s === 'object' && 'id' in s) {
          map.set((s as CSLiteF).id, s as CSLiteF);
        }
      }
    }
    return map;
  }, [rawState]);
  const filteredCards = useMemo(()=>{
    return cards.filter(c => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.front.toLowerCase().includes(q) && !c.back.toLowerCase().includes(q)) return false;
      }
      if (filterDomain && c.domain !== filterDomain) return false;
      if (filterDifficulty && c.difficulty !== filterDifficulty) return false;
      if (filterMastery) {
        const st = masteryMap.get(c.id);
        const m = st?.mastery ?? 0; const seen = (st?.seenCount ?? 0) > 0;
        if (filterMastery === 'mastered' && m < 5) return false;
        if (filterMastery === 'learning' && !(m < 5 && seen)) return false;
        if (filterMastery === 'fresh' && seen) return false;
      }
      return true;
    });
  }, [cards, search, filterDomain, filterDifficulty, filterMastery, masteryMap]);
  useEffect(()=>{ setPage(1); setSelectedIds(prev=> prev.filter(id => filteredCards.some(c=>c.id===id))); }, [search, filterDomain, filterDifficulty, filterMastery, cards, filteredCards]);
  const totalPages = Math.max(1, Math.ceil(filteredCards.length / pageSize));
  const paginatedCards = filteredCards.slice((page-1)*pageSize, (page-1)*pageSize + pageSize);
  // Parse bulk text when it changes (format: front|back per line)
  useEffect(()=>{
    if(!bulkMode) { setBulkPreview([]); return; }
    const lines = bulkText.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
    const parsed: {front: string; back: string}[] = [];
    for (const line of lines) {
      const idx = line.indexOf('|');
      if (idx === -1) continue; // skip invalid line
      const f = line.slice(0, idx).trim();
      const b = line.slice(idx+1).trim();
      if (f && b) parsed.push({ front: f, back: b });
    }
    setBulkPreview(parsed);
  }, [bulkText, bulkMode]);
  // (hooks already declared above)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!id) return
      setLoading(true)
      try {
        const meta = await getLibraryMeta(id)
        if (!cancelled) setLibrary(meta)
        if (meta) {
          const cs = await listCards(meta.id)
          if (!cancelled) setCards(cs)
          // If private, fetch shares now to determine access rights
          if (meta.visibility === 'private') {
            try { const sh = await listShares(meta.id); if(!cancelled){ setShares(sh); } } catch {/* ignore */}
          }
          // Owner profile
          if(meta && meta.ownerId){ try { const p = await getUserProfile(meta.ownerId); if(!cancelled) setOwnerProfile(p); } catch{/*ignore*/} }
          // Existing access requests for user
          if(meta){ try { const reqs = await listUserAccessRequests(meta.id); if(!cancelled) setAccessRequests(reqs); } catch{/* ignore */} }
        }
        // capture user id lazily
        const authMod = await import('@/lib/firebaseClient');
        const auth = authMod.getFirebaseAuth();
        if (auth.currentUser && !cancelled) setCurrentUserId(auth.currentUser.uid);
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  // Realtime subscribe to share grant specifically for this library (after we know id)
  useEffect(()=>{
    if(!id) return; let unsub: (()=>void)|null = null; try { unsub = listenCurrentUserShareForLibrary(id, share=>{ setLiveShareRole(share? share.role : null); }); } catch {/* ignore */} return ()=>{ if(unsub) unsub(); };
  }, [id]);

  // Load shares when dialog opens
  useEffect(()=>{
    if (!shareOpen || !id) return; let cancelled=false; (async()=>{
      setLoadingShares(true);
      try { const list = await listShares(id); if(!cancelled) setShares(list); } finally { if(!cancelled) setLoadingShares(false);} })();
      return ()=>{ cancelled=true };
  }, [shareOpen, id]);

  // Lookup by email debounce (simple)
  useEffect(()=>{ if(!inviteEmail){ setEmailLookupResults([]); return; } const t = setTimeout(async()=>{ setLookupLoading(true); try { const res = await findUserByEmail(inviteEmail.trim()); setEmailLookupResults(res);} finally { setLookupLoading(false);} }, 400); return ()=> clearTimeout(t); }, [inviteEmail]);

  // Debug log
  console.log("LibraryDetail rendered with ID:", id)

  // Hàm xử lý khi cập nhật thẻ học
  // legacy handlers removed

  // Nếu không tìm thấy thư viện, redirect về trang library
  if (!library && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
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

  const total = library?.cardCount || cards.length;
  const isOwner = library && currentUserId && library.ownerId === currentUserId;
  const hasShareAccess = shares.some(s => s.targetUserId === currentUserId) || !!liveShareRole;
  const canStudy = !!library && (library.visibility === 'public' || isOwner || hasShareAccess);
  const canModify = !!library && (isOwner || hasShareAccess); // contributors/viewers gating could refine later
  const hasPendingRequest = !canStudy && accessRequests.some(r=> r.status==='pending');
  // Prefer realtime summary if available
  const masteredVal = summary ? summary.mastered : progStats.mastered;
  const learningVal = summary ? summary.learning : progStats.learning;
  const masteredPct = total ? Math.round((masteredVal/total)*100) : 0;
  const learningPct = total ? Math.round((learningVal/total)*100) : 0;
  const stats: { title: string; value: string | number; percentage: number; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { title: 'Tổng thẻ', value: total, percentage: 100, icon: Target, color: 'text-blue-600' },
  { title: 'Đã thuộc', value: masteredVal, percentage: masteredPct, icon: BookOpen, color: 'text-green-600' },
  { title: 'Đang học', value: learningVal, percentage: learningPct, icon: BarChart3, color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard/my-library">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{library?.title}</h1>
              <p className="text-muted-foreground">
                {library?.cardCount} thẻ
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { if(id) toggleFavorite(id, isFavorite); }}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            {isOwner && (
              <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" title="Chia sẻ">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Chia sẻ thư viện</DialogTitle>
                  </DialogHeader>
                  <ShareManager
                    libraryId={id!}
                    shares={shares}
                    loading={loadingShares}
                    currentUserId={currentUserId}
                    ownerId={library?.ownerId || ''}
                    inviteEmail={inviteEmail}
                    onInviteEmailChange={setInviteEmail}
                    inviteRole={inviteRole}
                    onInviteRoleChange={setInviteRole}
                    onInvite={async(userId, role)=>{
                      if(!id) return; 
                      setInviteLoading(true);
                      try { 
                        await addShare(id, userId, role); 
                        const list = await listShares(id); 
                        setShares(list); 
                        setInviteEmail(''); 
                        toast.success('Đã chia sẻ'); 
                      } catch(e){ 
                        console.error(e); 
                        toast.error('Lỗi chia sẻ'); 
                      } finally { 
                        setInviteLoading(false);
                      }
                    }}
                    removeShare={async (shareId: string)=>{ try { await removeShareRecord(shareId); if(id){ const list = await listShares(id); setShares(list);} toast.success('Đã hủy chia sẻ'); } catch{ toast.error('Lỗi'); } }}
                    updateRole={async (shareId: string, role: 'viewer'|'contributor')=>{ try { await updateShareRole(shareId, role); if(id){ const list = await listShares(id); setShares(list);} toast.success('Đã cập nhật'); } catch{ toast.error('Lỗi cập nhật'); } }}
                    searching={lookupLoading}
                    searchResults={emailLookupResults}
                    inviteLoading={inviteLoading}
                  />
                </DialogContent>
              </Dialog>
            )}
            <Button variant="ghost" size="icon" disabled={!canStudy} title={!canStudy? 'Không có quyền tải xuống':'Tải'}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Link to={canStudy? `/dashboard/study/${id}` : '#'} onClick={e=> { if(!canStudy) e.preventDefault(); }}>
            <Button size="default" disabled={!canStudy} title={!canStudy? 'Bạn không có quyền học thư viện riêng tư này':''}>
              <BookOpen className="h-4 w-4 mr-2" />
              Bắt đầu học
            </Button>
          </Link>
          <Link to={canStudy? `/dashboard/test-setup/${id}` : '#'} onClick={e=> { if(!canStudy) e.preventDefault(); }}>
            <Button variant="outline" size="default" disabled={!canStudy} title={!canStudy? 'Bạn không có quyền kiểm tra thư viện này':''}>
              <Target className="h-4 w-4 mr-2" />
              Kiểm tra
            </Button>
          </Link>
          {/* Add Card Dialog Trigger moved here */}
          <Dialog open={openAddCard} onOpenChange={setOpenAddCard}>
            <DialogTrigger asChild>
              <Button variant="outline" size="default" disabled={!canModify} title={!canModify? 'Không thể thêm thẻ':''}>Thêm thẻ</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm thẻ {bulkMode ? '(Nhiều)' : ''}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <button type="button" className="underline" onClick={()=>setBulkMode(m=>!m)}>
                    {bulkMode ? 'Chế độ 1 thẻ' : 'Chế độ nhiều thẻ'}
                  </button>
                  {bulkMode && <div>{bulkPreview.length} dòng hợp lệ</div>}
                </div>
                {!bulkMode && (
                  <>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Mặt trước</label>
                      <Input value={front} onChange={(e)=>setFront(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Mặt sau</label>
                      <Input value={back} onChange={(e)=>setBack(e.target.value)} />
                    </div>
                  </>
                )}
                {bulkMode && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Danh sách thẻ ( mỗi dòng: mặt trước|mặt sau )</label>
                    <textarea
                      className="w-full h-48 border rounded-md p-2 text-sm bg-background"
                      value={bulkText}
                      onChange={e=>setBulkText(e.target.value)}
                      placeholder={`Ví dụ:\nhello|xin chào\nworld|thế giới`}
                    />
                    {bulkText && bulkPreview.length === 0 && (
                      <div className="text-xs text-red-500">Không có dòng hợp lệ. Định dạng: mặt trước|mặt sau</div>
                    )}
                    {bulkPreview.length > 0 && (
                      <div className="max-h-32 overflow-auto border rounded p-2 text-xs space-y-1 bg-muted/30">
                        {bulkPreview.slice(0,20).map((p,i)=>(
                          <div key={i} className="flex justify-between gap-2"><span className="truncate font-medium" title={p.front}>{p.front}</span><span className="text-muted-foreground">|</span><span className="truncate" title={p.back}>{p.back}</span></div>
                        ))}
                        {bulkPreview.length > 20 && <div className="text-muted-foreground">... {bulkPreview.length - 20} dòng nữa</div>}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={()=>setOpenAddCard(false)}>Hủy</Button>
                {!bulkMode && (
                  <Button disabled={!front || !back || adding} onClick={async ()=>{
                    if (!library) return;
                    try {
                      setAdding(true);
                      await createCard({ libraryId: library.id, front, back });
                      setFront(''); setBack(''); setOpenAddCard(false);
                      const cs = await listCards(library.id); setCards(cs);
                      toast.success('Đã thêm thẻ');
                    } finally { setAdding(false); }
                  }}>{adding ? 'Đang lưu...' : 'Lưu'}</Button>
                )}
                {bulkMode && (
                  <Button disabled={bulkPreview.length===0 || adding} onClick={async ()=>{
                    if (!library) return;
                    try {
                      setAdding(true);
                      const created = await createCardsBulk(library.id, bulkPreview);
                      setBulkText(''); setOpenAddCard(false);
                      const cs = await listCards(library.id); setCards(cs);
                      console.log('Bulk created', created, 'cards');
                      toast.success(`Đã thêm ${created} thẻ`);
                    } finally { setAdding(false); }
                  }}>{adding ? 'Đang lưu...' : `Lưu (${bulkPreview.length})`}</Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Library Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Mô tả</h3>
                <p className="text-muted-foreground">{library?.description}</p>
              </div>
              
              <div className="flex items-center gap-2">
                {(library?.tags || []).map((tag: string, index: number) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="text-xs">Visibility: {library?.visibility}</div>
                {library && !canStudy && (
                  <div className="text-xs flex items-center gap-1">
                    Chủ sở hữu: <span className="font-medium">{ownerProfile?.displayName || ownerProfile?.email || ownerProfile?.id?.slice(0,6) || '—'}</span>
                  </div>
                )}
              </div>
              {library && !canStudy && (
                <div className="pt-2">
                  <Button size="sm" disabled={hasPendingRequest || requestingAccess} onClick={async()=>{
                    if(!library) return; try { setRequestingAccess(true); await createAccessRequest(library.id, library.ownerId); const reqs = await listUserAccessRequests(library.id); setAccessRequests(reqs); } finally { setRequestingAccess(false); }}}
                    variant={hasPendingRequest? 'outline':'default'}>
                    {hasPendingRequest ? 'Đã gửi yêu cầu' : (requestingAccess? 'Đang gửi...' : 'Yêu cầu truy cập')}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      <span className="text-sm font-medium">{stat.title}</span>
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <Progress value={stat.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FlashCard Learning Section */}
      <Card id="flashcard-section">
        <CardContent className="p-6">
          {canStudy ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Học với Flashcard</h2>
                  <p className="text-muted-foreground">Lật thẻ để ghi nhớ nhanh</p>
                </div>
                <Link to={`/dashboard/study/${id}`}>
                  <Button variant="outline">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Chế độ học khác
                  </Button>
                </Link>
              </div>
              {cards.length > 0 ? (
                <FlashCard
                  cards={cards.map(c => ({ id: c.id, front: c.front, back: c.back, status: 'learning', difficulty: 'medium' }))}
                  onComplete={() => { /* optional: toast */ }}
                />
              ) : (
                <div className="text-sm text-muted-foreground">Chưa có thẻ. Thêm thẻ để bắt đầu.</div>
              )}
            </>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              Thư viện này riêng tư. Bạn không có quyền xem các thẻ.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unified Cards + Progress Section */}
      <div className="space-y-6">
        <ProgressSummarySection total={total} masteredVal={masteredVal} learningVal={learningVal} masteredPct={masteredPct} learningPct={learningPct} due={summary ? summary.due : progStats.due} />
        {canStudy ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedIds.length ? `${selectedIds.length} đã chọn` : `${filteredCards.length} thẻ`}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Input placeholder="Tìm kiếm..." value={search} onChange={e=>setSearch(e.target.value)} className="h-8 w-40" />
                <select value={filterDomain} onChange={e=>setFilterDomain(e.target.value)} className="h-8 border rounded px-2 bg-background text-xs">
                  <option value="">Domain</option>
                  {domainOptions.map(d=> <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={filterDifficulty} onChange={e=>setFilterDifficulty(e.target.value)} className="h-8 border rounded px-2 bg-background text-xs">
                  <option value="">Độ khó</option>
                  {difficultyOptions.map(d=> <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={filterMastery} onChange={e=>setFilterMastery(e.target.value)} className="h-8 border rounded px-2 bg-background text-xs">
                  <option value="">Mastery</option>
                  <option value="mastered">Đã thuộc</option>
                  <option value="learning">Đang học</option>
                  <option value="fresh">Mới</option>
                </select>
                {(filterDomain || filterDifficulty || filterMastery || search) && (
                  <Button variant="outline" size="sm" onClick={()=>{ setSearch(''); setFilterDomain(''); setFilterDifficulty(''); setFilterMastery(''); }}>Clear</Button>
                )}
                <div className="flex items-center gap-1 ml-2">
                  <Button variant={viewMode==='grid' ? 'default':'outline'} size="sm" onClick={()=>setViewMode('grid')} className="h-8 px-2"><LayoutGrid className="h-4 w-4" /></Button>
                  <Button variant={viewMode==='list' ? 'default':'outline'} size="sm" onClick={()=>setViewMode('list')} className="h-8 px-2"><ListIcon className="h-4 w-4" /></Button>
                </div>
                {selectedIds.length > 0 && (
                  <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">Xóa ({selectedIds.length})</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>Xóa {selectedIds.length} thẻ đã chọn? Hành động không thể hoàn tác.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={async ()=>{
                          if (!selectedIds.length) return; if (deleting) return;
                          try { setDeleting(true); const removed = await deleteCardsBulk(selectedIds); const cs = await listCards(id!); setCards(cs); setSelectedIds([]); toast.success(`Đã xóa ${removed} thẻ`); setPage(1);} finally { setDeleting(false); setConfirmDeleteOpen(false);} 
                        }}>{deleting ? 'Đang xóa...' : 'Xóa'}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
            {/* Cards Display */}
            <UnifiedCards
              cards={paginatedCards}
              rawState={rawState}
              viewMode={viewMode}
              selectedIds={selectedIds}
              onToggleSelect={(cid)=> setSelectedIds(s=> s.includes(cid)? s.filter(x=>x!==cid): [...s, cid])}
              onSelectAll={(all)=> all? setSelectedIds(paginatedCards.map(c=>c.id)) : setSelectedIds([])}
              onEdit={(c)=>{ setEditCardId(c.id); setEditFront(c.front); setEditBack(c.back); setEditDomain(c.domain || ''); setEditDifficulty((c.difficulty || '') as ''|'easy'|'medium'|'hard'); }}
              onDeleteSingle={(cid)=>{ setSelectedIds([cid]); setConfirmDeleteOpen(true); }}
              canModify={canModify}
            />
            <CardPagination 
              page={page}
              pageSize={pageSize}
              total={filteredCards.length}
              onPageChange={(p)=> setPage(Math.min(Math.max(1,p), totalPages))}
              onPageSizeChange={(s)=> { setPageSize(s); setPage(1); }}
              className="mt-2"
            />
            {/* Edit Dialog */}
            <Dialog open={!!editCardId} onOpenChange={(o)=>{ if(!o) { setEditCardId(null);} }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sửa thẻ</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1"><label className="text-xs font-medium">Mặt trước</label><Input value={editFront} onChange={e=>setEditFront(e.target.value)} /></div>
                  <div className="space-y-1"><label className="text-xs font-medium">Mặt sau</label><Input value={editBack} onChange={e=>setEditBack(e.target.value)} /></div>
                  <div className="space-y-1"><label className="text-xs font-medium">Domain (tùy chọn)</label><Input value={editDomain} onChange={e=>setEditDomain(e.target.value)} placeholder="vd: biology" /></div>
                  <div className="space-y-1"><label className="text-xs font-medium">Độ khó (tùy chọn)</label>
                    <select value={editDifficulty} onChange={e=> { const val = e.target.value as ''|'easy'|'medium'|'hard'; setEditDifficulty(val); }} className="border rounded w-full h-9 px-2 bg-background text-sm">
                      <option value="">(Không đặt)</option>
                      <option value="easy">Dễ</option>
                      <option value="medium">Trung bình</option>
                      <option value="hard">Khó</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={()=> setEditCardId(null)}>Hủy</Button>
                  <Button onClick={async ()=>{ if(!editCardId) return; await updateCard(editCardId, { front: editFront, back: editBack, domain: editDomain || null, difficulty: editDifficulty || null }); const cs = await listCards(id!); setCards(cs); setEditCardId(null); toast.success('Đã cập nhật thẻ'); }}>Lưu</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground italic">Bạn không có quyền xem danh sách thẻ.</div>
        )}
      </div>
    </div>
  )
}

// Reusable progress summary block
function ProgressSummarySection({ total, masteredVal, learningVal, masteredPct, learningPct, due }: { total: number; masteredVal: number; learningVal: number; masteredPct: number; learningPct: number; due: number | undefined }) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-3 border rounded-md">
          <div className="text-xs text-muted-foreground">Tổng</div>
          <div className="text-xl font-semibold">{total}</div>
        </div>
        <div className="p-3 border rounded-md">
          <div className="text-xs text-muted-foreground">Đã thuộc</div>
          <div className="text-xl font-semibold">{masteredVal}</div>
        </div>
        <div className="p-3 border rounded-md">
          <div className="text-xs text-muted-foreground">Đang học</div>
          <div className="text-xl font-semibold">{learningVal}</div>
        </div>
        <div className="p-3 border rounded-md">
          <div className="text-xs text-muted-foreground">Còn hạn (Due)</div>
          <div className="text-xl font-semibold">{due ?? 0}</div>
        </div>
      </div>
      <div>
        <Progress value={masteredPct} />
        <div className="flex justify-between text-xs mt-1 text-muted-foreground">
          <span>{masteredPct}% đã thuộc</span>
          <span>{learningPct}% đang học</span>
        </div>
      </div>
    </div>
  );
}

// Share manager component
interface ShareManagerProps {
  libraryId: string;
  shares: { id: string; libraryId: string; grantedBy: string; targetUserId: string; role: 'viewer'|'contributor'; createdAt: string }[];
  loading: boolean;
  currentUserId: string;
  ownerId: string;
  inviteEmail: string;
  onInviteEmailChange: (v: string)=>void;
  inviteRole: 'viewer'|'contributor';
  onInviteRoleChange: (r: 'viewer'|'contributor')=>void;
  onInvite: (userId: string, role: 'viewer'|'contributor')=>Promise<void>;
  removeShare: (shareId: string)=>Promise<void>;
  updateRole: (shareId: string, role: 'viewer'|'contributor')=>Promise<void>;
  searching: boolean;
  searchResults: { id: string; email?: string; displayName?: string }[];
  inviteLoading: boolean;
}

function ShareManager(props: ShareManagerProps) {
  const { shares, loading, ownerId, currentUserId, inviteEmail, onInviteEmailChange, inviteRole, onInviteRoleChange, onInvite, removeShare, updateRole, searching, searchResults, inviteLoading } = props;
  const isOwner = ownerId === currentUserId;
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium">Mời bằng email</label>
        <div className="flex gap-2 items-center">
          <Input placeholder="user@example.com" value={inviteEmail} onChange={e=>onInviteEmailChange(e.target.value)} className="flex-1" />
          <select value={inviteRole} onChange={e=>onInviteRoleChange(e.target.value as 'viewer'|'contributor')} className="h-9 border rounded px-2 bg-background text-sm">
            <option value="viewer">Viewer</option>
            <option value="contributor">Contributor</option>
          </select>
          <Button disabled={!inviteEmail || inviteLoading || searching} onClick={async()=>{
            if (!searchResults.length) return; // require exact email match result
            const user = searchResults[0];
            await onInvite(user.id, inviteRole);
          }}>{inviteLoading? 'Đang mời...' : 'Mời'}</Button>
        </div>
        {searching && <div className="text-xs text-muted-foreground">Đang tìm...</div>}
        {!searching && inviteEmail && searchResults.length === 0 && <div className="text-xs text-red-500">Không tìm thấy người dùng</div>}
        {!searching && searchResults.length > 0 && (
          <div className="border rounded p-2 max-h-32 overflow-auto space-y-1 bg-muted/30 text-xs">
            {searchResults.map(u => (
              <div key={u.id} className="flex justify-between items-center">
                <span>{u.displayName || u.email || u.id}</span>
                <Button size="sm" variant="outline" className="h-6 px-2" onClick={async()=>{ await onInvite(u.id, inviteRole); }} disabled={inviteLoading}>Chọn</Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div className="text-sm font-medium flex items-center gap-2"><UserPlus className="h-4 w-4" /> Người được chia sẻ</div>
        {loading ? <div className="text-xs text-muted-foreground">Đang tải...</div> : (
          <div className="border rounded-md divide-y">
            {shares.length === 0 && <div className="p-3 text-xs text-muted-foreground">Chưa chia sẻ cho ai.</div>}
            {shares.map(s => (
              <ShareRow key={s.id} share={s} isOwner={isOwner} updateRole={updateRole} removeShare={removeShare} />
            ))}
          </div>
        )}
      </div>
      {!isOwner && <div className="text-[10px] text-muted-foreground">Chỉ chủ sở hữu mới chỉnh sửa role.</div>}
    </div>
  );
}

function ShareRow({ share, isOwner, updateRole, removeShare }: { share: { id: string; targetUserId: string; role: 'viewer'|'contributor'; grantedBy: string; libraryId: string; createdAt: string }; isOwner: boolean; updateRole: (id: string, r: 'viewer'|'contributor')=>Promise<void>; removeShare: (id: string)=>Promise<void>; }) {
  const [profile, setProfile] = useState<{ id: string; email?: string; displayName?: string }|null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [updating, setUpdating] = useState(false);
  useEffect(()=>{ let cancelled=false; (async()=>{ setLoadingProfile(true); try { const p = await getUserProfile(share.targetUserId); if(!cancelled) setProfile(p); } finally { if(!cancelled) setLoadingProfile(false);} })(); return ()=>{cancelled=true}; }, [share.targetUserId]);
  return (
    <div className="p-3 flex items-center gap-3 text-xs">
      <div className="flex-1">
        <div className="font-medium">
          {loadingProfile ? '...' : (profile?.displayName || profile?.email || share.targetUserId)}
        </div>
        <div className="text-[10px] text-muted-foreground">Role: {share.role}</div>
      </div>
      {isOwner ? (
        <select value={share.role} onChange={async e=>{ const val = e.target.value as 'viewer'|'contributor'; setUpdating(true); try { await updateRole(share.id, val);} finally { setUpdating(false);} }} className="h-7 border rounded px-2 bg-background">
          <option value="viewer">Viewer</option>
          <option value="contributor">Contributor</option>
        </select>
      ) : (
        <span className="text-muted-foreground text-[11px]">{share.role}</span>
      )}
      {isOwner && (
        <Button size="sm" variant="destructive" className="h-7 px-2" onClick={async()=>{ if(confirm('Hủy chia sẻ?')) await removeShare(share.id); }} disabled={updating}>Xóa</Button>
      )}
    </div>
  );
}

// Reusable cards grid
// Card manager grid with selection & edit actions
// Unified Cards Component (grid/list)
function UnifiedCards({ cards, rawState, viewMode, selectedIds, onToggleSelect, onSelectAll, onEdit, onDeleteSingle, canModify }: {
  cards: EngineCard[];
  rawState: unknown;
  viewMode: 'grid'|'list';
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (all: boolean) => void;
  onEdit: (card: EngineCard) => void;
  onDeleteSingle: (id: string) => void;
  canModify: boolean;
}) {
  interface CSLite { id: string; mastery?: number; seenCount?: number; wrongCount?: number; nextDue?: number }
  const map = new Map<string, CSLite>();
  if (rawState && typeof rawState === 'object' && Array.isArray((rawState as { states?: unknown }).states)) {
    for (const s of (rawState as { states: unknown[] }).states) {
      if (s && typeof s === 'object' && 'id' in s) {
        const cs = s as CSLite; map.set(cs.id, cs);
      }
    }
  }
  const allSelected = cards.length>0 && selectedIds.length===cards.length;
  if (!cards.length) return <div className="text-sm text-muted-foreground border rounded-md p-4">Chưa có thẻ.</div>;
  if (viewMode === 'list') {
    return (
      <div className="overflow-auto border rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left">
              <th className="p-2 w-8"><input type="checkbox" checked={allSelected} onChange={e=>onSelectAll(e.target.checked)} /></th>
              <th className="p-2 w-1/4">Mặt trước</th>
              <th className="p-2 w-1/4">Mặt sau</th>
              <th className="p-2">Domain</th>
              <th className="p-2">Khó</th>
              <th className="p-2">Mastery</th>
              <th className="p-2">Seen</th>
              <th className="p-2">Sai</th>
              <th className="p-2">Due</th>
              <th className="p-2 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {cards.map(c=>{
              const st = map.get(c.id);
              return (
                <tr key={c.id} className="border-t hover:bg-muted/30">
                  <td className="p-2"><input type="checkbox" checked={selectedIds.includes(c.id)} onChange={()=>onToggleSelect(c.id)} /></td>
                  <td className="p-2 truncate" title={c.front}>{c.front}</td>
                  <td className="p-2 truncate" title={c.back}>{c.back}</td>
                  <td className="p-2 text-xs">{c.domain || '-'}</td>
                  <td className="p-2 text-xs">{c.difficulty || '-'}</td>
                  <td className="p-2 text-center">{st?.mastery ?? '-'}</td>
                  <td className="p-2 text-center">{st?.seenCount ?? '-'}</td>
                  <td className="p-2 text-center">{st?.wrongCount ?? '-'}</td>
                  <td className="p-2 text-center">{st?.nextDue ?? '-'}</td>
                  <td className="p-2 text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={()=>onEdit(c)} disabled={!canModify}>Sửa</Button>
                    <Button variant="destructive" size="sm" onClick={()=>onDeleteSingle(c.id)} disabled={!canModify}>Xóa</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
  // Grid mode
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map(c=>{
        const st = map.get(c.id);
        const selected = selectedIds.includes(c.id);
        return (
          <div key={c.id} className={`border rounded-md p-3 flex flex-col gap-2 relative group bg-background hover:shadow-sm transition ${selected? 'ring-2 ring-blue-500':''}`}>
            <div className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" checked={selected} onChange={()=>onToggleSelect(c.id)} />
              <div className="flex-1">
                <div className="font-medium text-sm line-clamp-2" title={c.front}>{c.front}</div>
                <div className="text-xs text-muted-foreground line-clamp-2" title={c.back}>{c.back}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 text-[10px]">
              {c.domain && <Badge variant="outline" className="px-1 py-0 text-[10px]">{c.domain}</Badge>}
              {c.difficulty && <Badge variant="secondary" className="px-1 py-0 text-[10px]">{c.difficulty}</Badge>}
              {typeof st?.mastery === 'number' && <Badge className="px-1 py-0 bg-blue-600 text-white">M{st.mastery}</Badge>}
              {typeof st?.seenCount === 'number' && <Badge variant="outline" className="px-1 py-0">S{st.seenCount}</Badge>}
              {typeof st?.wrongCount === 'number' && st.wrongCount>0 && <Badge variant="destructive" className="px-1 py-0">W{st.wrongCount}</Badge>}
              {typeof st?.nextDue === 'number' && <Badge variant="outline" className="px-1 py-0">D{st.nextDue}</Badge>}
            </div>
            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
              <Button size="sm" variant="outline" className="h-7 px-2" onClick={()=>onEdit(c)} disabled={!canModify}>Sửa</Button>
              <Button size="sm" variant="destructive" className="h-7 px-2" onClick={()=>onDeleteSingle(c.id)} disabled={!canModify}>Xóa</Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
