import { BookOpen, Search, Star } from 'lucide-react';
import { TabsContent } from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import { Loader } from '@/shared/components/ui/loader';
import { PageSection } from '@/shared/components/PageSection';
import {
  LibraryHeader,
  LibraryFilterBar,
  LibraryTabs,
  LibraryGrid,
  LibraryList,
  LibraryEmptyState,
} from '../components/list';
import { LibraryEditorDialog, LibraryDeleteDialog } from '../components/dialogs';
import { useLibraryListView } from '../hooks/useLibraryListView';

export default function MyLibrary() {
  const {
    summaryText,
    openCreateDialog,
    searchQuery,
    setSearchQuery,
    sortId,
    setSortId,
    sortOptions,
    activeTab,
    setActiveTab,
    tabOptions,
    tabCounts,
    viewMode,
    switchViewMode,
    visibleItems,
    favoriteItems,
    sharedItems,
    allLibrariesCount,
    currentUserId,
    favoriteUpdating,
    toggleFavoriteStatus,
    openEditDialog,
    promptDelete,
    editorState,
    closeEditor,
    updateEditorDraft,
    submitEditor,
    deleteState,
    closeDeletePrompt,
    confirmDelete,
    loading,
    error,
  } = useLibraryListView();

  const visibleCount = visibleItems.length;
  const showAllEmpty = !loading && tabCounts.all === 0;
  const showFavoritesEmpty = !loading && tabCounts.favorites === 0;
  const showSharedEmpty = !loading && tabCounts.shared === 0;
  const errorMessage = error && typeof error === 'object' && 'message' in (error as Record<string, unknown>)
    ? String((error as { message?: unknown }).message ?? 'Đã xảy ra lỗi')
    : typeof error === 'string'
      ? error
      : null;

  return (
    <div className="space-y-8 sm:space-y-12">
      <LibraryHeader summaryText={summaryText} onCreate={openCreateDialog} />

      <PageSection
        heading="Quản lý thư viện"
        description="Tìm kiếm, sắp xếp và quản lý tất cả thư viện flashcard của bạn."
      >
        <LibraryFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortId={sortId}
          sortOptions={sortOptions}
          onSortChange={setSortId}
          viewMode={viewMode}
          onViewModeChange={switchViewMode}
          totalCount={allLibrariesCount}
          filteredCount={visibleCount}
        />

        <LibraryTabs activeTab={activeTab} tabOptions={tabOptions} counts={tabCounts} onTabChange={setActiveTab}>
          <TabsContent value="all" className="space-y-4">
            {showAllEmpty ? (
              <LibraryEmptyState
                icon={<BookOpen className="h-14 w-14" />}
                title="Chưa có thư viện"
                description="Tạo thư viện đầu tiên để bắt đầu xây dựng kho kiến thức của bạn."
              />
            ) : viewMode === 'grid' ? (
              <LibraryGrid
                items={visibleItems}
                currentUserId={currentUserId}
                favoritesUpdating={favoriteUpdating}
                onToggleFavorite={toggleFavoriteStatus}
                onEdit={openEditDialog}
                onDelete={promptDelete}
              />
            ) : (
              <LibraryList items={visibleItems} currentUserId={currentUserId} />
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            {showFavoritesEmpty ? (
              <LibraryEmptyState
                icon={<Star className="h-12 w-12" />}
                title="Chưa có thư viện yêu thích"
                description="Đánh dấu các thư viện quan trọng để truy cập nhanh hơn."
              />
            ) : viewMode === 'grid' ? (
              <LibraryGrid
                items={favoriteItems}
                currentUserId={currentUserId}
                favoritesUpdating={favoriteUpdating}
                onToggleFavorite={toggleFavoriteStatus}
                onEdit={openEditDialog}
                onDelete={promptDelete}
              />
            ) : (
              <LibraryList items={favoriteItems} currentUserId={currentUserId} />
            )}
          </TabsContent>

          <TabsContent value="shared" className="space-y-4">
            {showSharedEmpty ? (
              <LibraryEmptyState
                icon={<BookOpen className="h-12 w-12" />}
                title="Chưa có thư viện được chia sẻ"
                description="Khi được mời cộng tác, thư viện sẽ xuất hiện tại đây."
              />
            ) : viewMode === 'grid' ? (
              <LibraryGrid
                items={sharedItems}
                currentUserId={currentUserId}
                favoritesUpdating={favoriteUpdating}
                onToggleFavorite={toggleFavoriteStatus}
                onEdit={openEditDialog}
                onDelete={promptDelete}
              />
            ) : (
              <LibraryList items={sharedItems} currentUserId={currentUserId} />
            )}
          </TabsContent>
        </LibraryTabs>
      </PageSection>

      {searchQuery && !visibleItems.length && (
        <LibraryEmptyState
          icon={<Search className="h-10 w-10" />}
          title="Không tìm thấy kết quả"
          description="Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc hiện tại."
        />
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <Loader size="sm" />
        </div>
      )}

      {errorMessage && (
        <PageSection heading="Đã xảy ra lỗi" description={errorMessage}>
          <Button variant="outline" onClick={() => window.location.reload()} className="w-full sm:w-auto">
            Thử lại
          </Button>
        </PageSection>
      )}

      <LibraryEditorDialog
        state={editorState}
        onClose={closeEditor}
        onUpdateDraft={updateEditorDraft}
        onSubmit={submitEditor}
      />

      <LibraryDeleteDialog state={deleteState} onCancel={closeDeletePrompt} onConfirm={confirmDelete} />
    </div>
  );
}
