import type { LucideIcon } from "lucide-react";

export type TestQuestionKind = "multiple-choice" | "true-false" | "fill-blank";

export interface TestConfig {
  libraryId: string;
  questionTypes: TestQuestionKind[];
  questionCount: number;
  timeLimit: number | null; // minutes
  showAnswerImmediately: boolean;
  selectedCardIds: string[] | null;
}

export interface TestQuestion {
  id: string;
  type: TestQuestionKind;
  prompt: string;
  options?: string[];
  correctAnswer: string;
}

export interface TestQuestionState extends TestQuestion {
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface TestResultSummary {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  timeSpentSeconds: number;
  questions: TestQuestionState[];
}

export type TestSessionStatus =
  | "loading"
  | "missing-config"
  | "generating"
  | "ready"
  | "empty"
  | "completed";

export interface QuestionTypeOption {
  id: TestQuestionKind;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface SummaryMetricConfig<TContext = unknown> {
  id: string;
  label: string;
  icon: LucideIcon;
  extract: (context: TContext) => { value: string; tone?: "default" | "success" | "danger" | "info" };
}

export interface MinimalCard {
  id: string;
  front: string;
  back: string;
}
