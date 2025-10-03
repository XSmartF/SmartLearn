import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export interface NavigatorItem {
  index: number;
  id: string;
  isCurrent: boolean;
  isAnswered: boolean;
}

interface QuestionNavigatorProps {
  items: NavigatorItem[];
  onSelect: (index: number) => void;
}

export function QuestionNavigator({ items, onSelect }: QuestionNavigatorProps) {
  if (items.length <= 1) return null;

  return (
    <div className="flex flex-wrap gap-1 rounded-lg border bg-muted/40 p-2 sm:gap-2">
      {items.map(item => (
        <Button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.index)}
          variant={item.isAnswered ? "default" : "outline"}
          className={cn(
            "h-8 w-8 p-0 text-xs font-semibold transition",
            item.isCurrent ? "ring-2 ring-primary ring-offset-1" : ""
          )}
          aria-label={`Tới câu ${item.index + 1}${item.isAnswered ? " (đã trả lời)" : ""}`}
        >
          {item.index + 1}
        </Button>
      ))}
    </div>
  );
}
