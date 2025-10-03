import type { QuestionTypeOption, TestQuestionKind } from "@/features/test/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

interface QuestionTypeSelectorProps {
  options: QuestionTypeOption[];
  selected: TestQuestionKind[];
  onToggle: (type: TestQuestionKind) => void;
  disabled?: boolean;
}

export function QuestionTypeSelector({ options, selected, onToggle, disabled }: QuestionTypeSelectorProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Dạng câu hỏi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {options.map(option => {
          const Icon = option.icon;
          const isActive = selected.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(option.id)}
              className={cn(
                "w-full rounded-xl border p-4 text-left transition-colors",
                isActive
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border/80 hover:border-primary/60"
              )}
              aria-pressed={isActive}
            >
              <div className="flex items-start gap-3">
                <span className={cn("mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg", isActive ? "bg-primary/10" : "bg-muted/60")}>
                  <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                </span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                    {option.label}
                    {isActive ? <Badge variant="outline" className="border-primary/30 bg-primary/10 text-xs text-primary">Đang chọn</Badge> : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </button>
          );
        })}
        <p className="text-xs text-muted-foreground">Nhấp để bật/tắt dạng câu hỏi. Luôn cần ít nhất 1 dạng.</p>
      </CardContent>
    </Card>
  );
}
