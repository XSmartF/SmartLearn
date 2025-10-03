import { Button } from "@/shared/components/ui/button";

interface SessionActionsProps {
  canGoPrevious: boolean;
  canGoNext: boolean;
  isLastQuestion: boolean;
  hasAnswer: boolean;
  showAnswer: boolean;
  instantFeedback: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
  onReveal: () => void;
}

export function SessionActions({
  canGoPrevious,
  canGoNext,
  isLastQuestion,
  hasAnswer,
  showAnswer,
  instantFeedback,
  onPrevious,
  onNext,
  onFinish,
  onReveal
}: SessionActionsProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <Button type="button" variant="outline" disabled={!canGoPrevious} onClick={onPrevious}>
        Câu trước
      </Button>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {!instantFeedback && !showAnswer ? (
          <Button type="button" variant="secondary" disabled={!hasAnswer} onClick={onReveal}>
            Hiển thị đáp án
          </Button>
        ) : null}
        <Button
          type="button"
          disabled={!hasAnswer || (!isLastQuestion && !canGoNext)}
          onClick={isLastQuestion ? onFinish : onNext}
        >
          {isLastQuestion ? "Hoàn thành" : "Câu tiếp"}
        </Button>
        <Button type="button" variant="destructive" onClick={onFinish}>
          Nộp bài ngay
        </Button>
      </div>
    </div>
  );
}
