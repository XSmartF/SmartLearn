import { Loader } from "@/shared/components/ui/loader";
import { Sparkles } from "lucide-react";

export function SessionLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center text-muted-foreground">
  <Sparkles className="h-12 w-12 animate-spin" />
      <div className="space-y-1">
        <p className="text-base font-medium text-foreground">Đang chuẩn bị câu hỏi...</p>
        <p className="text-sm">Chúng mình đang tạo đề phù hợp với cấu hình của bạn.</p>
      </div>
      <Loader size="lg" />
    </div>
  );
}
