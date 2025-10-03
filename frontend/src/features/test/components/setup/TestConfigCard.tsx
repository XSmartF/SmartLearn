import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";

interface TestConfigCardProps {
  questionCountInput: string;
  maxQuestions: number;
  hasTimeLimit: boolean;
  timeLimit: number;
  showAnswerImmediately: boolean;
  onQuestionCountChange: (value: string) => void;
  onQuestionCountBlur: () => void;
  onToggleTimeLimit: () => void;
  onTimeLimitChange: (value: number) => void;
  onToggleShowAnswer: () => void;
  disabled?: boolean;
}

export function TestConfigCard({
  questionCountInput,
  maxQuestions,
  hasTimeLimit,
  timeLimit,
  showAnswerImmediately,
  onQuestionCountChange,
  onQuestionCountBlur,
  onToggleTimeLimit,
  onTimeLimitChange,
  onToggleShowAnswer,
  disabled
}: TestConfigCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Cấu hình kiểm tra</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="test-question-count">Số câu hỏi</Label>
          <Input
            id="test-question-count"
            type="number"
            min={1}
            max={Math.max(maxQuestions, 1)}
            inputMode="numeric"
            pattern="[0-9]*"
            value={questionCountInput}
            disabled={disabled}
            onChange={event => onQuestionCountChange(event.target.value)}
            onBlur={onQuestionCountBlur}
          />
          <p className="text-xs text-muted-foreground">Tối đa {maxQuestions || 0} câu hỏi dựa trên phạm vi đã chọn.</p>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Giới hạn thời gian</Label>
            <Button type="button" variant={hasTimeLimit ? "default" : "outline"} size="sm" disabled={disabled} onClick={onToggleTimeLimit}>
              {hasTimeLimit ? "Bật" : "Vô hạn"}
            </Button>
          </div>
          {hasTimeLimit ? (
            <div className="space-y-2">
              <Label htmlFor="test-time-limit">Thời gian (phút)</Label>
              <Input
                id="test-time-limit"
                type="number"
                min={1}
                max={180}
                inputMode="numeric"
                pattern="[0-9]*"
                value={timeLimit}
                disabled={disabled}
                onChange={event => onTimeLimitChange(Number.parseInt(event.target.value, 10) || timeLimit)}
              />
              <p className="text-xs text-muted-foreground">Phát chuông cảnh báo khi gần hết giờ.</p>
            </div>
          ) : null}
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <Label>Hiển thị đáp án ngay sau khi trả lời</Label>
            <p className="text-xs text-muted-foreground">Giúp học nhanh bằng cách xem kết quả từng câu.</p>
          </div>
          <Button type="button" variant={showAnswerImmediately ? "default" : "outline"} size="sm" disabled={disabled} onClick={onToggleShowAnswer}>
            {showAnswerImmediately ? "Bật" : "Tắt"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
