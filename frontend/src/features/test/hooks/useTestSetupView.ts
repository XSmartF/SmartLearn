import { useCallback, useEffect, useMemo, useState } from "react";
import { cardRepository } from "@/shared/lib/repositories/CardRepository";
import { libraryRepository } from "@/shared/lib/repositories/LibraryRepository";
import { idbSetItem } from "@/shared/lib/indexedDB";
import { loadTestQuestionGenerator } from "@/shared/lib/lazyModules";
import { QUESTION_TYPE_OPTIONS } from "@/features/test/constants";
import type {
  MinimalCard,
  TestConfig,
  TestQuestionKind
} from "@/features/test/types";

interface UseTestSetupViewParams {
  libraryId: string | null;
}

export type SetupStatus = "idle" | "loading" | "ready" | "not-found";

interface PersistResult {
  success: boolean;
  config?: TestConfig;
}

export function useTestSetupView({ libraryId }: UseTestSetupViewParams) {
  const [status, setStatus] = useState<SetupStatus>("idle");
  const [libraryTitle, setLibraryTitle] = useState("");
  const [cards, setCards] = useState<MinimalCard[]>([]);

  const [questionTypes, setQuestionTypes] = useState<TestQuestionKind[]>(["multiple-choice"]);
  const [questionCount, setQuestionCount] = useState(10);
  const [questionCountInput, setQuestionCountInput] = useState("10");

  const [hasTimeLimit, setHasTimeLimit] = useState(false);
  const [timeLimit, setTimeLimit] = useState<number>(15);
  const [showAnswerImmediately, setShowAnswerImmediately] = useState(false);

  const [cardSearch, setCardSearch] = useState("");
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());
  const [cardPickerOpen, setCardPickerOpen] = useState(false);

  useEffect(() => {
    if (!libraryId) {
      setStatus("not-found");
      return;
    }
    let cancelled = false;
    setStatus("loading");

    (async () => {
      try {
        const [meta, cardList] = await Promise.all([
          libraryRepository.getLibraryMeta(libraryId),
          cardRepository.listCards(libraryId)
        ]);
        if (cancelled) return;

        if (!meta) {
          setStatus("not-found");
          return;
        }

        setLibraryTitle(meta.title ?? "");
        const minimalCards: MinimalCard[] = cardList.map(card => ({
          id: card.id,
          front: card.front,
          back: card.back
        }));
        setCards(minimalCards);
        setStatus("ready");
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load test setup data", error);
          setStatus("not-found");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [libraryId]);

  const cardPoolSize = useMemo(() => {
    if (selectedCardIds.size) return selectedCardIds.size;
    return cards.length;
  }, [cards.length, selectedCardIds]);

  const maxQuestions = useMemo(() => {
    if (!cardPoolSize) return 0;
    return Math.min(cardPoolSize, 200);
  }, [cardPoolSize]);

  useEffect(() => {
    if (!maxQuestions) return;
    if (questionCount > maxQuestions) {
      setQuestionCount(maxQuestions);
      setQuestionCountInput(String(maxQuestions));
    }
  }, [maxQuestions, questionCount]);

  const filteredCards = useMemo(() => {
    if (!cardSearch) return cards;
    const keyword = cardSearch.toLowerCase();
    return cards.filter(card => card.front.toLowerCase().includes(keyword));
  }, [cards, cardSearch]);

  const toggleQuestionType = useCallback((type: TestQuestionKind) => {
    setQuestionTypes(prev => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev; // keep at least one type
        return prev.filter(item => item !== type);
      }
      return [...prev, type];
    });
  }, []);

  const updateQuestionCountFromInput = useCallback((value: string) => {
    setQuestionCountInput(value);
    if (value === "") return;
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return;
    const bounded = Math.min(Math.max(parsed, 1), maxQuestions || 1);
    setQuestionCount(bounded);
  }, [maxQuestions]);

  const commitQuestionCount = useCallback(() => {
    if (questionCountInput === "") {
      const fallback = Math.min(1, maxQuestions || 1);
      setQuestionCount(fallback);
      setQuestionCountInput(String(fallback));
      return;
    }
    const parsed = Number.parseInt(questionCountInput, 10);
    if (Number.isNaN(parsed)) {
      const fallback = Math.min(1, maxQuestions || 1);
      setQuestionCount(fallback);
      setQuestionCountInput(String(fallback));
      return;
    }
    const bounded = Math.min(Math.max(parsed, 1), maxQuestions || 1);
    setQuestionCount(bounded);
    setQuestionCountInput(String(bounded));
  }, [questionCountInput, maxQuestions]);

  const toggleCardSelection = useCallback((cardId: string) => {
    setSelectedCardIds(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  }, []);

  const toggleAllCards = useCallback(() => {
    setSelectedCardIds(prev => {
      if (prev.size) {
        return new Set();
      }
      return new Set(cards.map(card => card.id));
    });
  }, [cards]);

  const persistConfig = useCallback(async (): Promise<PersistResult> => {
    if (!libraryId) return { success: false };
    if (!cardPoolSize || !questionTypes.length) return { success: false };

    const config: TestConfig = {
      libraryId,
      questionTypes,
      questionCount: Math.min(questionCount, maxQuestions || questionCount),
      timeLimit: hasTimeLimit ? timeLimit : null,
      showAnswerImmediately,
      selectedCardIds: selectedCardIds.size ? Array.from(selectedCardIds) : null
    };

    try {
      await idbSetItem("testConfig", config);
    } catch (error) {
      console.warn("Failed to persist test config to IndexedDB", error);
    }

    try {
      sessionStorage.setItem("testConfig", JSON.stringify(config));
    } catch (error) {
      console.warn("Failed to persist test config to sessionStorage", error);
    }

    try {
      localStorage.setItem("testConfigBackup", JSON.stringify(config));
    } catch (error) {
      console.warn("Failed to persist test config to localStorage", error);
    }

    return { success: true, config };
  }, [cardPoolSize, hasTimeLimit, libraryId, maxQuestions, questionCount, questionTypes, selectedCardIds, showAnswerImmediately, timeLimit]);

  const prefetchGenerator = useCallback(() => {
    loadTestQuestionGenerator().catch(() => undefined);
  }, []);

  const canStart = useMemo(() => {
    if (!libraryId) return false;
    if (status !== "ready") return false;
    if (!questionTypes.length) return false;
    if (!cardPoolSize) return false;
    if (questionCountInput === "") return false;
    return true;
  }, [cardPoolSize, libraryId, questionCountInput, questionTypes.length, status]);

  return {
    status,
    questionTypeOptions: QUESTION_TYPE_OPTIONS,
    library: {
      id: libraryId,
      title: libraryTitle,
      cardCount: cards.length
    },
    cards: {
      filtered: filteredCards,
      selectedIds: selectedCardIds,
      search: cardSearch,
      isPickerOpen: cardPickerOpen,
      poolSize: cardPoolSize
    },
    configState: {
      questionTypes,
      questionCount,
      questionCountInput,
      maxQuestions,
      hasTimeLimit,
      timeLimit,
      showAnswerImmediately
    },
    canStart,
    actions: {
      toggleQuestionType,
      updateQuestionCountFromInput,
      commitQuestionCount,
      toggleTimeLimit: () => setHasTimeLimit(prev => !prev),
      setTimeLimit: (value: number) =>
        setTimeLimit(current => {
          if (Number.isNaN(value)) return current;
          return Math.min(Math.max(Math.round(value), 1), 180);
        }),
      toggleShowAnswer: () => setShowAnswerImmediately(prev => !prev),
      setCardSearch,
      toggleCardPicker: () => setCardPickerOpen(prev => !prev),
      setCardPickerOpen,
      toggleCardSelection,
      toggleAllCards,
      persistConfig,
      prefetchGenerator
    }
  };
}
