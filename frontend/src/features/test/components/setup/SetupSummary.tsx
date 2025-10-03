import type { QuestionTypeOption, TestQuestionKind } from "@/features/test/types";
import { StatCard } from "@/shared/components/StatCard";
import { Clock, Layers, ListChecks, PlayCircle } from "lucide-react";

interface SetupSummaryProps {
  questionCount: number;
  questionTypes: TestQuestionKind[];
  questionTypeOptions: QuestionTypeOption[];
  hasTimeLimit: boolean;
  timeLimit: number;
  showAnswerImmediately: boolean;
  cardPoolSize: number;
}

export function SetupSummary({
  questionCount,
  questionTypes,
  questionTypeOptions,
  hasTimeLimit,
  timeLimit,
  showAnswerImmediately,
  cardPoolSize
}: SetupSummaryProps) {
  const questionLabels = questionTypes
    .map(type => questionTypeOptions.find(option => option.id === type)?.label)
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<ListChecks className="h-5 w-5 text-primary" />}
        label="Số câu hỏi"
        value={questionCount}
        helper="Điều chỉnh để phù hợp mục tiêu học tập"
      />
      <StatCard
        icon={<Layers className="h-5 w-5 text-primary" />}
        label="Dạng câu hỏi"
        value={questionLabels || "--"}
        helper="Có thể bật cùng lúc nhiều dạng"
      />
      <StatCard
        icon={<Clock className="h-5 w-5 text-primary" />}
        label="Giới hạn thời gian"
        value={hasTimeLimit ? `${timeLimit} phút` : "Vô hạn"}
        helper={hasTimeLimit ? "Hết giờ hệ thống sẽ tự nộp bài" : "Thư giãn, không bị áp lực thời gian"}
      />
      <StatCard
        icon={<PlayCircle className="h-5 w-5 text-primary" />}
        label="Phạm vi câu hỏi"
        value={`${cardPoolSize} thuật ngữ`}
        helper={showAnswerImmediately ? "Chế độ xem đáp án ngay đã bật" : "Xem đáp án ở cuối bài"}
      />
    </div>
  );
}
