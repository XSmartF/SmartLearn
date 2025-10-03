import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { idbGetItem, idbSetItem } from '@/shared/lib/indexedDB';
import { useFavoriteLibraries } from '@/shared/hooks/useFavorites';
import { useLibraryProgress } from '@/shared/hooks/useLibraryProgress';
import { useProgressSummary } from '@/shared/hooks/useProgressSummary';
import { libraryRepository } from '@/shared/lib/repositories/LibraryRepository';
import { cardRepository } from '@/shared/lib/repositories/CardRepository';
import { cardFlagRepository } from '@/shared/lib/repositories/CardFlagRepository';
import { shareRepository } from '@/shared/lib/repositories/ShareRepository';
import { userRepository } from '@/shared/lib/repositories/UserRepository';
import type { Card as EngineCard, LibraryMeta, LibraryShare } from '@/shared/lib/models';
import type { AccessRequestDoc } from '@/shared/lib/repositories/UserRepository';
import { BarChart3, BookOpen, Target } from 'lucide-react';
import { getStudyPath, ROUTES } from '@/shared/constants/routes';

export type LibraryDetailStatus = 'loading' | 'ready' | 'not-found';

export interface FlashcardListItem {
  id: string;
  front: string;
  back: string;
  status: 'mastered' | 'learning' | 'difficult';
  difficulty: 'easy' | 'medium' | 'hard';
  isBookmarked: boolean;
}

export interface LibraryDetailDependencies {
  libraryId: string | null | undefined;
  loaderLibrary?: LibraryMeta | null;
}

interface LibraryDetailHandlers {
  toggleFavorite: () => Promise<void>;
  startStudy: () => void;
  requestAccess: () => Promise<void>;
  addSingleCard: () => Promise<void>;
  addBulkCards: () => Promise<void>;
  deleteSelectedCards: () => Promise<void>;
  deleteLibrary: () => Promise<void>;
  saveEditedCard: () => Promise<void>;
  inviteShare: (userId: string, role: 'viewer' | 'contributor') => Promise<void>;
  removeShare: (shareId: string) => Promise<void>;
  updateShareRole: (shareId: string, role: 'viewer' | 'contributor') => Promise<void>;
  handleDifficultyChange: (cardId: string, difficulty: 'easy' | 'medium' | 'hard') => Promise<void>;
  handleBookmarkToggle: (cardId: string) => Promise<void>;
  handleDeleteSingleCard: (cardId: string) => Promise<void>;
  speakQuestion: (text: string, lang: string) => void;
}

export interface LibraryDetailViewModel extends LibraryDetailHandlers {
  status: LibraryDetailStatus;
  libraryId: string;
  loading: boolean;
  errorMessage: string | null;
  library: LibraryMeta | null;
  cards: EngineCard[];
  cardFlags: Record<string, { starred?: boolean; difficulty?: 'easy' | 'medium' | 'hard' }>;
  isFavorite: boolean;
  shares: LibraryShare[];
  loadingShares: boolean;
  inviteEmail: string;
  setInviteEmail: (value: string) => void;
  inviteRole: 'viewer' | 'contributor';
  setInviteRole: (role: 'viewer' | 'contributor') => void;
  inviteLoading: boolean;
  lookupLoading: boolean;
  emailLookupResults: { id: string; email?: string; displayName?: string }[];
  shareOpen: boolean;
  setShareOpen: (open: boolean) => void;
  ownerProfile: { id: string; email?: string; displayName?: string; avatarUrl?: string } | null;
  accessRequests: AccessRequestDoc[];
  requestingAccess: boolean;
  currentUserId: string;
  liveShareRole: 'viewer' | 'contributor' | null;
  navigatingToStudy: boolean;
  hasOngoingSession: boolean;
  setHasOngoingSession: (value: boolean) => void;
  canStudy: boolean;
  canModify: boolean;
  isOwner: boolean;
  hasShareAccess: boolean;
  hasPendingRequest: boolean;
  stats: { title: string; value: string | number; percentage: number; icon: ComponentType<{ className?: string }>; color: string }[];
  totals: {
    total: number;
    masteredVal: number;
    learningVal: number;
    masteredPct: number;
    learningPct: number;
  };
  filteredCards: EngineCard[];
  paginatedCards: EngineCard[];
  totalPages: number;
  flashcardItems: FlashcardListItem[];
  selectedIds: string[];
  setSelectedIds: (value: string[] | ((prev: string[]) => string[])) => void;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  search: string;
  setSearch: (value: string) => void;
  openAddCard: boolean;
  setOpenAddCard: (value: boolean) => void;
  bulkMode: boolean;
  setBulkMode: (value: boolean) => void;
  bulkText: string;
  setBulkText: (value: string) => void;
  bulkPreview: { front: string; back: string }[];
  front: string;
  setFront: (value: string) => void;
  back: string;
  setBack: (value: string) => void;
  adding: boolean;
  confirmDeleteOpen: boolean;
  setConfirmDeleteOpen: (open: boolean) => void;
  deleting: boolean;
  confirmDeleteLibraryOpen: boolean;
  setConfirmDeleteLibraryOpen: (open: boolean) => void;
  deletingLibrary: boolean;
  editCardId: string | null;
  setEditCardId: (value: string | null) => void;
  editFront: string;
  setEditFront: (value: string) => void;
  editBack: string;
  setEditBack: (value: string) => void;
  editDomain: string;
  setEditDomain: (value: string) => void;
  editDifficulty: '' | 'easy' | 'medium' | 'hard';
  setEditDifficulty: (value: '' | 'easy' | 'medium' | 'hard') => void;
  readLanguage: string;
  progStats: ReturnType<typeof useLibraryProgress>['stats'];
  rawState: ReturnType<typeof useLibraryProgress>['rawState'];
  summary: ReturnType<typeof useProgressSummary>['summary'];
}

