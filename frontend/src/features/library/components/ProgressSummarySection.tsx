import { StatCard } from "@/shared/components/StatCard"
import { Progress } from "@/shared/components/ui/progress"
import { cn } from "@/shared/lib/utils"

interface ProgressSummarySectionProps {
  total: number;
  masteredVal: number;
  learningVal: number;
  masteredPct: number;
  learningPct: number;
  due: number | undefined;
  className?: string;
}

export function ProgressSummarySection({
  total,
  masteredVal,
  learningVal,
  masteredPct,
  learningPct,
  due,
  className
}: ProgressSummarySectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tổng thẻ" value={total} helper="Tổng số thẻ trong thư viện" />
        <StatCard
          label="Đã thuộc"
          value={masteredVal}
          helper={
            <div className="space-y-1">
              <Progress value={masteredPct} className="h-2" />
              <span>{masteredPct}% đã thuộc</span>
            </div>
          }
        />
        <StatCard
          label="Đang học"
          value={learningVal}
          helper={
            <div className="space-y-1">
              <Progress value={learningPct} className="h-2" />
              <span>{learningPct}% đang học</span>
            </div>
          }
        />
        <StatCard
          label="Sắp đến hạn"
          value={due ?? 0}
          helper="Số thẻ cần ôn luyện trong hôm nay"
        />
      </div>
    </div>
  );
}
