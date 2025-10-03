import {
  CheckCircle,
  AlertCircle,
  Target,
  BarChart3,
  Clock,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import type { QuestionTypeOption, SummaryMetricConfig, TestResultSummary } from "@/features/test/types";

export const QUESTION_TYPE_OPTIONS: QuestionTypeOption[] = [
  {
    id: "multiple-choice",
    label: "Trắc nghiệm",
    description: "Chọn đáp án đúng từ 4 lựa chọn",
    icon: CheckCircle
  },
  {
    id: "true-false",
    label: "Đúng / Sai",
    description: "Xác định câu trả lời đúng hay sai",
    icon: AlertCircle
  },
  {
    id: "fill-blank",
    label: "Điền từ",
    description: "Điền cụm từ còn thiếu vào chỗ trống",
    icon: Target
  }
];

const percentFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0
});

const timeFormatter = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const RESULT_SUMMARY_CARDS: SummaryMetricConfig<TestResultSummary>[] = [
  {
    id: "score",
    label: "Điểm số",
    icon: BarChart3,
    extract: ({ score }) => ({
      value: `${percentFormatter.format(score)}%`,
      tone: "info"
    })
  },
  {
    id: "correct",
    label: "Câu đúng",
    icon: ThumbsUp,
    extract: ({ correctAnswers }) => ({
      value: correctAnswers.toString(),
      tone: "success"
    })
  },
  {
    id: "incorrect",
    label: "Câu sai",
    icon: ThumbsDown,
    extract: ({ incorrectAnswers }) => ({
      value: incorrectAnswers.toString(),
      tone: "danger"
    })
  },
  {
    id: "time",
    label: "Thời gian",
    icon: Clock,
    extract: ({ timeSpentSeconds }) => ({
      value: timeFormatter(timeSpentSeconds),
      tone: "default"
    })
  }
];