type AddCardMode = 'single' | 'bulk';

interface AddCardState {
  open: boolean;
  mode: AddCardMode;
  single: { front: string; back: string };
  bulk: { text: string; preview: { front: string; back: string }[] };
  submitting: boolean;
}

interface CardEditorState {
  id: string | null;
  front: string;
  back: string;
  domain: string;
  difficulty: '' | 'easy' | 'medium' | 'hard';
}

interface CardViewState {
  selectedIds: string[];
  page: number;
  pageSize: number;
  viewMode: 'grid' | 'list';
  search: string;
}

interface DeleteState {
  cardsOpen: boolean;
  libraryOpen: boolean;
  deletingCards: boolean;
  deletingLibrary: boolean;
}

interface ShareState {
  open: boolean;
  list: LibraryShare[];
  loading: boolean;
  inviteEmail: string;
  inviteRole: 'viewer' | 'contributor';
  inviteLoading: boolean;
  lookupLoading: boolean;
  lookupResults: { id: string; email?: string; displayName?: string }[];
}

const createInitialAddCardState = (): AddCardState => ({
  open: false,
  mode: 'single',
  single: { front: '', back: '' },
  bulk: { text: '', preview: [] },
  submitting: false,
});

const createInitialEditorState = (): CardEditorState => ({
  id: null,
  front: '',
  back: '',
  domain: '',
  difficulty: '',
});

const createInitialCardViewState = (): CardViewState => ({
  selectedIds: [],
  page: 1,
  pageSize: 20,
  viewMode: 'grid',
  search: '',
});

const createInitialDeleteState = (): DeleteState => ({
  cardsOpen: false,
  libraryOpen: false,
  deletingCards: false,
  deletingLibrary: false,
});

const createInitialShareState = (): ShareState => ({
  open: false,
  list: [],
  loading: false,
  inviteEmail: '',
  inviteRole: 'viewer',
  inviteLoading: false,
  lookupLoading: false,
  lookupResults: [],
});

