import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { libraryRepository } from '@/shared/lib/repositories/LibraryRepository';
import { shareRepository } from '@/shared/lib/repositories/ShareRepository';
import { userRepository } from '@/shared/lib/repositories/UserRepository';
import { useUserLibraries } from '@/shared/hooks/useLibraries';
import { useFavoriteLibraries } from '@/shared/hooks/useFavorites';
import { useAuth } from '@/shared/hooks/useAuthRedux';
import type { LibraryMeta, LibraryVisibility, ShareRole } from '@/shared/lib/models';
import { LIBRARY_SORT_OPTIONS, LIBRARY_TAB_OPTIONS } from '../constants';
import type {
  LibraryListItem,
  LibraryOwnerProfile,
  LibrarySortId,
  LibrarySortOption,
  LibrarySummary,
  LibraryTabId,
  LibraryTabOption,
  LibraryViewMode,
} from '../types';

export interface LibraryEditorDraft {
  id: string | null;
  title: string;
  description: string;
  visibility: LibraryVisibility;
}

export interface LibraryEditorState {
  open: boolean;
  submitting: boolean;
  mode: 'create' | 'edit';
  draft: LibraryEditorDraft | null;
}

export interface LibraryDeleteState {
  open: boolean;
  submitting: boolean;
  library: LibraryMeta | null;
}

interface SharedLibraryEntry {
  library: LibraryMeta;
  role: ShareRole;
}

export interface UseLibraryListViewOptions {
  defaultSortId?: LibrarySortId;
  defaultTabId?: LibraryTabId;
  defaultViewMode?: LibraryViewMode;
}

export function createEmptyLibraryDraft(): LibraryEditorDraft {
  return {
    id: null,
    title: '',
    description: '',
    visibility: 'private',
  };
}

