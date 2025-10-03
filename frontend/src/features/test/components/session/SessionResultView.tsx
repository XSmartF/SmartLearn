import type { TestResultSummary } from "@/features/test/types";
import { RESULT_SUMMARY_CARDS } from "@/features/test/constants";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

interface SessionResultViewProps {
  result: TestResultSummary;
  libraryTitle: string;
  onRetry: () => void;
  onBackToLibrary: () => void;
}

const toneToClass: Record<string, string> = {
  success: "text-emerald-500",
  danger: "text-destructive",
  info: "text-primary",
  default: "text-muted-foreground"
};

export function SessionResultView({ result, libraryTitle, onRetry, onBackToLibrary }: SessionResultViewProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-foreground">Kết quả kiểm tra</h1>
        <p className="text-sm text-muted-foreground">{libraryTitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {RESULT_SUMMARY_CARDS.map(metric => {
          const Icon = metric.icon;
          const { value, tone = "default" } = metric.extract(result);
          return (
            <Card key={metric.id} className="text-center">
              <CardContent className="flex flex-col items-center gap-2 py-6">
                <span className={`rounded-full bg-muted p-3 ${toneToClass[tone] || toneToClass.default}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <div className="text-3xl font-semibold text-foreground">{value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết từng câu hỏi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.questions.map((question, index) => {
            const Icon = question.isCorrect ? CheckCircle2 : XCircle;
            return (
              <div key={question.id || index} className="rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 ${question.isCorrect ? "text-emerald-500" : "text-destructive"}`} />
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-foreground">
                      Câu {index + 1}: {question.prompt}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>Đáp án của bạn:</span>
                      <Badge variant={question.isCorrect ? "default" : "destructive"}>
                        {question.userAnswer || "Chưa trả lời"}
                      </Badge>
                      {!question.isCorrect ? (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span>Đáp án đúng:</span>
                          <Badge variant="outline">{question.correctAnswer}</Badge>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={onRetry}>
          Làm lại bài kiểm tra
        </Button>
        <Button type="button" variant="outline" onClick={onBackToLibrary}>
          Quay về thư viện
        </Button>
      </div>
    </div>
  );
}
