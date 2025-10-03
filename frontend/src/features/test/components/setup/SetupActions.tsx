import { Button } from "@/shared/components/ui/button";
import { Loader2, Play } from "lucide-react";

interface SetupActionsProps {
  canStart: boolean;
  isBusy: boolean;
  cardPoolSize: number;
  disabledReason?: string | null;
  onStart: () => void;
  onPrefetch: () => void;
}

export function SetupActions({ canStart, isBusy, cardPoolSize, disabledReason, onStart, onPrefetch }: SetupActionsProps) {
  const isDisabled = !canStart || isBusy;
  return (
    <div className="flex flex-col items-center gap-2">
      {cardPoolSize === 0 ? (
        <p className="text-sm text-destructive">Thư viện chưa có thuật ngữ nào — hãy thêm thẻ trước khi tạo bài kiểm tra.</p>
      ) : null}
      {disabledReason && cardPoolSize > 0 ? (
        <p className="text-xs text-muted-foreground">{disabledReason}</p>
      ) : null}
      <Button
        type="button"
        size="lg"
        className="min-w-[220px]"
        disabled={isDisabled}
        onClick={onStart}
        onMouseEnter={onPrefetch}
        onFocus={onPrefetch}
      >
  {isBusy ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5" />}
        Bắt đầu kiểm tra
      </Button>
    </div>
  );
}
