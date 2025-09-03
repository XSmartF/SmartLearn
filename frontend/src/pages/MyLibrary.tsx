import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { useUserLibraries } from '@/hooks/useLibraries'
import { listenUserSharedLibraries, fetchLibrariesByIds, getUserProfile } from '@/lib/firebaseLibraryService'
// Potential future: import progress summaries for more accurate totals if engine state grows beyond cardCount
import { useFavoriteLibraries } from '@/hooks/useFavorites'
import { createLibrary, updateLibrary } from '@/lib/firebaseLibraryService'
import { 
  Star, 
  Search, 
  Grid3X3, 
  List, 
  BookOpen, 
  // Clock,
  // TrendingUp,
  Play,
  MoreHorizontal,
  Filter
} from "lucide-react"
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
  const { libraries, loading, error } = useUserLibraries()
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
  useEffect(()=>{
    let unsub: (()=>void)|null = null; let active = true;
    try {
      unsub = listenUserSharedLibraries(async entries => {
        setSharedLoading(true)
        try {
          const ids = entries.map(e=>e.libraryId)
          const libs = ids.length ? await fetchLibrariesByIds(ids) : []
          const roleMap = new Map(entries.map(e=>[e.libraryId, e.role] as const))
          if (active) setShared(libs.map(l=> ({ lib: l, role: roleMap.get(l.id) as ShareRole })))
        } finally { if(active) setSharedLoading(false) }
      })
    } catch {/* ignore */}
    return ()=>{ active = false; if(unsub) unsub(); }
  }, [])

  // Load current user id
  useEffect(()=>{ (async()=>{ try { const authMod = await import('@/lib/firebaseClient'); const auth = authMod.getFirebaseAuth(); if(auth.currentUser) setCurrentUserId(auth.currentUser.uid); } catch{/* ignore */} })(); }, [])

  // (moved fetch owner profiles effect below after allLibraries memo)
  const { favoriteIds, favorites, toggleFavorite, updating: favUpdating } = useFavoriteLibraries();

  // Combine owned + shared for "All" stats & list
  const sharedRoleMap = useMemo(()=>{
    const m = new Map<string, ShareRole>();
    shared.forEach(s=> m.set(s.lib.id, s.role));
    return m;
  }, [shared]);
  const allLibraries = useMemo(()=>{
    const map = new Map<string, LibraryMeta>();
    libraries.forEach(l=>map.set(l.id, l));
    shared.forEach(s=>{ if(!map.has(s.lib.id)) map.set(s.lib.id, s.lib); });
    return Array.from(map.values());
  }, [libraries, shared]);

  // Fetch missing owner profiles (after allLibraries is defined)
  useEffect(()=>{
    const needed = new Set<string>();
    allLibraries.forEach(l=>{ if(!ownerProfiles[l.ownerId]) needed.add(l.ownerId); });
    if(needed.size===0) return; let cancelled=false;
    (async()=>{
  const entries = await Promise.all(Array.from(needed).map(async id=>{ try { const p = await getUserProfile(id); return p || { id }; } catch{ return { id }; } }));
  if(cancelled) return; const map: Record<string, { id: string; displayName?: string; email?: string; avatarUrl?: string }> = {};
      entries.forEach(p=>{ map[p.id]=p; });
      setOwnerProfiles(prev=> ({ ...prev, ...map }));
    })();
    return ()=>{ cancelled=true };
  }, [allLibraries, ownerProfiles]);

  const filteredAll = allLibraries.filter(lib =>
    lib.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lib.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const totalCardsAll = allLibraries.reduce((sum, l) => sum + (l.cardCount || 0), 0)
  const stats = [
    { title: 'Tổng thư viện', value: allLibraries.length, icon: BookOpen, color: 'text-blue-600' },
    { title: 'Tổng thẻ', value: totalCardsAll, icon: Star, color: 'text-purple-600' }
  ]

  const FlashcardCard = ({ flashcard }: { flashcard: LibraryMeta }) => {
    const isFav = favoriteIds.includes(flashcard.id);
    const role = sharedRoleMap.get(flashcard.id);
    const owner = ownerProfiles[flashcard.ownerId];
  const authorLabel = flashcard.ownerId === currentUserId ? 'Bạn' : (owner?.displayName || owner?.email || owner?.id?.slice(0,6) || '—');
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
                  <Badge variant="outline" className="text-[10px] px-1">Chia sẻ • {role==='viewer' ? 'Viewer' : 'Contributor'}</Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] px-1">Sở hữu</Badge>
                )}
                <div className="flex items-center gap-1">
                  {owner?.avatarUrl ? (
                    <img src={owner.avatarUrl} alt={authorLabel} className="w-4 h-4 rounded-full object-cover" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-muted text-[8px] flex items-center justify-center uppercase">
                      {authorLabel.slice(0,1)}
                    </div>
                  )}
                  <span className="text-[10px] text-muted-foreground">{authorLabel}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{flashcard.description?.slice(0,60)}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e)=>{ e.preventDefault(); toggleFavorite(flashcard.id, isFav); }}>
                  {isFav ? 'Bỏ yêu thích' : 'Yêu thích'}
                </DropdownMenuItem>
                {flashcard.ownerId === currentUserId && (
                  <>
                    <DropdownMenuItem onClick={(e)=>{ e.preventDefault(); setEditLib(flashcard); setEditTitle(flashcard.title); setEditDescription(flashcard.description || ''); setEditVisibility(flashcard.visibility); setEditOpen(true); }}>Chỉnh sửa</DropdownMenuItem>
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
            {(flashcard.tags || []).slice(0,3).map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
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
            <Button size="sm" className="h-8" onClick={(e)=>{ e.preventDefault(); toggleFavorite(flashcard.id, isFav); }} disabled={favUpdating}>
              <Play className="h-3 w-3 mr-1" />
              {isFav ? 'Bỏ' : 'Yêu'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )}

  const FlashcardListItem = ({ flashcard }: { flashcard: LibraryMeta }) => {
    const isFav = favoriteIds.includes(flashcard.id);
    const role = sharedRoleMap.get(flashcard.id);
  const owner = ownerProfiles[flashcard.ownerId];
  const authorLabel = flashcard.ownerId === currentUserId ? 'Bạn' : (owner?.displayName || owner?.email || owner?.id?.slice(0,6) || '—');
    return (
    <Link to={`/dashboard/library/${flashcard.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex-1">
                <h3 className="font-semibold group-hover:text-blue-600 transition-colors">
                  {flashcard.title}
                </h3>
                <p className="text-sm text-muted-foreground truncate max-w-md">
                  {flashcard.cardCount} thẻ • {flashcard.visibility}
                </p>
                <div className="mt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {role ? (
                      <Badge variant="outline" className="text-[10px] px-1">Chia sẻ • {role==='viewer' ? 'Viewer' : 'Contributor'}</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] px-1">Sở hữu</Badge>
                    )}
                    <div className="flex items-center gap-1">
                      {owner?.avatarUrl ? (
                        <img src={owner.avatarUrl} alt={authorLabel} className="w-4 h-4 rounded-full object-cover" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-muted text-[8px] flex items-center justify-center uppercase">
                          {authorLabel.slice(0,1)}
                        </div>
                      )}
                      <span className="text-[10px] text-muted-foreground">{authorLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Badge variant="secondary">{flashcard.tags?.[0] || 'Thẻ'}</Badge>
                
                <Button size="sm" onClick={(e)=>{ e.preventDefault(); toggleFavorite(flashcard.id, isFav); }} disabled={favUpdating}>
                  <Play className="h-3 w-3 mr-1" />
                  {isFav ? 'Bỏ yêu thích' : 'Yêu thích'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Thư viện của tôi</h1>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm thư viện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button>Tạo thư viện</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thư viện mới</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tiêu đề</label>
                  <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="VD: Từ vựng TOEIC" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mô tả</label>
                  <Input value={description} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setDescription(e.target.value)} placeholder="Mô tả ngắn" />
                </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Chế độ hiển thị</label>
                    <select value={newVisibility} onChange={e=>setNewVisibility(e.target.value as LibraryVisibility)} className="w-full border rounded-md h-9 px-2 text-sm bg-background">
                      <option value="private">Riêng tư</option>
                      <option value="public">Công khai</option>
                    </select>
                    <p className="text-[11px] text-muted-foreground">Công khai: mọi người đều xem & học. Riêng tư: chỉ bạn và người được chia sẻ.</p>
                  </div>
              </div>
              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={()=>setOpenCreate(false)}>Hủy</Button>
                <Button disabled={!title || submitting} onClick={async ()=>{
                  try {
                    setSubmitting(true);
                      await createLibrary({ title, description, visibility: newVisibility });
                      setTitle(''); setDescription(''); setNewVisibility('private'); setOpenCreate(false);
                  } catch(e) { console.error(e); }
                  finally { setSubmitting(false); }
                }}>{submitting ? 'Đang lưu...' : 'Tạo'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center space-x-2">
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
              <h3 className="text-lg font-semibold mb-2">Chưa có thư viện yêu thích</h3>
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
          {!sharedLoading && shared.length===0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">Chưa có thư viện được chia sẻ.</div>
          )}
          {!sharedLoading && shared.length>0 && (viewMode==='grid'? (
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
          </DialogHeader>
          {editLib && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tiêu đề</label>
                <Input value={editTitle} onChange={e=>setEditTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mô tả</label>
                <Input value={editDescription} onChange={e=>setEditDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Chế độ hiển thị</label>
                <select value={editVisibility} onChange={e=>setEditVisibility(e.target.value as LibraryVisibility)} className="w-full border rounded-md h-9 px-2 text-sm bg-background">
                  <option value="private">Riêng tư</option>
                  <option value="public">Công khai</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={()=>{ setEditOpen(false); setEditLib(null); }}>Hủy</Button>
            <Button disabled={!editLib || !editTitle || editing} onClick={async ()=>{
              if(!editLib) return; try {
                setEditing(true);
                await updateLibrary(editLib.id, { title: editTitle, description: editDescription, visibility: editVisibility });
                setEditOpen(false); setEditLib(null);
              } catch(e){ console.error(e); }
              finally { setEditing(false); }
            }}>{editing ? 'Đang lưu...' : 'Lưu'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

  {filteredAll.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Không tìm thấy kết quả</h3>
          <p className="text-muted-foreground">
            Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc
          </p>
        </div>
      )}
  {loading && <div className="text-sm text-muted-foreground">Đang tải...</div>}
  {error && <div className="text-sm text-red-600">Lỗi: {error}</div>}
    </div>
  )
}