export function useLibraryDetail({ libraryId, loaderLibrary }: LibraryDetailDependencies): LibraryDetailViewModel {
  const id = libraryId ?? '';
  const navigate = useNavigate();
  const { favoriteIds, toggleFavorite: toggleFavoriteMutation } = useFavoriteLibraries();
  const isFavorite = id ? favoriteIds.includes(id) : false;

  const [library, setLibrary] = useState<LibraryMeta | null>(loaderLibrary ?? null);
  const [cards, setCards] = useState<EngineCard[]>([]);
  const [cardFlags, setCardFlags] = useState<Record<string, { starred?: boolean; difficulty?: 'easy' | 'medium' | 'hard' }>>({});
  const [loading, setLoading] = useState(true);

  const [addCardState, setAddCardState] = useState<AddCardState>(() => createInitialAddCardState());
  const [cardEditor, setCardEditor] = useState<CardEditorState>(() => createInitialEditorState());
  const [cardView, setCardView] = useState<CardViewState>(() => createInitialCardViewState());
  const [deleteState, setDeleteState] = useState<DeleteState>(() => createInitialDeleteState());
  const [shareState, setShareState] = useState<ShareState>(() => createInitialShareState());

  const [currentUserId, setCurrentUserId] = useState('');
  const [ownerProfile, setOwnerProfile] = useState<{ id: string; email?: string; displayName?: string; avatarUrl?: string } | null>(null);
  const [accessRequests, setAccessRequests] = useState<AccessRequestDoc[]>([]);
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [liveShareRole, setLiveShareRole] = useState<'viewer' | 'contributor' | null>(null);
  const [navigatingToStudy, setNavigatingToStudy] = useState(false);
  const [hasOngoingSession, setHasOngoingSession] = useState(false);
  const [readLanguage] = useState('en-US');

  const { stats: progStats, rawState } = useLibraryProgress(id);
  const { summary } = useProgressSummary(id);

  const speakQuestion = useCallback((text: string, lang: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 200);
  }, []);

  const bulkMode = addCardState.mode === 'bulk';
  const bulkText = addCardState.bulk.text;

  useEffect(() => {
    if (!bulkMode) {
      setAddCardState(prev => {
        if (!prev.bulk.preview.length) return prev;
        return { ...prev, bulk: { ...prev.bulk, preview: [] } };
      });
      return;
    }

    const text = bulkText.trim();
    if (!text) {
      setAddCardState(prev => {
        if (!prev.bulk.preview.length) return prev;
        return { ...prev, bulk: { ...prev.bulk, preview: [] } };
      });
      return;
    }

    const parsed: { front: string; back: string }[] = [];
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line) continue;
      const idx = line.indexOf('|');
      if (idx === -1) continue;
      const front = line.slice(0, idx).trim();
      const back = line.slice(idx + 1).trim();
      if (front && back) parsed.push({ front, back });
    }

    setAddCardState(prev => ({ ...prev, bulk: { ...prev.bulk, preview: parsed } }));
  }, [bulkMode, bulkText]);

  useEffect(() => {
    if (!id) return;
    idbGetItem(`study-session-${id}`).then(session => {
      setHasOngoingSession(!!session);
    });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = cardFlagRepository.listenLibraryFlags(id, flags => {
        setCardFlags(flags);
      });
    } catch (error) {
      console.error('Không thể theo dõi trạng thái đánh dấu thẻ:', error);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    const cleanupSubs: Array<() => void> = [];

    async function load() {
      if (!id) {
        setLoading(false);
        setLibrary(null);
        setCards([]);
        return;
      }

      setLoading(true);
      try {
        let meta: LibraryMeta | null | undefined = loaderLibrary ?? null;

        if (!meta) {
          const cached = await idbGetItem<{ meta: LibraryMeta | null; cards: EngineCard[] }>(`library:${id}`);
          if (cached && !cancelled) {
            meta = cached.meta ?? null;
            setLibrary(cached.meta ?? null);
            setCards(cached.cards);
          }
        }

        if (!meta) {
          const [fMeta, fCards] = await Promise.all([
            libraryRepository.getLibraryMeta(id),
            cardRepository.listCardsPreferCache(id),
          ]);
          meta = fMeta;
          if (!cancelled) {
            setLibrary(meta ?? null);
            setCards(fCards);
            idbSetItem(`library:${id}`, { meta, cards: fCards, cachedAt: Date.now() }).catch(() => {});
          }
        }

        if (!cancelled && meta && meta.id) {
          const unsubCards = cardRepository.listenLibraryCards(meta.id, cs => {
            setCards(prev => {
              const real = cs;
              const realKey = new Set(real.map(r => `${r.front}||${r.back}`));
              const mergedTemps = prev.filter(p => p.id.startsWith('temp-') && !realKey.has(`${p.front}||${p.back}`));
              return [...mergedTemps, ...real];
            });
            idbSetItem(`library:${meta.id}`, { meta, cards: cs, cachedAt: Date.now() }).catch(() => {});
          });
          cleanupSubs.push(unsubCards);

          if (meta.visibility === 'private') {
            try {
              const sh = await shareRepository.listShares(meta.id);
              if (!cancelled) {
                setShareState(prev => ({ ...prev, list: sh }));
              }
            } catch {
              /* ignore */
            }
          }

          if (meta.ownerId) {
            try {
              const profile = await userRepository.getUserProfile(meta.ownerId);
              if (!cancelled) setOwnerProfile(profile);
            } catch {
              /* ignore */
            }
          }

          try {
            const reqs = await userRepository.listUserAccessRequests(meta.id);
            if (!cancelled) setAccessRequests(reqs);
          } catch {
            /* ignore */
          }
        }

        try {
          const authMod = await import('@/shared/lib/firebase');
          const auth = authMod.getFirebaseAuth();
          if (!cancelled && auth.currentUser) {
            setCurrentUserId(auth.currentUser.uid);
          }
        } catch (error) {
          console.error('Không thể lấy thông tin người dùng hiện tại:', error);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
      cleanupSubs.forEach(unsub => {
        try {
          unsub();
        } catch {
          /* ignore */
        }
      });
    };
  }, [id, loaderLibrary]);

  useEffect(() => {
    if (!id) return;
    let unsub: (() => void) | null = null;
    try {
      unsub = shareRepository.listenCurrentUserShareForLibrary(id, share => {
        setLiveShareRole(share ? share.role : null);
      });
    } catch {
      /* ignore */
    }
    return () => {
      if (unsub) unsub();
    };
  }, [id]);

  useEffect(() => {
    if (!shareState.open || !id) return;
    let cancelled = false;
    setShareState(prev => ({ ...prev, loading: true }));
    (async () => {
      try {
        const list = await shareRepository.listShares(id);
        if (!cancelled) {
          setShareState(prev => ({ ...prev, list }));
        }
      } finally {
        if (!cancelled) {
          setShareState(prev => ({ ...prev, loading: false }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [shareState.open, id]);

  useEffect(() => {
    const email = shareState.inviteEmail;
    if (!email) {
      setShareState(prev => {
        if (!prev.lookupResults.length && !prev.lookupLoading) return prev;
        return { ...prev, lookupResults: [], lookupLoading: false };
      });
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setShareState(prev => ({ ...prev, lookupLoading: true }));
      try {
        const res = await userRepository.findUserByEmail(email.trim());
        if (!cancelled) {
          setShareState(prev => ({ ...prev, lookupResults: res }));
        }
      } finally {
        if (!cancelled) {
          setShareState(prev => ({ ...prev, lookupLoading: false }));
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [shareState.inviteEmail]);

  const filteredCards = useMemo(() => {
    if (!cardView.search.trim()) return cards;
    const query = cardView.search.toLowerCase();
    return cards.filter(c => c.front.toLowerCase().includes(query) || c.back.toLowerCase().includes(query));
  }, [cards, cardView.search]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredCards.length / cardView.pageSize)),
    [filteredCards.length, cardView.pageSize],
  );

  const paginatedCards = useMemo(
    () => filteredCards.slice((cardView.page - 1) * cardView.pageSize, (cardView.page - 1) * cardView.pageSize + cardView.pageSize),
    [filteredCards, cardView.page, cardView.pageSize],
  );

  useEffect(() => {
    setCardView(prev => {
      const nextSelected = prev.selectedIds.filter(cid => filteredCards.some(c => c.id === cid));
      const totalPagesForFiltered = Math.max(1, Math.ceil(filteredCards.length / prev.pageSize));
      const nextPage = Math.min(prev.page, totalPagesForFiltered);
      if (nextPage === prev.page && nextSelected.length === prev.selectedIds.length) {
        return prev;
      }
      return { ...prev, page: nextPage, selectedIds: nextSelected };
    });
  }, [filteredCards]);

  const flashcardItems = useMemo<FlashcardListItem[]>(() => {
    return cards.map(card => {
      const flag = cardFlags[card.id];
      const difficulty = ((flag?.difficulty ?? card.difficulty) || 'medium') as 'easy' | 'medium' | 'hard';
      const status: 'mastered' | 'learning' | 'difficult' =
        difficulty === 'hard' ? 'difficult' : difficulty === 'easy' ? 'mastered' : 'learning';
      return {
        id: card.id,
        front: card.front,
        back: card.back,
        status,
        difficulty,
        isBookmarked: flag?.starred ?? false,
      };
    });
  }, [cards, cardFlags]);

  const totals = useMemo(() => {
    const total = library?.cardCount ?? cards.length;
    const masteredVal = summary ? summary.mastered : progStats.mastered;
    const learningVal = summary ? summary.learning : progStats.learning;
    const masteredPct = total ? Math.round((masteredVal / total) * 100) : 0;
    const learningPct = total ? Math.round((learningVal / total) * 100) : 0;
    return { total, masteredVal, learningVal, masteredPct, learningPct };
  }, [library?.cardCount, cards.length, summary, progStats.mastered, progStats.learning]);

  const stats = useMemo(() => [
    { title: 'Tổng thẻ', value: totals.total, percentage: 100, icon: Target, color: 'text-info' },
    { title: 'Đã thuộc', value: totals.masteredVal, percentage: totals.masteredPct, icon: BookOpen, color: 'text-success' },
    { title: 'Đang học', value: totals.learningVal, percentage: totals.learningPct, icon: BarChart3, color: 'text-warning' },
  ], [totals.total, totals.masteredVal, totals.masteredPct, totals.learningVal, totals.learningPct]);

  const isOwner = Boolean(library && currentUserId && library.ownerId === currentUserId);
  const hasShareAccess = shareState.list.some(s => s.targetUserId === currentUserId) || !!liveShareRole;
  const canStudy = !!library && (library.visibility === 'public' || isOwner || hasShareAccess);
  const canModify = !!library && (isOwner || liveShareRole === 'contributor');
  const hasPendingRequest = !canStudy && accessRequests.some(r => r.status === 'pending');

  const studyPath = id ? getStudyPath(id) : '#';
  const status: LibraryDetailStatus = loading ? 'loading' : !library ? 'not-found' : 'ready';

  const setSelectedIds = useCallback((value: string[] | ((prev: string[]) => string[])) => {
    setCardView(prev => {
      const next = typeof value === 'function' ? (value as (prev: string[]) => string[])(prev.selectedIds) : value;
      return { ...prev, selectedIds: next };
    });
  }, []);

  const setPage = useCallback((nextPage: number) => {
    setCardView(prev => ({ ...prev, page: nextPage }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setCardView(prev => ({ ...prev, pageSize: size, page: 1 }));
  }, []);

  const setViewMode = useCallback((mode: 'grid' | 'list') => {
    setCardView(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const setSearch = useCallback((value: string) => {
    setCardView(prev => ({ ...prev, search: value }));
  }, []);

  const setOpenAddCard = useCallback((open: boolean) => {
    setAddCardState(prev => (open ? { ...prev, open: true } : createInitialAddCardState()));
  }, []);

  const setBulkMode = useCallback((value: boolean) => {
    setAddCardState(prev => ({ ...prev, mode: value ? 'bulk' : 'single' }));
  }, []);

  const setBulkText = useCallback((value: string) => {
    setAddCardState(prev => ({ ...prev, bulk: { ...prev.bulk, text: value } }));
  }, []);

  const setFront = useCallback((value: string) => {
    setAddCardState(prev => ({ ...prev, single: { ...prev.single, front: value } }));
  }, []);

  const setBack = useCallback((value: string) => {
    setAddCardState(prev => ({ ...prev, single: { ...prev.single, back: value } }));
  }, []);

  const setConfirmDeleteOpen = useCallback((open: boolean) => {
    setDeleteState(prev => ({ ...prev, cardsOpen: open }));
  }, []);

  const setConfirmDeleteLibraryOpen = useCallback((open: boolean) => {
    setDeleteState(prev => ({ ...prev, libraryOpen: open }));
  }, []);

  const setShareOpen = useCallback((open: boolean) => {
    setShareState(prev => ({
      ...prev,
      open,
      inviteEmail: open ? prev.inviteEmail : '',
      inviteRole: open ? prev.inviteRole : 'viewer',
      inviteLoading: open ? prev.inviteLoading : false,
      lookupLoading: open ? prev.lookupLoading : false,
      lookupResults: open ? prev.lookupResults : [],
    }));
  }, []);

  const setInviteEmail = useCallback((value: string) => {
    setShareState(prev => ({ ...prev, inviteEmail: value }));
  }, []);

  const setInviteRole = useCallback((role: 'viewer' | 'contributor') => {
    setShareState(prev => ({ ...prev, inviteRole: role }));
  }, []);

  const setEditCardId = useCallback((value: string | null) => {
    if (value === null) {
      setCardEditor(createInitialEditorState());
    } else {
      setCardEditor(prev => ({ ...prev, id: value }));
    }
  }, []);

  const setEditFront = useCallback((value: string) => {
    setCardEditor(prev => ({ ...prev, front: value }));
  }, []);

  const setEditBack = useCallback((value: string) => {
    setCardEditor(prev => ({ ...prev, back: value }));
  }, []);

  const setEditDomain = useCallback((value: string) => {
    setCardEditor(prev => ({ ...prev, domain: value }));
  }, []);

  const setEditDifficulty = useCallback((value: '' | 'easy' | 'medium' | 'hard') => {
    setCardEditor(prev => ({ ...prev, difficulty: value }));
  }, []);

  const toggleFavorite = useCallback(async () => {
    if (!id) return;
    await toggleFavoriteMutation(id, isFavorite);
  }, [id, isFavorite, toggleFavoriteMutation]);

  const requestAccess = useCallback(async () => {
    if (!library) return;
    try {
      setRequestingAccess(true);
      await userRepository.createAccessRequest(library.id, library.ownerId);
      const reqs = await userRepository.listUserAccessRequests(library.id);
      setAccessRequests(reqs);
    } finally {
      setRequestingAccess(false);
    }
  }, [library]);

  const startStudy = useCallback(() => {
    if (!canStudy || !id || navigatingToStudy) return;
    setNavigatingToStudy(true);
    navigate(studyPath);
  }, [canStudy, id, navigatingToStudy, studyPath, navigate]);

  const addSingleCard = useCallback(async () => {
    if (!library) return;
    const { front, back } = addCardState.single;
    if (!front || !back) return;

    setAddCardState(prev => ({ ...prev, submitting: true }));

    let snapshot: EngineCard[] = cards;
    setCards(prev => {
      snapshot = prev;
      return [{ id: `temp-${Date.now()}`, front, back } as EngineCard, ...prev];
    });

    try {
      await libraryRepository.createCard({ libraryId: library.id, front, back });
      toast.success('Đã thêm thẻ');
      setAddCardState(() => createInitialAddCardState());
    } catch (error) {
      console.error(error);
      setCards(snapshot);
      toast.error('Không thể thêm thẻ, hãy thử lại');
    } finally {
      setAddCardState(prev => ({ ...prev, submitting: false }));
    }
  }, [library, addCardState.single, cards]);

  const addBulkCards = useCallback(async () => {
    if (!library) return;
    const preview = addCardState.bulk.preview;
    if (!preview.length) return;

    setAddCardState(prev => ({ ...prev, submitting: true }));

    const baseTs = Date.now();
    const temps = preview.map((p, index) => ({ id: `temp-bulk-${baseTs}-${index}`, front: p.front, back: p.back } as EngineCard));

    let snapshot: EngineCard[] = cards;
    setCards(prev => {
      snapshot = prev;
      return [...temps, ...prev];
    });

    try {
      const created = await libraryRepository.createCardsBulk(library.id, preview);
      toast.success(`Đã thêm ${created} thẻ`);
      setAddCardState(() => createInitialAddCardState());
    } catch (error) {
      console.error(error);
      setCards(snapshot);
      toast.error('Không thể thêm thẻ hàng loạt');
    } finally {
      setAddCardState(prev => ({ ...prev, submitting: false }));
    }
  }, [library, addCardState.bulk.preview, cards]);

  const deleteSelectedCards = useCallback(async () => {
    if (!cardView.selectedIds.length) return;
    let shouldProceed = true;
    setDeleteState(prev => {
      if (prev.deletingCards) shouldProceed = false;
      return shouldProceed ? { ...prev, deletingCards: true } : prev;
    });
    if (!shouldProceed) return;

    const ids = [...cardView.selectedIds];
    let snapshot: EngineCard[] = cards;
    setCards(prev => {
      snapshot = prev;
      return prev.filter(card => !ids.includes(card.id));
    });

    try {
      const removed = await cardRepository.deleteCardsBulk(ids);
      toast.success(`Đã xóa ${removed} thẻ`);
      setCardView(prev => ({ ...prev, selectedIds: [], page: 1 }));
    } catch (error) {
      console.error(error);
      setCards(snapshot);
      toast.error('Không thể xóa thẻ');
    } finally {
      setDeleteState(prev => ({ ...prev, deletingCards: false, cardsOpen: false }));
    }
  }, [cardView.selectedIds, cards]);

  const deleteLibrary = useCallback(async () => {
    if (!id || !library) return;
    let shouldProceed = true;
    setDeleteState(prev => {
      if (prev.deletingLibrary) shouldProceed = false;
      return shouldProceed ? { ...prev, deletingLibrary: true } : prev;
    });
    if (!shouldProceed) return;

    try {
      await libraryRepository.deleteLibrary(id);
      toast.success('Đã xóa thư viện');
      navigate(ROUTES.MY_LIBRARY);
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi xóa thư viện');
    } finally {
      setDeleteState(prev => ({ ...prev, deletingLibrary: false, libraryOpen: false }));
    }
  }, [id, library, navigate]);

  const saveEditedCard = useCallback(async () => {
    if (!cardEditor.id) return;
    const cid = cardEditor.id;
    const payload = {
      front: cardEditor.front,
      back: cardEditor.back,
      domain: cardEditor.domain || undefined,
      difficulty: cardEditor.difficulty || undefined,
    };

    const snapshot = cards;
    setCards(prev => prev.map(card => (card.id === cid ? { ...card, ...payload } : card)));

    try {
      await cardRepository.updateCard(cid, {
        front: cardEditor.front,
        back: cardEditor.back,
        domain: cardEditor.domain || null,
        difficulty: cardEditor.difficulty || null,
      });
      toast.success('Đã cập nhật thẻ');
    } catch (error) {
      console.error(error);
      setCards(snapshot);
      toast.error('Lỗi cập nhật');
    } finally {
      setCardEditor(createInitialEditorState());
    }
  }, [cardEditor, cards]);

  const inviteShare = useCallback(async (userId: string, role: 'viewer' | 'contributor') => {
    if (!id) return;
    setShareState(prev => ({ ...prev, inviteLoading: true }));
    try {
      await shareRepository.addShare(id, userId, role);
      const list = await shareRepository.listShares(id);
      setShareState(prev => ({ ...prev, list, inviteEmail: '' }));
      toast.success('Đã chia sẻ');
    } catch (error) {
      console.error(error);
      toast.error('Lỗi chia sẻ');
    } finally {
      setShareState(prev => ({ ...prev, inviteLoading: false }));
    }
  }, [id]);

  const removeShare = useCallback(async (shareId: string) => {
    if (!id) return;
    try {
      await shareRepository.removeShare(shareId);
      const list = await shareRepository.listShares(id);
      setShareState(prev => ({ ...prev, list }));
      toast.success('Đã hủy chia sẻ');
    } catch (error) {
      console.error(error);
      toast.error('Lỗi');
    }
  }, [id]);

  const updateShareRole = useCallback(async (shareId: string, role: 'viewer' | 'contributor') => {
    if (!id) return;
    try {
      await shareRepository.updateShareRole(shareId, role);
      const list = await shareRepository.listShares(id);
      setShareState(prev => ({ ...prev, list }));
      toast.success('Đã cập nhật');
    } catch (error) {
      console.error(error);
      toast.error('Lỗi cập nhật');
    }
  }, [id]);

  const handleDifficultyChange = useCallback(async (cardId: string, difficulty: 'easy' | 'medium' | 'hard') => {
    if (!id) return;
    const previous = cardFlags[cardId]?.difficulty ?? (cards.find(card => card.id === cardId)?.difficulty as 'easy' | 'medium' | 'hard' | undefined) ?? 'medium';
    setCardFlags(prev => {
      const current = prev[cardId] ?? {};
      return { ...prev, [cardId]: { ...current, difficulty } };
    });
    try {
      await Promise.all([
        cardRepository.updateCard(cardId, { difficulty }),
        cardFlagRepository.setDifficulty(cardId, id, difficulty),
      ]);
      toast.success('Đã cập nhật độ khó của thẻ');
    } catch (error) {
      console.error('Failed to update card difficulty:', error);
      setCardFlags(prev => {
        const current = prev[cardId] ?? {};
        return { ...prev, [cardId]: { ...current, difficulty: previous } };
      });
      toast.error('Không thể cập nhật độ khó');
    }
  }, [id, cardFlags, cards]);

  const handleBookmarkToggle = useCallback(async (cardId: string) => {
    if (!id) return;
    const prevStarred = cardFlags[cardId]?.starred === true;
    const nextStarred = !prevStarred;
    setCardFlags(prev => {
      const current = prev[cardId] ?? {};
      return { ...prev, [cardId]: { ...current, starred: nextStarred } };
    });
    try {
      await cardFlagRepository.toggleStar(cardId, id, nextStarred);
      toast.success(nextStarred ? 'Đã đánh dấu thẻ' : 'Đã bỏ đánh dấu thẻ');
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      setCardFlags(prev => {
        const current = prev[cardId] ?? {};
        return { ...prev, [cardId]: { ...current, starred: prevStarred } };
      });
      toast.error('Không thể cập nhật đánh dấu');
    }
  }, [id, cardFlags]);

  const handleDeleteSingleCard = useCallback(async (cardId: string) => {
    setCardView(prev => ({ ...prev, selectedIds: [cardId] }));
    setDeleteState(prev => ({ ...prev, cardsOpen: true }));
  }, []);

  return {
    status,
    libraryId: id,
    loading,
    errorMessage: null,
    library,
    cards,
    cardFlags,
    isFavorite,
    shares: shareState.list,
    loadingShares: shareState.loading,
    inviteEmail: shareState.inviteEmail,
    setInviteEmail,
    inviteRole: shareState.inviteRole,
    setInviteRole,
    inviteLoading: shareState.inviteLoading,
    lookupLoading: shareState.lookupLoading,
    emailLookupResults: shareState.lookupResults,
    shareOpen: shareState.open,
    setShareOpen,
    ownerProfile,
    accessRequests,
    requestingAccess,
    currentUserId,
    liveShareRole,
    navigatingToStudy,
    hasOngoingSession,
    setHasOngoingSession,
    canStudy,
    canModify,
    isOwner,
    hasShareAccess,
    hasPendingRequest,
    stats,
    totals,
    filteredCards,
    paginatedCards,
    totalPages,
    flashcardItems,
    selectedIds: cardView.selectedIds,
    setSelectedIds,
    page: cardView.page,
    setPage,
    pageSize: cardView.pageSize,
    setPageSize,
    viewMode: cardView.viewMode,
    setViewMode,
    search: cardView.search,
    setSearch,
    openAddCard: addCardState.open,
    setOpenAddCard,
    bulkMode,
    setBulkMode,
    bulkText,
    setBulkText,
    bulkPreview: addCardState.bulk.preview,
    front: addCardState.single.front,
    setFront,
    back: addCardState.single.back,
    setBack,
    adding: addCardState.submitting,
    confirmDeleteOpen: deleteState.cardsOpen,
    setConfirmDeleteOpen,
    deleting: deleteState.deletingCards,
    confirmDeleteLibraryOpen: deleteState.libraryOpen,
    setConfirmDeleteLibraryOpen,
    deletingLibrary: deleteState.deletingLibrary,
    editCardId: cardEditor.id,
    setEditCardId,
    editFront: cardEditor.front,
    setEditFront,
    editBack: cardEditor.back,
    setEditBack,
    editDomain: cardEditor.domain,
    setEditDomain,
    editDifficulty: cardEditor.difficulty,
    setEditDifficulty,
    readLanguage,
    progStats,
    rawState,
    summary,
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
  };
}
