import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { getTestSetupPath, getLibraryDetailPath } from "@/shared/constants/routes";
import { Target } from "lucide-react";
import { Link } from "react-router-dom";

interface SessionEmptyStateProps {
  libraryId: string;
  reason?: string;
}

export function SessionEmptyState({ libraryId, reason }: SessionEmptyStateProps) {
  return (
    <Card className="mx-auto max-w-xl">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <Target className="h-12 w-12 text-muted-foreground" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Không thể tạo bài kiểm tra</h2>
          <p className="text-sm text-muted-foreground">
            {reason || "Thư viện chưa có đủ dữ liệu để tạo câu hỏi. Hãy bổ sung thẻ và thử lại."}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to={getTestSetupPath(libraryId)}>
            <Button type="button">Quay lại cài đặt</Button>
          </Link>
          <Link to={getLibraryDetailPath(libraryId)}>
            <Button type="button" variant="outline">
              Xem thư viện
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
