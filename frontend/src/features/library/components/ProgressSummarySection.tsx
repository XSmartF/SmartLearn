import { Progress } from "@/shared/components/ui/progress"

interface ProgressSummarySectionProps {
  total: number;
  masteredVal: number;
  learningVal: number;
  masteredPct: number;
  learningPct: number;
  due: number | undefined;
}

export function ProgressSummarySection({
  total,
  masteredVal,
  learningVal,
  masteredPct,
  learningPct,
  due
}: ProgressSummarySectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-3 border rounded-md">
          <div className="text-xs text-muted-foreground">Tổng</div>
          <div className="text-xl font-semibold">{total}</div>
        </div>
        <div className="p-3 border rounded-md">
          <div className="text-xs text-muted-foreground">Đã thuộc</div>
          <div className="text-xl font-semibold">{masteredVal}</div>
        </div>
        <div className="p-3 border rounded-md">
          <div className="text-xs text-muted-foreground">Đang học</div>
          <div className="text-xl font-semibold">{learningVal}</div>
        </div>
        <div className="p-3 border rounded-md">
          <div className="text-xs text-muted-foreground">Còn hạn (Due)</div>
          <div className="text-xl font-semibold">{due ?? 0}</div>
        </div>
      </div>
      <div>
        <Progress value={masteredPct} />
        <div className="flex justify-between text-xs mt-1 text-muted-foreground">
          <span>{masteredPct}% đã thuộc</span>
          <span>{learningPct}% đang học</span>
        </div>
      </div>
    </div>
  );
}