export function useLibraryListView({
  defaultSortId = 'newest',
  defaultTabId = 'all',
  defaultViewMode = 'grid',
}: UseLibraryListViewOptions = {}) {
  const { libraries: ownedLibraries, loading: ownedLoading, error: ownedError } = useUserLibraries();
  const {
    favoriteIds,
    toggleFavorite,
    updating: favoriteUpdating,
    error: favoriteError,
  } = useFavoriteLibraries();
  const { user } = useAuth();
  const currentUserId = typeof user?.uid === 'string' ? user.uid : '';

  const [sharedEntries, setSharedEntries] = useState<Array<{ libraryId: string; role: ShareRole }>>([]);
  const [sharedLibraries, setSharedLibraries] = useState<SharedLibraryEntry[]>([]);
  const [sharedLoading, setSharedLoading] = useState(false);
  const [ownerProfiles, setOwnerProfiles] = useState<Record<string, LibraryOwnerProfile>>({});
  const [ownerLoading, setOwnerLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery.trim().toLowerCase());
  const [sortId, setSortId] = useState<LibrarySortId>(defaultSortId);
  const [activeTab, setActiveTab] = useState<LibraryTabId>(defaultTabId);
  const [viewMode, setViewMode] = useState<LibraryViewMode>(defaultViewMode);

  const [editorState, setEditorState] = useState<LibraryEditorState>({
    open: false,
    submitting: false,
    mode: 'create',
    draft: null,
  });

  const [deleteState, setDeleteState] = useState<LibraryDeleteState>({
    open: false,
    submitting: false,
    library: null,
  });

  const sharedFetchToken = useRef(0);

  // Listen shared libraries for current user
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let active = true;

    try {
      unsubscribe = shareRepository.listenUserSharedLibraries((entries) => {
        if (!active) return;
        setSharedEntries(entries);
      });
    } catch (error) {
      console.error('Không thể theo dõi thư viện được chia sẻ:', error);
      toast.error('Không thể tải danh sách thư viện được chia sẻ');
    }

    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Fetch metadata for shared libraries
  useEffect(() => {
    let cancelled = false;
    const token = ++sharedFetchToken.current;
    const rolesMap = new Map(sharedEntries.map((entry) => [entry.libraryId, entry.role] as const));

    async function loadSharedLibraries() {
      if (!sharedEntries.length) {
        if (!cancelled) setSharedLibraries([]);
        return;
      }

      setSharedLoading(true);
      try {
        const ids = sharedEntries.map((entry) => entry.libraryId);
        const libs = await libraryRepository.fetchLibrariesByIds(ids);
        if (cancelled || token !== sharedFetchToken.current) return;
        const mapped: SharedLibraryEntry[] = libs.map((lib) => ({
          library: lib,
          role: rolesMap.get(lib.id) ?? 'viewer',
        }));
        setSharedLibraries(mapped);
      } catch (error) {
        if (!cancelled) {
          console.error('Không thể tải thư viện được chia sẻ:', error);
          toast.error('Không thể tải thư viện được chia sẻ');
        }
      } finally {
        if (!cancelled) setSharedLoading(false);
      }
    }

    loadSharedLibraries();

    return () => {
      cancelled = true;
    };
  }, [sharedEntries]);

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const sharedRoleMap = useMemo(() => {
    const map = new Map<string, ShareRole>();
    sharedLibraries.forEach((entry) => {
      map.set(entry.library.id, entry.role);
    });
    return map;
  }, [sharedLibraries]);

  const sharedLibraryMetas = useMemo(() => sharedLibraries.map((entry) => entry.library), [sharedLibraries]);

  const allLibraries = useMemo(() => {
    const unique = new Map<string, LibraryMeta>();
    ownedLibraries.forEach((lib) => unique.set(lib.id, lib));
    sharedLibraryMetas.forEach((lib) => {
      if (!unique.has(lib.id)) unique.set(lib.id, lib);
    });
    return Array.from(unique.values());
  }, [ownedLibraries, sharedLibraryMetas]);

  // Load missing owner profiles
  useEffect(() => {
    const needed = new Set<string>();
    allLibraries.forEach((lib) => {
      if (!ownerProfiles[lib.ownerId]) {
        needed.add(lib.ownerId);
      }
    });

    if (needed.size === 0) return;

    let cancelled = false;
    setOwnerLoading(true);

    (async () => {
      try {
        const profiles = await Promise.all(
          Array.from(needed).map(async (ownerId) => {
            try {
              const profile = await userRepository.getUserProfile(ownerId);
              if (!profile) return { id: ownerId } as LibraryOwnerProfile;
              return profile;
            } catch (error) {
              console.error('Không thể tải hồ sơ người dùng:', error);
              return { id: ownerId } as LibraryOwnerProfile;
            }
          }),
        );
        if (cancelled) return;
        setOwnerProfiles((prev) => {
          const next = { ...prev };
          profiles.forEach((profile) => {
            next[profile.id] = profile;
          });
          return next;
        });
      } finally {
        if (!cancelled) setOwnerLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [allLibraries, ownerProfiles]);

  const summarize = useMemo<LibrarySummary>(() => {
    const ownCount = ownedLibraries.length;
    const sharedCount = sharedLibraries.length;
    const favCount = favoriteIdSet.size;
    return {
      ownedCount: ownCount,
      sharedCount,
      favoriteCount: favCount,
    };
  }, [favoriteIdSet.size, ownedLibraries.length, sharedLibraries.length]);

  const summaryText = useMemo(() => {
    if (!summarize.ownedCount && !summarize.sharedCount) {
      return 'Bắt đầu bằng cách tạo bộ flashcard đầu tiên để xây dựng nền tảng kiến thức của bạn.';
    }
    if (!summarize.sharedCount) {
      return `Bạn đang quản lý ${summarize.ownedCount} bộ flashcard với ${summarize.favoriteCount} bộ yêu thích.`;
    }
    return `Bạn đang quản lý ${summarize.ownedCount} bộ flashcard cá nhân và cộng tác trên ${summarize.sharedCount} bộ được chia sẻ.`;
  }, [summarize]);

  const sortOption = useMemo<LibrarySortOption>(() => {
    return (
      LIBRARY_SORT_OPTIONS.find((option) => option.id === sortId) ?? LIBRARY_SORT_OPTIONS[0]
    );
  }, [sortId]);

  const filteredLibraries = useMemo(() => {
    if (!deferredSearch) return allLibraries;
    return allLibraries.filter((lib) => {
      const titleMatch = lib.title.toLowerCase().includes(deferredSearch);
      const descriptionMatch = lib.description?.toLowerCase().includes(deferredSearch) ?? false;
      const tagMatch = lib.tags?.some((tag) => tag.toLowerCase().includes(deferredSearch)) ?? false;
      return titleMatch || descriptionMatch || tagMatch;
    });
  }, [allLibraries, deferredSearch]);

  const sortedLibraries = useMemo(() => {
    const list = [...filteredLibraries];
    list.sort(sortOption.comparator);
    return list;
  }, [filteredLibraries, sortOption]);

  const favoriteLibraries = useMemo(
    () => sortedLibraries.filter((lib) => favoriteIdSet.has(lib.id)),
    [favoriteIdSet, sortedLibraries],
  );

  const sharedSortedLibraries = useMemo(
    () => sortedLibraries.filter((lib) => sharedRoleMap.has(lib.id)),
    [sharedRoleMap, sortedLibraries],
  );

  const visibleLibraries = useMemo(() => {
    switch (activeTab) {
      case 'favorites':
        return favoriteLibraries;
      case 'shared':
        return sharedSortedLibraries;
      default:
        return sortedLibraries;
    }
  }, [activeTab, favoriteLibraries, sharedSortedLibraries, sortedLibraries]);

  const tabCounts = useMemo(() => ({
    all: sortedLibraries.length,
    favorites: favoriteLibraries.length,
    shared: sharedSortedLibraries.length,
  }), [favoriteLibraries.length, sharedSortedLibraries.length, sortedLibraries.length]);

  const toListItem = useCallback(
    (lib: LibraryMeta): LibraryListItem => ({
      library: lib,
      owner: ownerProfiles[lib.ownerId] ?? null,
      role: sharedRoleMap.get(lib.id) ?? null,
      isFavorite: favoriteIdSet.has(lib.id),
    }),
    [favoriteIdSet, ownerProfiles, sharedRoleMap],
  );

  const visibleItems = useMemo(() => visibleLibraries.map(toListItem), [toListItem, visibleLibraries]);
  const favoriteItems = useMemo(() => favoriteLibraries.map(toListItem), [favoriteLibraries, toListItem]);
  const sharedItems = useMemo(() => sharedSortedLibraries.map(toListItem), [sharedSortedLibraries, toListItem]);

  const openCreateDialog = useCallback(() => {
    setEditorState({
      open: true,
      submitting: false,
      mode: 'create',
      draft: createEmptyLibraryDraft(),
    });
  }, []);

  const openEditDialog = useCallback((lib: LibraryMeta) => {
    setEditorState({
      open: true,
      submitting: false,
      mode: 'edit',
      draft: {
        id: lib.id,
        title: lib.title,
        description: lib.description ?? '',
        visibility: lib.visibility,
      },
    });
  }, []);

  const closeEditor = useCallback(() => {
    setEditorState((prev) => ({ ...prev, open: false }));
  }, []);

  const updateEditorDraft = useCallback((patch: Partial<LibraryEditorDraft>) => {
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

      if (editorState.mode === 'create') {
        if (!draft.title.trim()) {
          toast.error('Vui lòng nhập tên thư viện');
          setEditorState((prev) => ({ ...prev, submitting: false }));
          return;
        }
        await libraryRepository.createLibrary({
          title: draft.title.trim(),
          description: draft.description.trim(),
          visibility: draft.visibility,
        });
        toast.success('Đã tạo thư viện mới');
      } else if (draft.id) {
        await libraryRepository.updateLibrary(draft.id, {
          title: draft.title.trim() || 'Thư viện không tên',
          description: draft.description,
          visibility: draft.visibility,
        });
        toast.success('Đã cập nhật thư viện');
      }

      setEditorState({ open: false, submitting: false, mode: 'create', draft: null });
    } catch (error) {
      console.error(error);
      toast.error('Không thể lưu thư viện, vui lòng thử lại');
      setEditorState((prev) => ({ ...prev, submitting: false }));
    }
  }, [editorState]);

  const promptDelete = useCallback((lib: LibraryMeta) => {
    setDeleteState({ open: true, submitting: false, library: lib });
  }, []);

  const closeDeletePrompt = useCallback(() => {
    setDeleteState((prev) => ({ ...prev, open: false }));
  }, []);

  const confirmDelete = useCallback(async () => {
    setDeleteState((prev) => ({ ...prev, submitting: true }));

    try {
      if (!deleteState.library) return;
      await libraryRepository.deleteLibrary(deleteState.library.id);
      toast.success('Đã xóa thư viện');
      setDeleteState({ open: false, submitting: false, library: null });
    } catch (error) {
      console.error(error);
      toast.error('Không thể xóa thư viện, vui lòng thử lại');
      setDeleteState((prev) => ({ ...prev, submitting: false }));
    }
  }, [deleteState.library]);

  const toggleFavoriteStatus = useCallback(
    async (libraryId: string, isFavorite: boolean) => {
      try {
        await toggleFavorite(libraryId, isFavorite);
      } catch (error) {
        console.error(error);
        toast.error('Không thể cập nhật trạng thái yêu thích');
      }
    },
    [toggleFavorite],
  );

  const switchViewMode = useCallback((mode: LibraryViewMode) => {
    setViewMode(mode);
  }, []);

  const sortOptions = LIBRARY_SORT_OPTIONS;
  const tabOptions: LibraryTabOption[] = LIBRARY_TAB_OPTIONS;

  const loading = ownedLoading || sharedLoading || ownerLoading;
  const error = ownedError || favoriteError || null;

  return {
    // data
    ownedLibraries,
    sharedLibraries,
    sharedEntries,
    summary: summarize,
    summaryText,
    ownerProfiles,
    sharedRoleMap,
    currentUserId,
    allLibrariesCount: allLibraries.length,

    // favorites
    favoriteIds: favoriteIdSet,
    favoriteItems,
    favoriteUpdating,
    toggleFavoriteStatus,

    // filtering & sorting
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

    // derived collections
    sortedLibraries,
    visibleLibraries,
    visibleItems,
    sharedItems,

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

    // status flags
    loading,
    error,
  };
}
