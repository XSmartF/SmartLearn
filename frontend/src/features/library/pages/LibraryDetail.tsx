import { useEffect, useState, useMemo } from 'react'
import { H1, H2, H3 } from '@/shared/components/ui/typography';
import LibraryDetailSkeleton from '@/features/library/components/LibraryDetailSkeleton'
import { useParams, Link, useLoaderData, useNavigate } from 'react-router-dom'
import { Card, CardContent } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
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
  Trash2,
} from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
// Repository instances + combined helper
import { libraryRepository } from '@/shared/lib/repositories/LibraryRepository'
import { cardRepository } from '@/shared/lib/repositories/CardRepository'
import { shareRepository } from '@/shared/lib/repositories/ShareRepository'
import { userRepository } from '@/shared/lib/repositories/UserRepository'
// Inlined previous fetchLibraryWithCards helper (removed facade dependency)
import { idbGetItem, idbSetItem } from '@/shared/lib/indexedDB'
import FlashCard from '@/shared/components/FlashCard'
import { useFavoriteLibraries } from '@/shared/hooks/useFavorites'
import { useLibraryProgress } from '@/shared/hooks/useLibraryProgress'
import { useProgressSummary } from '@/shared/hooks/useProgressSummary'
import type { Card as EngineCard, LibraryMeta, LibraryShare } from '@/shared/lib/models'
import type { AccessRequestDoc } from '@/shared/lib/repositories/UserRepository'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/shared/components/ui/dialog'
import ConfirmDialog from '@/shared/components/ConfirmDialog'
import { Input } from '@/shared/components/ui/input'
import { toast } from 'sonner'
// Table import removed (switched to card/grid layout)
import { CardPagination } from '@/shared/components/ui/pagination'
// Icons for future enhancements can be added here
// ...existing imports...
// Extracted components
import { ProgressSummarySection, ShareManager, UnifiedCards, LeaderboardSection } from '../components'

import { Progress } from "@/shared/components/ui/progress"
import { getTestSetupPath, getStudyPath, ROUTES } from '@/shared/constants/routes'

