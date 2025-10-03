import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { NOTE_SORT_OPTIONS, NOTE_TAB_OPTIONS } from '../constants';
import type {
  NoteID,
  NoteMeta,
  NoteSortId,
  NoteTabId,
  NoteVisibility,
} from '../types';
import { useUserNotes, useNoteFavorites } from '@/shared/hooks/useNotes';
import { noteRepository } from '@/shared/lib/repositories/NoteRepository';
import { useAuth } from '@/shared/hooks/useAuthRedux';

export interface NoteEditorDraft {
  id: NoteID | null;
  title: string;
  content: string;
  tags: string;
  visibility: NoteVisibility;
}

export interface NoteEditorState {
  open: boolean;
  submitting: boolean;
  mode: 'create' | 'edit';
  draft: NoteEditorDraft | null;
}

export interface NoteDeleteState {
  open: boolean;
  submitting: boolean;
  note: NoteMeta | null;
}

export interface UseNotesListViewOptions {
  defaultSortId?: NoteSortId;
  defaultTabId?: NoteTabId;
}

export const createEmptyDraft = (): NoteEditorDraft => ({
  id: null,
  title: 'Ghi chép mới',
  content: '',
  tags: '',
  visibility: 'private',
});

export function useNotesListView({
  defaultSortId = 'newest',
  defaultTabId = 'all',
}: UseNotesListViewOptions = {}) {
  const { notes, loading, error } = useUserNotes();
  const { favorites, updating: favoritesUpdating, toggleFavorite } = useNoteFavorites();
  const { user } = useAuth();
  const currentUserId = user?.uid ?? '';

  const [searchQuery, setSearchQuery] = useState('');
  const [sortId, setSortId] = useState<NoteSortId>(defaultSortId);
  const [activeTab, setActiveTab] = useState<NoteTabId>(defaultTabId);

  const [editorState, setEditorState] = useState<NoteEditorState>({
    open: false,
    submitting: false,
    mode: 'create',
    draft: null,
  });

  const [deleteState, setDeleteState] = useState<NoteDeleteState>({
    open: false,
    submitting: false,
    note: null,
  });

  const sortOption = useMemo(
    () => NOTE_SORT_OPTIONS.find((option) => option.id === sortId) ?? NOTE_SORT_OPTIONS[0],
    [sortId],
  );

  const filteredNotes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return notes;
    }

    return notes.filter((note) => {
      const titleMatch = note.title.toLowerCase().includes(normalizedQuery);
      const tagMatch = note.tags?.some((tag) => tag.toLowerCase().includes(normalizedQuery));
      return titleMatch || tagMatch;
    });
  }, [notes, searchQuery]);

  const sortedNotes = useMemo(() => {
    const list = [...filteredNotes];
    return list.sort(sortOption.comparator);
  }, [filteredNotes, sortOption]);

  const favoriteIds = useMemo(() => new Set(favorites), [favorites]);

  const favoriteNotes = useMemo(
    () => sortedNotes.filter((note) => favoriteIds.has(note.id)),
    [sortedNotes, favoriteIds],
  );

  const highlightSummary = useMemo(() => {
    if (notes.length === 0) {
      return 'Bạn chưa có ghi chép nào. Hãy tạo ghi chép đầu tiên để bắt đầu quản lý kiến thức.';
    }

    const percent = notes.length ? Math.round((favorites.length / notes.length) * 100) : 0;
    return `Bạn đang quản lý ${notes.length} ghi chép với ${favorites.length} ghi chép yêu thích (${percent}%).`;
  }, [favorites.length, notes.length]);

  const visibleNotes = useMemo(() => {
    if (activeTab === 'favorites') {
      return sortedNotes.filter((note) => favoriteIds.has(note.id));
    }
    return sortedNotes;
  }, [activeTab, favoriteIds, sortedNotes]);

  const tabCounts = useMemo(
    () => ({
      all: sortedNotes.length,
      favorites: favoriteNotes.length,
    }),
    [favoriteNotes.length, sortedNotes.length],
  );

  const openCreateDialog = useCallback(() => {
    setEditorState({
      open: true,
      submitting: false,
      mode: 'create',
      draft: createEmptyDraft(),
    });
  }, []);

  const openEditDialog = useCallback((note: NoteMeta) => {
    setEditorState({
      open: true,
      submitting: false,
      mode: 'edit',
      draft: {
        id: note.id,
        title: note.title,
        content: note.content ?? '',
        tags: note.tags?.join(', ') ?? '',
        visibility: note.visibility,
      },
    });
  }, []);

  const closeEditor = useCallback(() => {
    setEditorState((prev) => ({ ...prev, open: false }));
  }, []);

  const updateEditorDraft = useCallback((patch: Partial<NoteEditorDraft>) => {
    setEditorState((prev) => {
      if (!prev.draft) return prev;
      return { ...prev, draft: { ...prev.draft, ...patch } };
    });
  }, []);

  const submitEditor = useCallback(async () => {
    setEditorState((prev) => ({ ...prev, submitting: true }));

    try {
      const draft = editorState.draft;
      if (!draft) return;

      const payload = {
        title: draft.title.trim() || 'Ghi chép mới',
        content: draft.content,
        tags: draft.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        visibility: draft.visibility,
      };

      if (editorState.mode === 'create') {
        await noteRepository.createNote(payload);
        toast.success('Đã tạo ghi chép mới');
      } else if (draft.id) {
        await noteRepository.updateNote(draft.id, payload);
        toast.success('Đã cập nhật ghi chép');
      }
      setEditorState({ open: false, submitting: false, mode: 'create', draft: null });
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
      setEditorState((prev) => ({ ...prev, submitting: false }));
    }
  }, [editorState]);

  const promptDelete = useCallback((note: NoteMeta) => {
    setDeleteState({ open: true, submitting: false, note });
  }, []);

  const closeDeletePrompt = useCallback(() => {
    setDeleteState((prev) => ({ ...prev, open: false }));
  }, []);

  const confirmDelete = useCallback(async () => {
    setDeleteState((prev) => ({ ...prev, submitting: true }));

    try {
      if (!deleteState.note) return;
      await noteRepository.deleteNote(deleteState.note.id);
      toast.success('Đã xóa ghi chép');
      setDeleteState({ open: false, submitting: false, note: null });
    } catch (error) {
      console.error(error);
      toast.error('Không thể xóa ghi chép, vui lòng thử lại');
      setDeleteState((prev) => ({ ...prev, submitting: false }));
    }
  }, [deleteState.note]);

  const toggleFavoriteStatus = useCallback(
    async (noteId: NoteID, currentlyFavorite: boolean) => {
      try {
        await toggleFavorite(noteId, currentlyFavorite);
      } catch (error) {
        console.error(error);
        toast.error('Không thể cập nhật trạng thái yêu thích');
      }
    },
    [toggleFavorite],
  );

  return {
    // data
    notes,
    favorites,
    favoriteIds,
    highlightSummary,
    loading,
    error,
    currentUserId,

    // filtering & sorting configuration
    searchQuery,
    setSearchQuery,
    sortId,
    setSortId,
    sortOptions: NOTE_SORT_OPTIONS,
    activeTab,
    setActiveTab,
    tabOptions: NOTE_TAB_OPTIONS,

    // derived collections
    filteredNotes,
    sortedNotes,
    favoriteNotes,
    visibleNotes,
    tabCounts,

    // favorites
    favoritesUpdating,
    toggleFavoriteStatus,

    // editor dialog
    editorState,
    openCreateDialog,
    openEditDialog,
    closeEditor,
    updateEditorDraft,
    submitEditor,

    // deletion dialog
    deleteState,
    promptDelete,
    closeDeletePrompt,
    confirmDelete,
  };
}
