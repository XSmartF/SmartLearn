import type { TestQuestion } from "@/features/test/types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { normalize } from "@/features/study/utils/learnEngine";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuestionCardProps {
  question: TestQuestion;
  index: number;
  answer: string;
  showAnswer: boolean;
  onSelectOption: (value: string) => void;
  onFillAnswer: (value: string) => void;
  isInstantFeedback: boolean;
}

const TYPE_LABELS: Record<TestQuestion["type"], string> = {
  "multiple-choice": "Trắc nghiệm",
  "true-false": "Đúng / Sai",
  "fill-blank": "Điền từ"
};

export function QuestionCard({
  question,
  index,
  answer,
  showAnswer,
  onSelectOption,
  onFillAnswer,
  isInstantFeedback
}: QuestionCardProps) {
  const renderOptions = () => {
    if (!question.options?.length) return null;
    return (
      <div className="space-y-3">
        {question.options.map(option => {
          const isSelected = normalize(answer) === normalize(option);
          return (
            <Button
              key={option}
              type="button"
              variant={isSelected ? "default" : "outline"}
              className="h-auto w-full justify-start p-4 text-left"
              onClick={() => onSelectOption(option)}
              disabled={showAnswer}
            >
              {option}
            </Button>
          );
        })}
      </div>
    );
  };

  const renderFillBlank = () => (
    <Input
      value={answer}
      onChange={event => {
        const value = event.target.value;
        onFillAnswer(value);
        if (isInstantFeedback) {
          onSelectOption(value);
        }
      }}
      disabled={showAnswer}
      placeholder="Nhập câu trả lời của bạn"
      className="h-12"
    />
  );

  const isCorrect = normalize(answer || "") === normalize(question.correctAnswer || "");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold">Câu {index + 1}</CardTitle>
            <p className="text-sm text-muted-foreground">{question.prompt}</p>
          </div>
          <Badge variant="outline" className="shrink-0 text-xs font-medium">
            {TYPE_LABELS[question.type]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {question.type === "fill-blank" ? renderFillBlank() : renderOptions()}
        {showAnswer ? (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
            <div className="mb-1 flex items-center gap-2 font-semibold">
              {isCorrect ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-destructive" />}
              {isCorrect ? "Chính xác!" : "Chưa đúng."}
            </div>
            <div className="text-muted-foreground">
              Đáp án đúng: <span className="font-medium text-foreground">{question.correctAnswer}</span>
            </div>
            {isInstantFeedback ? (
              <p className="mt-2 text-xs text-muted-foreground">Chế độ hiển thị đáp án ngay đang bật, bạn có thể chuyển sang câu tiếp theo.</p>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