export default function LibraryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  // Loader (from route) may have provided library meta already
  const loaderData = useLoaderData() as { library?: LibraryMeta | null } | null;
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
  const [bulkPreview, setBulkPreview] = useState<{ front: string; back: string }[]>([])
  // Card management state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editCardId, setEditCardId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteLibraryOpen, setConfirmDeleteLibraryOpen] = useState(false);
  const [deletingLibrary, setDeletingLibrary] = useState(false);
  const [editDomain, setEditDomain] = useState('');
  const [editDifficulty, setEditDifficulty] = useState<'easy' | 'medium' | 'hard' | ''>('');
  // Share dialog state
  const [shareOpen, setShareOpen] = useState(false);
  const [shares, setShares] = useState<LibraryShare[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'contributor'>('viewer');
  const [inviteLoading, setInviteLoading] = useState(false);
  // const [updatingShareId, setUpdatingShareId] = useState<string|null>(null); // optional visual spinner
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [emailLookupResults, setEmailLookupResults] = useState<{ id: string; email?: string; displayName?: string }[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [ownerProfile, setOwnerProfile] = useState<{ id: string; email?: string; displayName?: string; avatarUrl?: string } | null>(null);
  const [accessRequests, setAccessRequests] = useState<AccessRequestDoc[]>([]);
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [liveShareRole, setLiveShareRole] = useState<'viewer' | 'contributor' | null>(null);
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  // View mode (grid or list) for unified cards/progress view
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // (filters removed per request)
  // Search (giữ lại theo yêu cầu)
  const [search, setSearch] = useState('');

  // progress hook
  const { stats: progStats, rawState } = useLibraryProgress(id); // basic stats + raw engine state
  const { summary } = useProgressSummary(id); // new detailed summary from engineState

  // Áp dụng search đơn giản (không domain/difficulty/mastery)
  const filteredCards = useMemo(() => {
    if (!search) return cards;
    const q = search.toLowerCase();
    return cards.filter(c => c.front.toLowerCase().includes(q) || c.back.toLowerCase().includes(q));
  }, [cards, search]);
  const totalPages = Math.max(1, Math.ceil(filteredCards.length / pageSize));
  const paginatedCards = useMemo(() => filteredCards.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize), [filteredCards, page, pageSize]);
  useEffect(() => { setPage(1); setSelectedIds(prev => prev.filter(id => filteredCards.some(c => c.id === id))); }, [search, filteredCards]);
  useEffect(() => { setPage(1); }, [pageSize, filteredCards.length]);
  // Parse bulk text when it changes (format: front|back per line)
  useEffect(() => {
    if (!bulkMode) { setBulkPreview([]); return; }
    const lines = bulkText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const parsed: { front: string; back: string }[] = [];
    for (const line of lines) {
      const idx = line.indexOf('|');
      if (idx === -1) continue; // skip invalid line
      const f = line.slice(0, idx).trim();
      const b = line.slice(idx + 1).trim();
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
        // Use loader-provided meta if available to avoid extra request
        let meta: LibraryMeta | null | undefined = loaderData?.library;
        if (!meta) {
          // Try cache (IndexedDB) first
          const cached = await idbGetItem<{ meta: LibraryMeta | null; cards: EngineCard[] }>(`library:${id}`)
          if (cached && !cancelled) {
            setLibrary(cached.meta)
            setCards(cached.cards)
          }
          // Network fetch combined
          // Inline: parallel fetch meta + cards with preferCache behavior
          const [fMeta, fCards] = await Promise.all([
            libraryRepository.getLibraryMeta(id),
            cardRepository.listCardsPreferCache(id)
          ]);
          meta = fMeta;
          if (!cancelled) {
            setLibrary(meta);
            setCards(fCards);
            idbSetItem(`library:${id}`, { meta, cards: fCards, cachedAt: Date.now() }).catch(() => { })
          }
        }
        if (!cancelled) setLibrary(meta)
        if (meta && meta.id) {
          // Start realtime subscription for cards
          const unsubCards = cardRepository.listenLibraryCards(meta.id, (cs: EngineCard[]) => {
            // Remove temp-* duplicates: map by (front,back)
            setCards(prev => {
              const real = cs;
              const realKey = new Set(real.map(r => `${r.front}||${r.back}`));
              const mergedTemps = prev.filter(p => p.id.startsWith('temp-') && !realKey.has(`${p.front}||${p.back}`));
              const merged = [...mergedTemps, ...real];
              return merged;
            });
            idbSetItem(`library:${meta!.id}`, { meta: meta!, cards: cs, cachedAt: Date.now() }).catch(() => { })
          })
          // store unsub on closure
          cleanupSubs.push(unsubCards)
          // If private, fetch shares now to determine access rights
          if (meta.visibility === 'private') {
            try { const sh = await shareRepository.listShares(meta.id); if (!cancelled) { setShares(sh); } } catch {/* ignore */ }
          }
          // Owner profile
          if (meta && meta.ownerId) { try { const p = await userRepository.getUserProfile(meta.ownerId); if (!cancelled) setOwnerProfile(p); } catch {/*ignore*/ } }
          // Existing access requests for user
          if (meta) { try { const reqs = await userRepository.listUserAccessRequests(meta.id); if (!cancelled) setAccessRequests(reqs); } catch {/* ignore */ } }
        }
        // capture user id lazily
        const authMod = await import('@/shared/lib/firebaseClient');
        const auth = authMod.getFirebaseAuth();
        if (auth.currentUser && !cancelled) setCurrentUserId(auth.currentUser.uid);
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    const cleanupSubs: (() => void)[] = []
    load()
    return () => { cancelled = true; cleanupSubs.forEach(f => { try { f(); } catch { /* ignore unsubscribe error */ } }) }
  }, [id, loaderData])

  // Realtime subscribe to share grant specifically for this library (after we know id)
  useEffect(() => {
    if (!id) return; let unsub: (() => void) | null = null; try { unsub = shareRepository.listenCurrentUserShareForLibrary(id, (share: { id: string; role: 'viewer' | 'contributor' } | null) => { setLiveShareRole(share ? share.role : null); }); } catch {/* ignore */ } return () => { if (unsub) unsub(); };
  }, [id]);

  // Load shares when dialog opens
  useEffect(() => {
    if (!shareOpen || !id) return; let cancelled = false; (async () => {
      setLoadingShares(true);
      try { const list = await shareRepository.listShares(id); if (!cancelled) setShares(list); } finally { if (!cancelled) setLoadingShares(false); }
    })();
    return () => { cancelled = true };
  }, [shareOpen, id]);

  // Lookup by email debounce (simple)
  useEffect(() => { if (!inviteEmail) { setEmailLookupResults([]); return; } const t = setTimeout(async () => { setLookupLoading(true); try { const res = await userRepository.findUserByEmail(inviteEmail.trim()); setEmailLookupResults(res); } finally { setLookupLoading(false); } }, 400); return () => clearTimeout(t); }, [inviteEmail]);

  // Hiển thị skeleton khi đang tải
  if (loading) {
    let preferList = false;
    try { if (typeof window !== 'undefined') { preferList = localStorage.getItem('library_view_mode') === 'list'; } } catch {/* ignore */ }
    return <LibraryDetailSkeleton listView={preferList} />
  }

  // Nếu không tìm thấy thư viện, redirect về trang library
  if (!library && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
        <H2 className="text-2xl font-semibold mb-2">Không tìm thấy thư viện</H2>
        <p className="text-muted-foreground mb-4">
          Thư viện với ID "{id}" không tồn tại.
        </p>
        <Link to={ROUTES.MY_LIBRARY}>
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
  const hasPendingRequest = !canStudy && accessRequests.some(r => r.status === 'pending');
  // Prefer realtime summary if available
  const masteredVal = summary ? summary.mastered : progStats.mastered;
  const learningVal = summary ? summary.learning : progStats.learning;
  const masteredPct = total ? Math.round((masteredVal / total) * 100) : 0;
  const learningPct = total ? Math.round((learningVal / total) * 100) : 0;
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
            <Link to={ROUTES.MY_LIBRARY}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <H1 className="text-3xl font-bold">{library?.title}</H1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { if (id) toggleFavorite(id, isFavorite); }}
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
                    onInvite={async (userId, role) => {
                      if (!id) return;
                      setInviteLoading(true);
                      try {
                        await shareRepository.addShare(id, userId, role);
                        const list = await shareRepository.listShares(id);
                        setShares(list);
                        setInviteEmail('');
                        toast.success('Đã chia sẻ');
                      } catch (e) {
                        console.error(e);
                        toast.error('Lỗi chia sẻ');
                      } finally {
                        setInviteLoading(false);
                      }
                    }}
                    removeShare={async (shareId: string) => { try { await shareRepository.removeShare(shareId); if (id) { const list = await shareRepository.listShares(id); setShares(list); } toast.success('Đã hủy chia sẻ'); } catch { toast.error('Lỗi'); } }}
                    updateRole={async (shareId: string, role: 'viewer' | 'contributor') => { try { await shareRepository.updateShareRole(shareId, role); if (id) { const list = await shareRepository.listShares(id); setShares(list); } toast.success('Đã cập nhật'); } catch { toast.error('Lỗi cập nhật'); } }}
                    searching={lookupLoading}
                    searchResults={emailLookupResults}
                    inviteLoading={inviteLoading}
                  />
                </DialogContent>
              </Dialog>
            )}
            <Button variant="ghost" size="icon" disabled={!canStudy} title={!canStudy ? 'Không có quyền tải xuống' : 'Tải'}>
              <Download className="h-4 w-4" />
            </Button>
            {isOwner && (
              <ConfirmDialog
                open={confirmDeleteLibraryOpen}
                onOpenChange={setConfirmDeleteLibraryOpen}
                title="Xác nhận xóa thư viện"
                description={`Xóa thư viện "${library?.title}"? Hành động này không thể hoàn tác và sẽ xóa tất cả thẻ trong thư viện.`}
                onConfirm={async () => {
                  if (!id || !library) return;
                  try {
                    setDeletingLibrary(true);
                    await libraryRepository.deleteLibrary(id);
                    toast.success('Đã xóa thư viện');
                    navigate(ROUTES.MY_LIBRARY);
                  } catch (error) {
                    console.error(error);
                    toast.error('Lỗi khi xóa thư viện');
                  } finally {
                    setDeletingLibrary(false);
                    setConfirmDeleteLibraryOpen(false);
                  }
                }}
                confirmText={deletingLibrary ? 'Đang xóa...' : 'Xóa'}
                cancelText="Hủy"
                loading={deletingLibrary}
                variant="destructive"
              >
                <Button variant="ghost" size="icon" title="Xóa thư viện">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </ConfirmDialog>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Link to={canStudy ? getStudyPath(id!) : '#'} onClick={e => { if (!canStudy) e.preventDefault(); }}>
            <Button size="default" disabled={!canStudy} title={!canStudy ? 'Bạn không có quyền học thư viện riêng tư này' : ''}>
              <BookOpen className="h-4 w-4 mr-2" />
              Bắt đầu học
            </Button>
          </Link>
          <Link to={canStudy ? getTestSetupPath(id!) : '#'} onClick={e => { if (!canStudy) e.preventDefault(); }}>
            <Button variant="outline" size="default" disabled={!canStudy} title={!canStudy ? 'Bạn không có quyền kiểm tra thư viện này' : ''}>
              <Target className="h-4 w-4 mr-2" />
              Kiểm tra
            </Button>
          </Link>
          {/* Add Card Dialog Trigger moved here */}
          <Dialog open={openAddCard} onOpenChange={setOpenAddCard}>
            <DialogTrigger asChild>
              <Button variant="outline" size="default" disabled={!canModify} title={!canModify ? 'Không thể thêm thẻ' : ''}>Thêm thẻ</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm thẻ {bulkMode ? '(Nhiều)' : ''}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <Button type="button" variant="ghost" size="sm" className="h-6 px-2 underline-offset-4 hover:underline" onClick={() => setBulkMode(m => !m)}>
                    {bulkMode ? 'Chế độ 1 thẻ' : 'Chế độ nhiều thẻ'}
                  </Button>
                  {bulkMode && <div>{bulkPreview.length} dòng hợp lệ</div>}
                </div>
                {!bulkMode && (
                  <>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Mặt trước</label>
                      <Input value={front} onChange={(e) => setFront(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Mặt sau</label>
                      <Input value={back} onChange={(e) => setBack(e.target.value)} />
                    </div>
                  </>
                )}
                {bulkMode && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Danh sách thẻ ( mỗi dòng: mặt trước|mặt sau )</label>
                    <Textarea
                      className="h-48 text-sm"
                      value={bulkText}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBulkText(e.target.value)}
                      placeholder={`Ví dụ:\nhello|xin chào\nworld|thế giới`}
                    />
                    {bulkText && bulkPreview.length === 0 && (
                      <div className="text-xs text-red-500">Không có dòng hợp lệ. Định dạng: mặt trước|mặt sau</div>
                    )}
                    {bulkPreview.length > 0 && (
                      <div className="max-h-32 overflow-auto border rounded p-2 text-xs space-y-1 bg-muted/30">
                        {bulkPreview.slice(0, 20).map((p, i) => (
                          <div key={i} className="flex justify-between gap-2"><span className="truncate font-medium" title={p.front}>{p.front}</span><span className="text-muted-foreground">|</span><span className="truncate" title={p.back}>{p.back}</span></div>
                        ))}
                        {bulkPreview.length > 20 && <div className="text-muted-foreground">... {bulkPreview.length - 20} dòng nữa</div>}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenAddCard(false)}>Hủy</Button>
                {!bulkMode && (
                  <Button disabled={!front || !back || adding} onClick={async () => {
                    if (!library) return;
                    try {
                      setAdding(true);
                      const tempId = 'temp-' + Date.now();
                      setCards(prev => [{ id: tempId, front, back } as EngineCard, ...prev]);
                      await libraryRepository.createCard({ libraryId: library.id, front, back });
                      setFront(''); setBack(''); setOpenAddCard(false);
                      toast.success('Đã thêm thẻ');
                    } finally { setAdding(false); }
                  }}>{adding ? 'Đang lưu...' : 'Lưu'}</Button>
                )}
                {bulkMode && (
                  <Button disabled={bulkPreview.length === 0 || adding} onClick={async () => {
                    if (!library) return;
                    try {
                      setAdding(true);
                      const baseTs = Date.now();
                      const temps = bulkPreview.map((p, i) => ({ id: `temp-bulk-${baseTs}-${i}`, front: p.front, back: p.back } as EngineCard));
                      setCards(prev => [...temps, ...prev]);
                      const created = await libraryRepository.createCardsBulk(library.id, bulkPreview);
                      setBulkText(''); setOpenAddCard(false);
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
                <H3 className="font-semibold mb-2">Mô tả</H3>
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
                    Chủ sở hữu: <span className="font-medium">{ownerProfile?.displayName || ownerProfile?.email || ownerProfile?.id?.slice(0, 6) || '—'}</span>
                  </div>
                )}
              </div>
              {library && !canStudy && (
                <div className="pt-2">
                  <Button size="sm" disabled={hasPendingRequest || requestingAccess} onClick={async () => {
                    if (!library) return; try { setRequestingAccess(true); await userRepository.createAccessRequest(library.id, library.ownerId); const reqs = await userRepository.listUserAccessRequests(library.id); setAccessRequests(reqs); } finally { setRequestingAccess(false); }
                  }}
                    variant={hasPendingRequest ? 'outline' : 'default'}>
                    {hasPendingRequest ? 'Đã gửi yêu cầu' : (requestingAccess ? 'Đang gửi...' : 'Yêu cầu truy cập')}
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
                  <H2 className="text-xl font-semibold">Học với Flashcard</H2>
                  <p className="text-muted-foreground">Lật thẻ để ghi nhớ nhanh</p>
                </div>
                <Link to={getStudyPath(id!)}>
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
        <LeaderboardSection libraryId={id!} currentUserId={currentUserId} />
        {canStudy ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedIds.length ? `${selectedIds.length} đã chọn` : `${filteredCards.length} thẻ`}
              </div>
              <div className="flex flex-col w-full md:w-auto gap-2">
                <div className="flex flex-wrap items-center gap-2 w-full">
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <Input placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} className="h-8 w-full md:w-64" />
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')} className="h-8 px-2"><LayoutGrid className="h-4 w-4" /></Button>
                    <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')} className="h-8 px-2"><ListIcon className="h-4 w-4" /></Button>
                  </div>
                  {selectedIds.length > 0 && (
                    <ConfirmDialog
                      open={confirmDeleteOpen}
                      onOpenChange={setConfirmDeleteOpen}
                      title="Xác nhận xóa"
                      description={`Xóa ${selectedIds.length} thẻ đã chọn? Hành động không thể hoàn tác.`}
                      onConfirm={async () => {
                        if (!selectedIds.length) return; if (deleting) return;
                        try {
                          setDeleting(true);
                          const ids = [...selectedIds];
                          setCards(prev => prev.filter(c => !ids.includes(c.id)));
                          setSelectedIds([]);
                          const removed = await cardRepository.deleteCardsBulk(ids);
                          toast.success(`Đã xóa ${removed} thẻ`); setPage(1);
                        } finally { setDeleting(false); setConfirmDeleteOpen(false); }
                      }}
                      confirmText={deleting ? 'Đang xóa...' : 'Xóa'}
                      cancelText="Hủy"
                      loading={deleting}
                      variant="destructive"
                    >
                      <Button variant="destructive" size="sm">Xóa ({selectedIds.length})</Button>
                    </ConfirmDialog>
                  )}
                </div>
              </div>
            </div>
            {/* Cards Display */}
            <UnifiedCards
              cards={paginatedCards}
              rawState={rawState}
              viewMode={viewMode}
              selectedIds={selectedIds}
              onToggleSelect={(cid) => setSelectedIds(s => s.includes(cid) ? s.filter(x => x !== cid) : [...s, cid])}
              onSelectAll={(all) => all ? setSelectedIds(paginatedCards.map(c => c.id)) : setSelectedIds([])}
              onEdit={(c) => { setEditCardId(c.id); setEditFront(c.front); setEditBack(c.back); setEditDomain(c.domain || ''); setEditDifficulty((c.difficulty || '') as '' | 'easy' | 'medium' | 'hard'); }}
              onDeleteSingle={(cid) => { setSelectedIds([cid]); setConfirmDeleteOpen(true); }}
              canModify={canModify}
            />
            <CardPagination
              page={page}
              pageSize={pageSize}
              total={filteredCards.length}
              onPageChange={(p) => setPage(Math.min(Math.max(1, p), totalPages))}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
              className="mt-2"
            />
            {/* Edit Dialog */}
            <Dialog open={!!editCardId} onOpenChange={(o) => { if (!o) { setEditCardId(null); } }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sửa thẻ</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1"><label className="text-xs font-medium">Mặt trước</label><Input value={editFront} onChange={e => setEditFront(e.target.value)} /></div>
                  <div className="space-y-1"><label className="text-xs font-medium">Mặt sau</label><Input value={editBack} onChange={e => setEditBack(e.target.value)} /></div>
                  <div className="space-y-1"><label className="text-xs font-medium">Domain (tùy chọn)</label><Input value={editDomain} onChange={e => setEditDomain(e.target.value)} placeholder="vd: biology" /></div>
                  <div className="space-y-1"><label className="text-xs font-medium">Độ khó (tùy chọn)</label>
                    <Select value={editDifficulty} onValueChange={(v: string) => setEditDifficulty(v as '' | 'easy' | 'medium' | 'hard')}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="(Không đặt)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">(Không đặt)</SelectItem>
                        <SelectItem value="easy">Dễ</SelectItem>
                        <SelectItem value="medium">Trung bình</SelectItem>
                        <SelectItem value="hard">Khó</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditCardId(null)}>Hủy</Button>
                  <Button onClick={async () => {
                    if (!editCardId) return; const cid = editCardId; const prevSnapshot = cards;
                    setCards(prev => prev.map(c => c.id === cid ? { ...c, front: editFront, back: editBack, domain: editDomain || undefined, difficulty: editDifficulty || undefined } : c));
                    try { await cardRepository.updateCard(cid, { front: editFront, back: editBack, domain: editDomain || null, difficulty: editDifficulty || null }); toast.success('Đã cập nhật thẻ'); }
                    catch { setCards(prevSnapshot); toast.error('Lỗi cập nhật'); }
                    finally { setEditCardId(null); }
                  }}>Lưu</Button>
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




