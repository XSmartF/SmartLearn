import { H1, H2 } from '@/shared/components/ui/typography';
import { useParams, Link, useLoaderData } from 'react-router-dom'
import { PageSection } from "@/shared/components/PageSection"
import { StatCard } from "@/shared/components/StatCard"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { VisibilityBadge } from '@/features/library/components/VisibilityDisplay'
import {
  ArrowLeft,
  Share2,
  Download,
  Heart,
  Target,
  BookOpen,
  LayoutGrid,
  List as ListIcon,
  Trash2,
} from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import FlashCard from '@/shared/components/FlashCard'
import type { LibraryMeta } from '@/shared/lib/models'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/shared/components/ui/dialog'
import ConfirmDialog from '@/shared/components/ConfirmDialog'
import { Input } from '@/shared/components/ui/input'
// Table import removed (switched to card/grid layout)
import { CardPagination } from '@/shared/components/ui/pagination'
// Icons for future enhancements can be added here
// ...existing imports...
// Extracted components
import { ProgressSummarySection, ShareManager, UnifiedCards, LeaderboardSection } from '../components'

import { Progress } from "@/shared/components/ui/progress"
import { getTestSetupPath, getStudyPath, ROUTES } from '@/shared/constants/routes'
import { Loader } from '@/shared/components/ui/loader'
import { useLibraryDetail } from '../hooks/useLibraryDetail'
import { toast } from 'sonner'

