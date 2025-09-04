import React, { useState, useEffect, useMemo, useDeferredValue } from 'react'
import { H1, H3 } from '@/components/ui/typography';
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { useUserLibraries } from '@/hooks/useLibraries'
import { shareRepository } from '@/lib/repositories/ShareRepository'
import { libraryRepository } from '@/lib/repositories/LibraryRepository'
import { userRepository } from '@/lib/repositories/UserRepository'
// Potential future: import progress summaries for more accurate totals if engine state grows beyond cardCount
import { useFavoriteLibraries } from '@/hooks/useFavorites'
// Direct repository usage replaces facade functions (createLibrary, updateLibrary)
import {
  Star,
  Search,
  Grid3X3,
  List,
  BookOpen,
  // Clock,
  // TrendingUp,
  MoreHorizontal,
  Filter
} from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { LibraryMeta, ShareRole, LibraryVisibility } from '@/lib/models'

export default function MyLibrary() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [newVisibility, setNewVisibility] = useState<LibraryVisibility>('private')
  const [submitting, setSubmitting] = useState(false)
  const { libraries, loading, error } = useUserLibraries();
  const [shared, setShared] = useState<{ lib: LibraryMeta; role: ShareRole }[]>([])
  const [sharedLoading, setSharedLoading] = useState(false)
  const [ownerProfiles, setOwnerProfiles] = useState<Record<string, { id: string; displayName?: string; email?: string; avatarUrl?: string }>>({})
  const [currentUserId, setCurrentUserId] = useState<string>('')
  // Edit state
  const [editOpen, setEditOpen] = useState(false)
  const [editLib, setEditLib] = useState<LibraryMeta | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editVisibility, setEditVisibility] = useState<LibraryVisibility>('private')
  const [editing, setEditing] = useState(false)
  // Listen to libraries shared with current user (fixed: useEffect instead of useState)
  useEffect(() => {
    let unsub: (() => void) | null = null; let active = true;
    try {
      unsub = shareRepository.listenUserSharedLibraries(async entries => {
        setSharedLoading(true)
        try {
          const ids = entries.map(e => e.libraryId)
          const libs = ids.length ? await libraryRepository.fetchLibrariesByIds(ids) : []
          const roleMap = new Map(entries.map(e => [e.libraryId, e.role] as const))
          if (active) setShared(libs.map(l => ({ lib: l, role: roleMap.get(l.id) as ShareRole })))
        } finally { if (active) setSharedLoading(false) }
      })
    } catch {/* ignore */ }
    return () => { active = false; if (unsub) unsub(); }
  }, [])

  // Load current user id
  useEffect(() => { (async () => { try { const authMod = await import('@/lib/firebaseClient'); const auth = authMod.getFirebaseAuth(); if (auth.currentUser) setCurrentUserId(auth.currentUser.uid); } catch {/* ignore */ } })(); }, [])

  // (moved fetch owner profiles effect below after allLibraries memo)
  // Restore favorite toggle for dropdown item (keep inline buttons removed)
  const { favoriteIds, favorites, toggleFavorite, updating: favUpdating } = useFavoriteLibraries();

  // Combine owned + shared for "All" stats & list
  const sharedRoleMap = useMemo(() => {
    const m = new Map<string, ShareRole>();
    shared.forEach(s => m.set(s.lib.id, s.role));
    return m;
  }, [shared]);
  const allLibraries = useMemo(() => {
    const map = new Map<string, LibraryMeta>();
    libraries.forEach(l => map.set(l.id, l));
    shared.forEach(s => { if (!map.has(s.lib.id)) map.set(s.lib.id, s.lib); });
    return Array.from(map.values());
  }, [libraries, shared]);

  // Fetch missing owner profiles (after allLibraries is defined)
  useEffect(() => {
    const needed = new Set<string>();
    allLibraries.forEach(l => { if (!ownerProfiles[l.ownerId]) needed.add(l.ownerId); });
    if (needed.size === 0) return; let cancelled = false;
    (async () => {
      const entries = await Promise.all(Array.from(needed).map(async id => { try { const p = await userRepository.getUserProfile(id); return p || { id }; } catch { return { id }; } }));
      if (cancelled) return; const map: Record<string, { id: string; displayName?: string; email?: string; avatarUrl?: string }> = {};
      entries.forEach(p => { map[p.id] = p; });
      setOwnerProfiles(prev => ({ ...prev, ...map }));
    })();
    return () => { cancelled = true };
  }, [allLibraries, ownerProfiles]);

  const deferredSearch = useDeferredValue(searchQuery);
  const filteredAll = useMemo(() => allLibraries.filter(lib =>
    lib.title.toLowerCase().includes(deferredSearch.toLowerCase()) ||
    (lib.description?.toLowerCase().includes(deferredSearch.toLowerCase()))
  ), [allLibraries, deferredSearch]);

  const totalCardsAll = allLibraries.reduce((sum, l) => sum + (l.cardCount || 0), 0)
  const stats = [
    { title: 'Tổng thư viện', value: allLibraries.length, icon: BookOpen, color: 'text-blue-600' },
    { title: 'Tổng thẻ', value: totalCardsAll, icon: Star, color: 'text-purple-600' }
  ]

  const FlashcardCard: React.FC<{ flashcard: LibraryMeta }> = useMemo(() => ({ flashcard }) => {
    const isFav = favoriteIds.includes(flashcard.id);
    const role = sharedRoleMap.get(flashcard.id);
    const owner = ownerProfiles[flashcard.ownerId];
    const authorLabel = flashcard.ownerId === currentUserId ? 'Bạn' : (owner?.displayName || owner?.email || owner?.id?.slice(0, 6) || '—');
    return (
      <Link to={`/dashboard/library/${flashcard.id}`}>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                  {flashcard.title}
                </CardTitle>
                <div className="flex gap-2 items-center">
                  {role ? (
                    <Badge variant="outline" className="text-[10px] px-1">Chia sẻ • {role === 'viewer' ? 'Viewer' : 'Contributor'}</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] px-1">Sở hữu</Badge>
                  )}
                  <div className="flex items-center gap-1">
                    {owner?.avatarUrl ? (
                      <Avatar src={owner.avatarUrl} alt={authorLabel} size={16} className="w-4 h-4" fallback={authorLabel.slice(0,1)} />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-muted text-[8px] flex items-center justify-center uppercase">
                        {authorLabel.slice(0, 1)}
                      </div>
                    )}
                    <span className="text-[10px] text-muted-foreground">{authorLabel}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{flashcard.description?.slice(0, 60)}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled={favUpdating} onClick={(e) => { e.preventDefault(); toggleFavorite(flashcard.id, isFav); }}>
                    {isFav ? 'Bỏ yêu thích' : 'Yêu thích'}
                  </DropdownMenuItem>
                  {flashcard.ownerId === currentUserId && (
                    <>
                      <DropdownMenuItem onClick={(e) => { e.preventDefault(); setEditLib(flashcard); setEditTitle(flashcard.title); setEditDescription(flashcard.description || ''); setEditVisibility(flashcard.visibility); setEditOpen(true); }}>Chỉnh sửa</DropdownMenuItem>
                      {flashcard.visibility !== 'public' && (
                        <DropdownMenuItem>Chia sẻ</DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-red-600">Xóa</DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              {(flashcard.tags || []).slice(0, 3).map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{flashcard.cardCount} thẻ</span>
                <span>{flashcard.visibility}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-1">
                {(flashcard.tags || []).slice(0, 2).map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {(flashcard.tags && flashcard.tags.length > 2) && (
                  <Badge variant="outline" className="text-xs">
                    +{(flashcard.tags?.length || 0) - 2}
                  </Badge>
                )}
              </div>
              {/* Favorite button removed */}
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }, [favoriteIds, sharedRoleMap, ownerProfiles, currentUserId, favUpdating, toggleFavorite]);

  const FlashcardListItem: React.FC<{ flashcard: LibraryMeta }> = useMemo(() => ({ flashcard }) => {
    const role = sharedRoleMap.get(flashcard.id);
    const owner = ownerProfiles[flashcard.ownerId];
    const authorLabel = flashcard.ownerId === currentUserId ? 'Bạn' : (owner?.displayName || owner?.email || owner?.id?.slice(0, 6) || '—');
    return (
      <Link to={`/dashboard/library/${flashcard.id}`}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex-1">
                  <H3 className="font-semibold group-hover:text-blue-600 transition-colors">
                    {flashcard.title}
                  </H3>
                  <p className="text-sm text-muted-foreground truncate max-w-md">
                    {flashcard.cardCount} thẻ • {flashcard.visibility}
                  </p>
                  <div className="mt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {role ? (
                        <Badge variant="outline" className="text-[10px] px-1">Chia sẻ • {role === 'viewer' ? 'Viewer' : 'Contributor'}</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] px-1">Sở hữu</Badge>
                      )}
                      <div className="flex items-center gap-1">
                        {owner?.avatarUrl ? (
                          <Avatar src={owner.avatarUrl} alt={authorLabel} size={16} className="w-4 h-4" fallback={authorLabel.slice(0,1)} />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-muted text-[8px] flex items-center justify-center uppercase">
                            {authorLabel.slice(0, 1)}
                          </div>
                        )}
                        <span className="text-[10px] text-muted-foreground">{authorLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant="secondary">{flashcard.tags?.[0] || 'Thẻ'}</Badge>

                  {/* Favorite button removed in list view */}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }, [sharedRoleMap, ownerProfiles, currentUserId]);

  // Derive error message safely
  const hasError = !!error;
  const errorMessage = hasError ? (
    typeof error === 'string'
      ? error
      : (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message?: unknown }).message === 'string')
        ? (error as { message: string }).message
        : 'Đã xảy ra lỗi'
  ) : '';

  return (
    <div className="space-y-6">
      <div>
  <H1 className="text-3xl font-bold">Thư viện của tôi</H1>
        <p className="text-muted-foreground">
          Quản lý và theo dõi tiến độ học flashcard của bạn
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 min-w-[180px] w-full sm:w-auto sm:flex-none">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm thư viện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full sm:w-64"
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0">
            <Filter className="h-4 w-4" />
          </Button>
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button className="shrink-0">Tạo thư viện</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thư viện mới</DialogTitle>
                <DialogDescription>Nhập thông tin để tạo thư viện flashcard mới.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tiêu đề</label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="VD: Từ vựng TOEIC" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mô tả</label>
                  <Textarea
                    value={description}
                    onChange={(e)=>setDescription(e.target.value)}
                    placeholder="Mô tả ngắn (tối đa 300 ký tự)"
                    maxLength={300}
                    className="min-h-[90px]"
                  />
                  <div className="text-[10px] text-muted-foreground text-right">{description.length}/300</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Chế độ hiển thị</label>
                  <Select value={newVisibility} onValueChange={(v: string)=> setNewVisibility(v as LibraryVisibility)}>
                    <SelectTrigger className="w-full h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Riêng tư</SelectItem>
                      <SelectItem value="public">Công khai</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">Công khai: mọi người đều xem & học. Riêng tư: chỉ bạn và người được chia sẻ.</p>
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => setOpenCreate(false)}>Hủy</Button>
                <Button disabled={!title || submitting} onClick={async () => {
                  try {
                    setSubmitting(true);
                    await libraryRepository.createLibrary({ title, description, visibility: newVisibility });
                    setTitle(''); setDescription(''); setNewVisibility('private'); setOpenCreate(false);
                  } catch (e) { console.error(e); }
                  finally { setSubmitting(false); }
                }}>{submitting ? 'Đang lưu...' : 'Tạo'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tất cả ({filteredAll.length})</TabsTrigger>
          <TabsTrigger value="favorites">Yêu thích ({favorites.length})</TabsTrigger>
          <TabsTrigger value="shared">Được chia sẻ ({shared.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAll.map(flashcard => (
                <FlashcardCard key={flashcard.id} flashcard={flashcard} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAll.map(flashcard => (
                <FlashcardListItem key={flashcard.id} flashcard={flashcard} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          {favorites.length === 0 ? (
            <div className="text-center py-8">
              <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <H3 className="text-lg font-semibold mb-2">Chưa có thư viện yêu thích</H3>
              <p className="text-muted-foreground">
                Đánh dấu các thư viện bạn thích để dễ dàng truy cập
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {favorites.map(f => <FlashcardCard key={f.id} flashcard={f} />)}
            </div>
          ) : (
            <div className="space-y-2">
              {favorites.map(f => <FlashcardListItem key={f.id} flashcard={f} />)}
            </div>
          )}
        </TabsContent>
        <TabsContent value="shared" className="space-y-4">
          {sharedLoading && <div className="text-sm text-muted-foreground">Đang tải...</div>}
          {!sharedLoading && shared.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">Chưa có thư viện được chia sẻ.</div>
          )}
          {!sharedLoading && shared.length > 0 && (viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {shared.map(s => <FlashcardCard key={s.lib.id} flashcard={s.lib} />)}
            </div>
          ) : (
            <div className="space-y-2">
              {shared.map(s => <FlashcardListItem key={s.lib.id} flashcard={s.lib} />)}
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Edit Library Dialog */}
      <Dialog open={editOpen} onOpenChange={(o)=>{ if(!o){ setEditOpen(false); setEditLib(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thư viện</DialogTitle>
            <DialogDescription>Chỉnh sửa tiêu đề, mô tả hoặc chế độ hiển thị của thư viện.</DialogDescription>
          </DialogHeader>
          {editLib && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tiêu đề</label>
                <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mô tả</label>
                <Textarea
                  value={editDescription}
                  onChange={(e)=>setEditDescription(e.target.value)}
                  maxLength={300}
                  placeholder="Mô tả ngắn"
                  className="min-h-[90px]"
                />
                <div className="text-[10px] text-muted-foreground text-right">{editDescription.length}/300</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Chế độ hiển thị</label>
                <Select value={editVisibility} onValueChange={(v: string)=> setEditVisibility(v as LibraryVisibility)}>
                  <SelectTrigger className="w-full h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Riêng tư</SelectItem>
                    <SelectItem value="public">Công khai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => { setEditOpen(false); setEditLib(null); }}>Hủy</Button>
            <Button disabled={!editLib || !editTitle || editing} onClick={async () => {
              if (!editLib) return; try {
                setEditing(true);
                await libraryRepository.updateLibrary(editLib.id, { title: editTitle, description: editDescription, visibility: editVisibility });
                setEditOpen(false); setEditLib(null);
              } catch (e) { console.error(e); }
              finally { setEditing(false); }
            }}>{editing ? 'Đang lưu...' : 'Lưu'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {filteredAll.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <H3 className="text-lg font-semibold mb-2">Không tìm thấy kết quả</H3>
          <p className="text-muted-foreground">
            Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc
          </p>
        </div>
      )}
      {loading && <div className="text-sm text-muted-foreground">Đang tải...</div>}
      {hasError && (
        <div className="text-sm text-red-600">
          Lỗi: {errorMessage}
        </div>
      )}
    </div>
  )
}
