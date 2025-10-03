import type { MinimalCard } from "@/features/test/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

interface CardScopeSelectorProps {
  cards: MinimalCard[];
  selectedIds: Set<string>;
  search: string;
  poolSize: number;
  isOpen: boolean;
  onSearchChange: (value: string) => void;
  onToggleOpen: () => void;
  onToggleCard: (id: string) => void;
  onToggleAll: () => void;
  disabled?: boolean;
}

export function CardScopeSelector({
  cards,
  selectedIds,
  search,
  poolSize,
  isOpen,
  onSearchChange,
  onToggleOpen,
  onToggleCard,
  onToggleAll,
  disabled
}: CardScopeSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Phạm vi thuật ngữ (tùy chọn)</span>
          <Badge variant="outline" className="rounded-full text-xs font-medium">
            {selectedIds.size ? `${selectedIds.size}/${poolSize}` : `${poolSize}`} thuật ngữ
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Giới hạn bài kiểm tra bằng cách chọn thẻ cụ thể. Nếu không chọn, toàn bộ thư viện sẽ được sử dụng.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Tìm kiếm mặt trước..."
            value={search}
            onChange={event => onSearchChange(event.target.value)}
            disabled={disabled}
            className="w-64"
          />
          <Button type="button" variant="outline" size="sm" onClick={onToggleOpen} disabled={disabled || cards.length === 0}>
            {isOpen ? "Ẩn danh sách" : "Chọn thuật ngữ"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onToggleAll} disabled={disabled || cards.length === 0}>
            {selectedIds.size ? "Bỏ chọn tất cả" : "Chọn tất cả"}
          </Button>
        </div>
        {isOpen ? (
          <ScrollArea className="h-64 w-full rounded-md border">
            <div className="divide-y">
              {cards.length ? (
                cards.map(card => {
                  const isSelected = selectedIds.has(card.id);
                  return (
                    <button
                      key={card.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => onToggleCard(card.id)}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition",
                        isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                      )}
                    >
                      <span className="truncate pr-4">{card.front}</span>
                      {isSelected ? <span className="text-xs font-medium">Đã chọn</span> : null}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-6 text-sm text-muted-foreground">Không tìm thấy thẻ phù hợp.</div>
              )}
            </div>
          </ScrollArea>
        ) : null}
      </CardContent>
    </Card>
  );
}