export default function LibraryDetail() {
  const { id } = useParams();
  const loaderData = useLoaderData() as { library?: LibraryMeta | null } | null;

  const {
  status,
  library,
    openAddCard,
    setOpenAddCard,
    front,
    setFront,
    back,
    setBack,
    adding,
    bulkMode,
    setBulkMode,
    bulkText,
    setBulkText,
    bulkPreview,
    selectedIds,
    setSelectedIds,
    editCardId,
    setEditCardId,
    editFront,
    setEditFront,
    editBack,
    setEditBack,
    confirmDeleteOpen,
    setConfirmDeleteOpen,
    deleting,
    confirmDeleteLibraryOpen,
    setConfirmDeleteLibraryOpen,
    deletingLibrary,
    editDomain,
    setEditDomain,
    editDifficulty,
    setEditDifficulty,
    shareOpen,
    setShareOpen,
    shares,
    loadingShares,
    inviteEmail,
    setInviteEmail,
    inviteRole,
    setInviteRole,
    inviteLoading,
    lookupLoading,
    emailLookupResults,
  ownerProfile,
    requestingAccess,
    currentUserId,
    navigatingToStudy,
    hasOngoingSession,
    canStudy,
    canModify,
    isOwner,
    hasPendingRequest,
    stats,
    totals,
    filteredCards,
    paginatedCards,
    totalPages,
    flashcardItems,
    page,
    setPage,
    pageSize,
    setPageSize,
    viewMode,
    setViewMode,
    search,
    setSearch,
    readLanguage,
    progStats,
    rawState,
    summary,
    isFavorite,
    toggleFavorite,
    startStudy,
    requestAccess,
    addSingleCard,
    addBulkCards,
    deleteSelectedCards,
    deleteLibrary,
    saveEditedCard,
    inviteShare,
    removeShare,
    updateShareRole,
    handleDifficultyChange,
    handleBookmarkToggle,
    handleDeleteSingleCard,
    speakQuestion,
  } = useLibraryDetail({
    libraryId: id ?? null,
    loaderLibrary: loaderData?.library ?? null,
  });

  const total = totals.total;
  const { masteredVal, learningVal, masteredPct, learningPct } = totals;

  // Hiển thị loader khi đang tải
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader size="lg" label="Đang tải thư viện" />
      </div>
    )
  }

  // Nếu không tìm thấy thư viện, redirect về trang library
  if (status === 'not-found' || !library) {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3 sm:gap-4 flex-wrap min-w-0">
            <Link to={ROUTES.MY_LIBRARY}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="min-w-0">
              <H1 className="text-2xl sm:text-3xl font-bold leading-tight break-words">{library?.title}</H1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <VisibilityBadge visibility={library?.visibility || 'public'} />
                {isFavorite && <Heart className="h-4 w-4 fill-red-500 text-red-500" />}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { toggleFavorite(); }}
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
                    onInvite={inviteShare}
                    removeShare={removeShare}
                    updateRole={updateShareRole}
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
                onConfirm={deleteLibrary}
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
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button 
            size="default" 
            disabled={!canStudy || navigatingToStudy} 
            title={!canStudy ? 'Bạn không có quyền học thư viện riêng tư này' : ''}
            onClick={startStudy}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            {navigatingToStudy ? 'Đang chuyển...' : (hasOngoingSession ? 'Tiếp tục học' : 'Bắt đầu học')}
          </Button>
          <Link to={canStudy ? getTestSetupPath(id!) : '#'} onClick={e => { if (!canStudy) e.preventDefault(); }}>
            <Button variant="outline" size="default" disabled={!canStudy} title={!canStudy ? 'Bạn không có quyền kiểm tra thư viện này' : ''}>
              <Target className="h-4 w-4 mr-2" />
              Kiểm tra
            </Button>
          </Link>
          {/* Add Card Button - opens dialog in cards section */}
          <Button 
            variant="outline" 
            size="default" 
            disabled={!canModify} 
            title={!canModify ? 'Không thể thêm thẻ' : ''}
            onClick={() => setOpenAddCard(true)}
          >
            Thêm thẻ
          </Button>
        </div>
      </div>

      {/* Library Info */}
      <PageSection
        heading="Thông tin thư viện"
        description={library?.description || 'Chưa có mô tả cho thư viện này.'}
        actions={
          library && !canStudy ? (
            <Button
              size="sm"
              disabled={hasPendingRequest || requestingAccess}
              onClick={requestAccess}
              variant={hasPendingRequest ? 'outline' : 'default'}
            >
              {hasPendingRequest ? 'Đã gửi yêu cầu' : requestingAccess ? 'Đang gửi...' : 'Yêu cầu truy cập'}
            </Button>
          ) : undefined
        }
        contentClassName="space-y-8"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4 md:max-w-2xl">
            {(library?.tags?.length || 0) > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {(library?.tags || []).map((tag: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <VisibilityBadge visibility={library?.visibility || 'public'} />
              {library && !canStudy && (
                <div className="flex items-center gap-1 text-xs">
                  Chủ sở hữu:
                  <span className="font-medium">
                    {ownerProfile?.displayName || ownerProfile?.email || ownerProfile?.id?.slice(0, 6) || '—'}
                  </span>
                </div>
              )}
              {library?.updatedAt && (
                <span className="text-xs">Cập nhật: {new Date(library.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>

          <div className="grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                icon={<stat.icon className={`h-5 w-5 ${stat.color}`} />}
                label={stat.title}
                value={stat.value}
                helper={
                  index === 0 ? null : (
                    <div className="space-y-1">
                      <Progress value={stat.percentage} className="h-2" />
                      <span>{stat.percentage}%</span>
                    </div>
                  )
                }
              />
            ))}
          </div>
        </div>
      </PageSection>

      {/* FlashCard Learning Section */}
      <PageSection
        id="flashcard-section"
        heading={canStudy ? 'Học với Flashcard' : 'Thư viện riêng tư'}
        description={
          canStudy
            ? 'Lật thẻ để ghi nhớ nhanh hoặc chuyển sang chế độ học khác.'
            : 'Bạn không có quyền xem các thẻ trong thư viện này.'
        }
        actions={
          canStudy ? (
            <Link to={getStudyPath(id!)}>
              <Button variant="outline" size="lg">
                <BookOpen className="mr-2 h-5 w-5" />
                Chế độ học khác
              </Button>
            </Link>
          ) : undefined
        }
        contentClassName={canStudy ? undefined : 'py-8'}
      >
        {canStudy ? (
          flashcardItems.length > 0 ? (
            <FlashCard
              cards={flashcardItems}
              onCardUpdate={handleDifficultyChange}
              onBookmarkToggle={handleBookmarkToggle}
              onComplete={() => {
                toast.success('Hoàn thành học tập!');
              }}
              readLanguage={readLanguage}
            />
          ) : (
            <div className="text-center py-12">
              <Target className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">Chưa có thẻ. Thêm thẻ để bắt đầu học.</p>
            </div>
          )
        ) : (
          <div className="text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Liên hệ chủ sở hữu để yêu cầu quyền truy cập.</p>
          </div>
        )}
      </PageSection>

      {/* Unified Cards + Progress Section */}
      <div className="space-y-8">
        <ProgressSummarySection total={total} masteredVal={masteredVal} learningVal={learningVal} masteredPct={masteredPct} learningPct={learningPct} due={summary ? summary.due : progStats.due} />
        <LeaderboardSection libraryId={id!} currentUserId={currentUserId} />
        {canStudy ? (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground font-medium">
                  {selectedIds.length ? `${selectedIds.length} đã chọn` : `${filteredCards.length} thẻ`}
                </div>
                {canModify && (
                  <Dialog open={openAddCard} onOpenChange={setOpenAddCard}>
                    <DialogTrigger asChild>
                      <Button variant="default" size="sm" className="h-8">
                        <Target className="h-4 w-4 mr-2" />
                        Thêm thẻ
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Thêm thẻ {bulkMode ? '(Nhiều)' : ''}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Button type="button" variant="ghost" size="sm" className="h-8 px-3 underline-offset-4 hover:underline" onClick={() => setBulkMode(!bulkMode)}>
                            {bulkMode ? 'Chế độ 1 thẻ' : 'Chế độ nhiều thẻ'}
                          </Button>
                          {bulkMode && <div className="text-sm text-muted-foreground">{bulkPreview.length} dòng hợp lệ</div>}
                        </div>
                        {!bulkMode && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Mặt trước</label>
                              <Input value={front} onChange={(e) => setFront(e.target.value)} placeholder="Nhập mặt trước..." />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Mặt sau</label>
                              <Input value={back} onChange={(e) => setBack(e.target.value)} placeholder="Nhập mặt sau..." />
                            </div>
                          </div>
                        )}
                        {bulkMode && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Danh sách thẻ (mỗi dòng: mặt trước|mặt sau)</label>
                            <Textarea
                              className="h-48 text-sm resize-none"
                              value={bulkText}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBulkText(e.target.value)}
                              placeholder={`Ví dụ:\nhello|xin chào\nworld|thế giới`}
                            />
                            {bulkText && bulkPreview.length === 0 && (
                              <div className="text-sm text-red-500">Không có dòng hợp lệ. Định dạng: mặt trước|mặt sau</div>
                            )}
                            {bulkPreview.length > 0 && (
                              <div className="max-h-32 overflow-auto border rounded-lg p-3 text-sm space-y-2 bg-muted/30">
                                {bulkPreview.slice(0, 20).map((p, i) => (
                                  <div key={i} className="flex justify-between gap-2">
                                    <span className="truncate font-medium" title={p.front}>{p.front}</span>
                                    <span className="text-muted-foreground">|</span>
                                    <span className="truncate" title={p.back}>{p.back}</span>
                                  </div>
                                ))}
                                {bulkPreview.length > 20 && <div className="text-muted-foreground text-xs">... {bulkPreview.length - 20} dòng nữa</div>}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenAddCard(false)}>Hủy</Button>
                        {!bulkMode && (
                          <Button disabled={!front || !back || adding} onClick={addSingleCard}>
                            {adding ? 'Đang lưu...' : 'Lưu'}
                          </Button>
                        )}
                        {bulkMode && (
                          <Button disabled={bulkPreview.length === 0 || adding} onClick={addBulkCards}>
                            {adding ? 'Đang lưu...' : `Lưu (${bulkPreview.length})`}
                          </Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2 flex-1">
                  <Input placeholder="Tìm kiếm thẻ..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 flex-1" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-md p-1">
                    <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="h-7 px-2">
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="h-7 px-2">
                      <ListIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {selectedIds.length > 0 && (
                    <ConfirmDialog
                      open={confirmDeleteOpen}
                      onOpenChange={setConfirmDeleteOpen}
                      title="Xác nhận xóa"
                      description={`Xóa ${selectedIds.length} thẻ đã chọn? Hành động không thể hoàn tác.`}
                      onConfirm={deleteSelectedCards}
                      confirmText={deleting ? 'Đang xóa...' : 'Xóa'}
                      cancelText="Hủy"
                      loading={deleting}
                      variant="destructive"
                    >
                      <Button variant="destructive" size="sm" className="h-9">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa ({selectedIds.length})
                      </Button>
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
              onDeleteSingle={handleDeleteSingleCard}
              canModify={canModify}
              readLanguage={readLanguage}
              speakQuestion={speakQuestion}
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
                  <Button onClick={saveEditedCard}>Lưu</Button>
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




