import { BookOpen, PenSquare, Star } from 'lucide-react';
import { TabsContent } from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import { PageSection } from '@/shared/components/PageSection';
import { Loader } from '@/shared/components/ui/loader';
import { NotesHeader } from '../components/list/NotesHeader';
import { NotesFilters } from '../components/list/NotesFilters';
import { NotesTabs } from '../components/list/NotesTabs';
import { NotesGrid } from '../components/list/NotesGrid';
import { NotesEmptyState } from '../components/list/NotesEmptyState';
import { NoteEditorDialog } from '../components/dialogs/NoteEditorDialog';
import { NoteDeleteDialog } from '../components/dialogs/NoteDeleteDialog';
import { useNotesListView } from '../hooks/useNotesListView';

export default function NotesPage() {
  const {
    highlightSummary,
    openCreateDialog,
    searchQuery,
    setSearchQuery,
    sortId,
    setSortId,
    sortOptions,
    activeTab,
    setActiveTab,
    tabOptions,
    sortedNotes,
    favoriteNotes,
    tabCounts,
    favoriteIds,
    currentUserId,
    favoritesUpdating,
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
  } = useNotesListView();

  const showAllEmpty = !loading && sortedNotes.length === 0;
  const showFavoritesEmpty = !loading && favoriteNotes.length === 0;
  const errorMessage = error?.message ?? 'Đã xảy ra lỗi';

  return (
    <div className="space-y-8 sm:space-y-12">
      <NotesHeader summary={highlightSummary} onCreateNote={openCreateDialog} />

      <PageSection
        heading="Quản lý ghi chép"
        description="Tìm kiếm, sắp xếp và quản lý tất cả ghi chép của bạn."
      >
        <div className="space-y-6">
          <NotesFilters
            searchQuery={searchQuery}
            sortId={sortId}
            sortOptions={sortOptions}
            onSearchChange={setSearchQuery}
            onSortChange={setSortId}
          />

          <NotesTabs activeTab={activeTab} tabOptions={tabOptions} counts={tabCounts} onTabChange={setActiveTab}>
            <TabsContent value="all" className="space-y-4">
              {showAllEmpty ? (
                <NotesEmptyState
                  icon={<BookOpen className="h-14 w-14 text-muted-foreground" />}
                  title="Chưa có ghi chép nào"
                  description="Tạo ghi chép đầu tiên để bắt đầu xây dựng thư viện kiến thức."
                  action={(
                    <Button onClick={openCreateDialog} variant="outline">
                      <PenSquare className="mr-2 h-4 w-4" />
                      Tạo ghi chép
                    </Button>
                  )}
                />
              ) : (
                <NotesGrid
                  notes={sortedNotes}
                  favoriteIds={favoriteIds}
                  currentUserId={typeof currentUserId === 'string' ? currentUserId : ''}
                  favoritesUpdating={favoritesUpdating}
                  onToggleFavorite={toggleFavoriteStatus}
                  onEdit={openEditDialog}
                  onDelete={promptDelete}
                />
              )}
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              {showFavoritesEmpty ? (
                <NotesEmptyState
                  icon={<Star className="h-12 w-12 text-muted-foreground" />}
                  title="Chưa có ghi chép yêu thích"
                  description="Đánh dấu các ghi chép quan trọng để truy cập nhanh hơn."
                />
              ) : (
                <NotesGrid
                  notes={favoriteNotes}
                  favoriteIds={favoriteIds}
                  currentUserId={typeof currentUserId === 'string' ? currentUserId : ''}
                  favoritesUpdating={favoritesUpdating}
                  onToggleFavorite={toggleFavoriteStatus}
                  onEdit={openEditDialog}
                  onDelete={promptDelete}
                />
              )}
            </TabsContent>
          </NotesTabs>
        </div>
      </PageSection>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader size="sm" />
        </div>
      )}

      {error && (
        <PageSection heading="Đã xảy ra lỗi" description={errorMessage}>
          <Button variant="outline" onClick={() => window.location.reload()} className="w-full sm:w-auto">
            Thử lại
          </Button>
        </PageSection>
      )}

      <NoteEditorDialog
        state={editorState}
        onClose={closeEditor}
        onUpdateDraft={updateEditorDraft}
        onSubmit={submitEditor}
      />

      <NoteDeleteDialog state={deleteState} onCancel={closeDeletePrompt} onConfirm={confirmDelete} />
    </div>
  );
}