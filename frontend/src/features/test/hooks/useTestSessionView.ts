import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { normalize } from "@/features/study/utils/learnEngine";
import { cardRepository } from "@/shared/lib/repositories/CardRepository";
import { libraryRepository } from "@/shared/lib/repositories/LibraryRepository";
import { loadTestQuestionGenerator } from "@/shared/lib/lazyModules";
import { idbGetItem } from "@/shared/lib/indexedDB";
import { getLibraryDetailPath, getTestSetupPath } from "@/shared/constants/routes";
import type {
  TestConfig,
  TestQuestion,
  TestQuestionKind,
  TestQuestionState,
  TestResultSummary,
  TestSessionStatus
} from "@/features/test/types";

interface UseTestSessionParams {
  libraryId: string | null;
}

interface AnswerState {
  [index: number]: string;
}

const DEFAULT_TIME_WARNING_THRESHOLD = 60; // seconds

const loadPersistedConfig = async (): Promise<TestConfig | null> => {
  const fromIDB = await idbGetItem<TestConfig>("testConfig");
  if (fromIDB) return fromIDB;
  try {
    const raw = sessionStorage.getItem("testConfig");
    if (raw) return JSON.parse(raw) as TestConfig;
  } catch {
    // ignore
  }
  try {
    const raw = localStorage.getItem("testConfigBackup");
    if (raw) return JSON.parse(raw) as TestConfig;
  } catch {
    // ignore
  }
  return null;
};

const toTestQuestion = (generated: { id: number; type: TestQuestionKind; question: string; options?: string[]; correctAnswer: string }): TestQuestion => ({
  id: generated.id.toString(),
  type: generated.type,
  prompt: generated.question,
  options: generated.options,
  correctAnswer: generated.correctAnswer
});

