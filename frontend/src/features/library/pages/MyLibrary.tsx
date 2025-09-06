import { useState, useEffect, useMemo, useDeferredValue } from 'react'
import { H1, H3 } from '@/shared/components/ui/typography';
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/shared/components/ui/dialog'
import { useUserLibraries } from '@/shared/hooks/useLibraries'
import { shareRepository } from '@/shared/lib/repositories/ShareRepository'
import { libraryRepository } from '@/shared/lib/repositories/LibraryRepository'
import { userRepository } from '@/shared/lib/repositories/UserRepository'
// Potential future: import progress summaries for more accurate totals if engine state grows beyond cardCount
import { useFavoriteLibraries } from '@/shared/hooks/useFavorites'
// Direct repository usage replaces facade functions (createLibrary, updateLibrary)
import {
  Star,
  Search,
} from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import type { LibraryMeta, ShareRole, LibraryVisibility } from '@/shared/lib/models'
// Extracted components
import { FlashcardCard, FlashcardListItem } from '../components'
import LibraryFilters from '../components/LibraryFilters'
import LibraryOverviewStats from '../components/LibraryOverviewStats'
import CreateLibraryDialog from '../components/CreateLibraryDialog'

export default function MyLibrary() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
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
  useEffect(() => { (async () => { try { const authMod = await import('@/shared/lib/firebaseClient'); const auth = authMod.getFirebaseAuth(); if (auth.currentUser) setCurrentUserId(auth.currentUser.uid); } catch {/* ignore */ } })(); }, [])

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
      <LibraryOverviewStats
        ownedCount={libraries.length}
        sharedCount={shared.length}
        favoriteCount={favorites.length}
      />

      {/* Controls */}
      <div className="flex items-center justify-between">
        <LibraryFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalLibraries={allLibraries.length}
          filteredCount={filteredAll.length}
        />
        <CreateLibraryDialog
          onCreateLibrary={async (title, description, visibility) => {
            try {
              await libraryRepository.createLibrary({ title, description, visibility });
            } catch (error) {
              console.error(error);
            }
          }}
        />
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
              {filteredAll.map(flashcard => {
                const isFav = favoriteIds.includes(flashcard.id);
                const role = sharedRoleMap.get(flashcard.id);
                const owner = ownerProfiles[flashcard.ownerId];
                const authorLabel = flashcard.ownerId === currentUserId ? 'Bạn' : (owner?.displayName || owner?.email || owner?.id?.slice(0, 6) || '—');
                return (
                  <FlashcardCard
                    key={flashcard.id}
                    flashcard={flashcard}
                    isFav={isFav}
                    role={role}
                    owner={owner}
                    authorLabel={authorLabel}
                    onToggleFavorite={toggleFavorite}
                    onEdit={setEditLib}
                    currentUserId={currentUserId}
                    favUpdating={favUpdating}
                  />
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAll.map(flashcard => {
                const role = sharedRoleMap.get(flashcard.id);
                const owner = ownerProfiles[flashcard.ownerId];
                const authorLabel = flashcard.ownerId === currentUserId ? 'Bạn' : (owner?.displayName || owner?.email || owner?.id?.slice(0, 6) || '—');
                return (
                  <FlashcardListItem
                    key={flashcard.id}
                    flashcard={flashcard}
                    role={role}
                    owner={owner}
                    authorLabel={authorLabel}
                  />
                );
              })}
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
              {favorites.map(f => {
                const isFav = favoriteIds.includes(f.id);
                const role = sharedRoleMap.get(f.id);
                const owner = ownerProfiles[f.ownerId];
                const authorLabel = f.ownerId === currentUserId ? 'Bạn' : (owner?.displayName || owner?.email || owner?.id?.slice(0, 6) || '—');
                return (
                  <FlashcardCard
                    key={f.id}
                    flashcard={f}
                    isFav={isFav}
                    role={role}
                    owner={owner}
                    authorLabel={authorLabel}
                    onToggleFavorite={toggleFavorite}
                    onEdit={setEditLib}
                    currentUserId={currentUserId}
                    favUpdating={favUpdating}
                  />
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {favorites.map(f => {
                const role = sharedRoleMap.get(f.id);
                const owner = ownerProfiles[f.ownerId];
                const authorLabel = f.ownerId === currentUserId ? 'Bạn' : (owner?.displayName || owner?.email || owner?.id?.slice(0, 6) || '—');
                return (
                  <FlashcardListItem
                    key={f.id}
                    flashcard={f}
                    role={role}
                    owner={owner}
                    authorLabel={authorLabel}
                  />
                );
              })}
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
              {shared.map(s => {
                const isFav = favoriteIds.includes(s.lib.id);
                const role = s.role;
                const owner = ownerProfiles[s.lib.ownerId];
                const authorLabel = s.lib.ownerId === currentUserId ? 'Bạn' : (owner?.displayName || owner?.email || owner?.id?.slice(0, 6) || '—');
                return (
                  <FlashcardCard
                    key={s.lib.id}
                    flashcard={s.lib}
                    isFav={isFav}
                    role={role}
                    owner={owner}
                    authorLabel={authorLabel}
                    onToggleFavorite={toggleFavorite}
                    onEdit={setEditLib}
                    currentUserId={currentUserId}
                    favUpdating={favUpdating}
                  />
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {shared.map(s => {
                const role = s.role;
                const owner = ownerProfiles[s.lib.ownerId];
                const authorLabel = s.lib.ownerId === currentUserId ? 'Bạn' : (owner?.displayName || owner?.email || owner?.id?.slice(0, 6) || '—');
                return (
                  <FlashcardListItem
                    key={s.lib.id}
                    flashcard={s.lib}
                    role={role}
                    owner={owner}
                    authorLabel={authorLabel}
                  />
                );
              })}
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
