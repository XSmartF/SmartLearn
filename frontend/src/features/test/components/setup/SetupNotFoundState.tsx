import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { getLibraryDetailPath, ROUTES } from "@/shared/constants/routes";
import { Loader } from "@/shared/components/ui/loader";
import { AlertCircle, Target } from "lucide-react";
import { Link } from "react-router-dom";

interface SetupNotFoundStateProps {
  libraryId: string | null;
  isLoading: boolean;
}

export function SetupNotFoundState({ libraryId, isLoading }: SetupNotFoundStateProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
        <Loader size="lg" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <Target className="h-12 w-12 text-muted-foreground" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Không tìm thấy thư viện</h2>
          <p className="text-sm text-muted-foreground">
            {libraryId ? `Không thể tìm thấy thư viện với mã ${libraryId}.` : "Thiếu thông tin thư viện để khởi tạo bài kiểm tra."}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link to={ROUTES.MY_LIBRARY}>
            <Button variant="outline">Quay về danh sách thư viện</Button>
          </Link>
          {libraryId ? (
            <Link to={getLibraryDetailPath(libraryId)}>
              <Button variant="ghost" className="gap-2">
                <AlertCircle className="h-4 w-4" />
                Xem chi tiết thư viện
              </Button>
            </Link>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
