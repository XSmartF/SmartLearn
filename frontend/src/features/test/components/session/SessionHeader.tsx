import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { ArrowLeft, Clock } from "lucide-react";

interface SessionHeaderProps {
  libraryTitle: string;
  currentQuestionNumber: number;
  totalQuestions: number;
  progressPercent: number;
  answeredCount: number;
  timeDisplay: string | null;
  isTimeCritical: boolean;
  onBack: () => void;
}

export function SessionHeader({
  libraryTitle,
  currentQuestionNumber,
  totalQuestions,
  progressPercent,
  answeredCount,
  timeDisplay,
  isTimeCritical,
  onBack
}: SessionHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" onClick={onBack} aria-label="Quay lại cài đặt">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Bài kiểm tra</h1>
            <p className="text-sm text-muted-foreground">{libraryTitle || ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {timeDisplay ? (
            <div className="flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs">
              <Clock className={`h-4 w-4 ${isTimeCritical ? "text-destructive" : "text-primary"}`} />
              <span className={isTimeCritical ? "text-destructive" : "text-foreground"}>{timeDisplay}</span>
            </div>
          ) : null}
          <Badge variant="outline" className="rounded-full text-xs font-medium">
            Câu {currentQuestionNumber} / {totalQuestions}
          </Badge>
        </div>
      </div>
      <div className="space-y-1">
        <Progress value={progressPercent} className="h-2" />
        <p className="text-xs text-muted-foreground">
          Đã trả lời {answeredCount}/{totalQuestions}
        </p>
      </div>
    </div>
  );
}