const formatSeconds = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export function useTestSessionView({ libraryId }: UseTestSessionParams) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<TestSessionStatus>("loading");
  const [libraryTitle, setLibraryTitle] = useState("");
  const [config, setConfig] = useState<TestConfig | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [result, setResult] = useState<TestResultSummary | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timeWarningThreshold] = useState(DEFAULT_TIME_WARNING_THRESHOLD);
  const [reloadToken, setReloadToken] = useState(0);

  const startTimeRef = useRef<number | null>(null);
  const reloadSession = useCallback(() => {
    setReloadToken(token => token + 1);
    setStatus("loading");
  }, []);

  const evaluateResult = useCallback((
    questionsList: TestQuestion[],
    answersMap: AnswerState,
    startedAt: number
  ): TestResultSummary => {
    const endTime = Date.now();
    const durationSeconds = Math.max(0, Math.round((endTime - startedAt) / 1000));

    let correct = 0;
    const detailed: TestQuestionState[] = questionsList.map((question, index) => {
      const userAnswer = answersMap[index];
      const isCorrect = normalize(userAnswer ?? "") === normalize(question.correctAnswer ?? "");
      if (isCorrect) correct += 1;
      return {
        ...question,
        userAnswer,
        isCorrect
      };
    });

    return {
      totalQuestions: questionsList.length,
      correctAnswers: correct,
      incorrectAnswers: Math.max(0, questionsList.length - correct),
      score: questionsList.length ? Math.round((correct / questionsList.length) * 100) : 0,
      timeSpentSeconds: durationSeconds,
      questions: detailed
    };
  }, []);

  useEffect(() => {
    if (!libraryId) {
      setStatus("missing-config");
      return;
    }

    let cancelled = false;
    const run = async () => {
      setStatus("loading");
      setResult(null);
      setQuestions([]);
      setAnswers({});
      setCurrentIndex(0);
      setShowAnswer(false);

      const persisted = await loadPersistedConfig();
      if (cancelled) return;
      if (!persisted || persisted.libraryId !== libraryId) {
        setStatus("missing-config");
        return;
      }

      setConfig(persisted);
      const seconds = persisted.timeLimit ? persisted.timeLimit * 60 : null;
      setTimeLeft(seconds);

      const [meta, allCards] = await Promise.all([
        libraryRepository.getLibraryMeta(libraryId),
        cardRepository.listCards(libraryId)
      ]);
      if (cancelled) return;

      setLibraryTitle(meta?.title ?? "");

      const { generateQuestions } = await loadTestQuestionGenerator();
      if (cancelled) return;

      const generated = generateQuestions(persisted, allCards);
      if (cancelled) return;

      const mapped = (generated as Array<{ id: number; type: TestQuestionKind; question: string; options?: string[]; correctAnswer: string }>).map(toTestQuestion);

      if (!mapped.length) {
        setStatus("empty");
        return;
      }

      setQuestions(mapped);
      startTimeRef.current = Date.now();
      setStatus("ready");
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [libraryId, reloadToken]);

  useEffect(() => {
    if (status !== "ready") return;
    if (timeLeft === null) return;

    const handle = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null) return prev;
        if (prev <= 1) {
          window.clearInterval(handle);
          if (startTimeRef.current) {
            const summary = evaluateResult(questions, answers, startTimeRef.current);
            setResult(summary);
            setStatus("completed");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(handle);
    };
  }, [answers, evaluateResult, questions, status, timeLeft]);

  const finishTest = useCallback(() => {
    if (status === "completed") return;
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
    const summary = evaluateResult(questions, answers, startTimeRef.current);
    setResult(summary);
    setStatus("completed");
  }, [answers, evaluateResult, questions, status]);

  const selectQuestionIndex = useCallback((index: number) => {
    if (index < 0 || index >= questions.length) return;
    setCurrentIndex(index);
    setShowAnswer(config?.showAnswerImmediately && answers[index] !== undefined ? true : false);
  }, [answers, config?.showAnswerImmediately, questions.length]);

  const submitAnswer = useCallback((answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: answer
    }));
    if (config?.showAnswerImmediately) {
      setShowAnswer(true);
    }
  }, [config?.showAnswerImmediately, currentIndex]);

  const updateFillAnswer = useCallback((answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: answer
    }));
  }, [currentIndex]);

  const goToNextQuestion = useCallback(() => {
    if (currentIndex >= questions.length - 1) {
      finishTest();
      return;
    }
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setShowAnswer(config?.showAnswerImmediately && answers[nextIndex] !== undefined ? true : false);
  }, [answers, config?.showAnswerImmediately, currentIndex, finishTest, questions.length]);

  const goToPreviousQuestion = useCallback(() => {
    if (currentIndex === 0) return;
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    setShowAnswer(config?.showAnswerImmediately && answers[prevIndex] !== undefined ? true : false);
  }, [answers, config?.showAnswerImmediately, currentIndex]);

  const revealAnswer = useCallback(() => {
    setShowAnswer(true);
  }, []);

  const restart = useCallback(() => {
    reloadSession();
  }, [reloadSession]);

  const goToSetup = useCallback(() => {
    if (libraryId) navigate(getTestSetupPath(libraryId));
  }, [libraryId, navigate]);

  const goToLibrary = useCallback(() => {
    if (libraryId) navigate(getLibraryDetailPath(libraryId));
  }, [libraryId, navigate]);

  useEffect(() => {
    if (status === "missing-config" && libraryId) {
      navigate(getTestSetupPath(libraryId), { replace: true });
    }
  }, [libraryId, navigate, status]);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex] ?? "";
  const isCurrentAnswered = currentAnswer !== "" && currentAnswer !== undefined;

  const answeredCount = useMemo(() =>
    questions.reduce((acc, _question, index) => {
      const answer = answers[index];
      if (answer !== undefined && answer !== "") return acc + 1;
      return acc;
    }, 0),
    [answers, questions]
  );

  const totalQuestions = questions.length;

  const progressPercent = useMemo(() => {
    if (!totalQuestions) return 0;
    return (answeredCount / totalQuestions) * 100;
  }, [answeredCount, totalQuestions]);

  const navigationItems = useMemo(() =>
    questions.map((_question, index) => {
      const answer = answers[index];
      const isAnswered = answer !== undefined && answer !== "";
      return {
        index,
        id: _question.id,
        isCurrent: index === currentIndex,
        isAnswered
      };
    }),
    [answers, currentIndex, questions]
  );

  const canGoPrevious = currentIndex > 0;
  const isLastQuestion = totalQuestions > 0 && currentIndex === totalQuestions - 1;
  const canGoNext = !isLastQuestion;
  const isReady = status === "ready";
  const isCompleted = status === "completed" && !!result;

  const timeDisplay = timeLeft !== null ? formatSeconds(Math.max(timeLeft, 0)) : null;
  const isTimeCritical = timeLeft !== null && timeLeft <= timeWarningThreshold && status === "ready";

  return {
    status,
    libraryTitle,
    config,
    currentQuestion,
    questions,
    currentIndex,
    totalQuestions,
    currentAnswer,
    answers,
    isCurrentAnswered,
    answeredCount,
    progressPercent,
    showAnswer,
    result,
    time: {
      value: timeLeft,
      display: timeDisplay,
      isCritical: isTimeCritical
    },
    navigation: {
      items: navigationItems,
      canGoPrevious,
      canGoNext,
      isLastQuestion
    },
    flags: {
      isReady,
      isCompleted
    },
    actions: {
      selectQuestionIndex,
      submitAnswer,
      updateFillAnswer,
      goToNextQuestion,
      goToPreviousQuestion,
      revealAnswer,
      finishTest,
      restart,
      goToSetup,
      goToLibrary
    }
  };
}
