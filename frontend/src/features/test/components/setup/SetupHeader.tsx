import { Button } from "@/shared/components/ui/button";
import { PageHeader } from "@/shared/components/PageHeader";
import { Loader } from "@/shared/components/ui/loader";
import { getLibraryDetailPath } from "@/shared/constants/routes";
import type { SetupStatus } from "@/features/test/hooks/useTestSetupView";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface SetupHeaderProps {
  status: SetupStatus;
  libraryId: string | null;
  libraryTitle: string;
  cardCount: number;
}

export function SetupHeader({ status, libraryId, libraryTitle, cardCount }: SetupHeaderProps) {
  const subtitle = (() => {
    if (status === "loading") {
      return (
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader size="sm" />
          Đang tải thông tin thư viện...
        </span>
      );
    }

    if (!libraryTitle) {
      return <span className="text-sm text-muted-foreground">Không thể tìm thấy thư viện.</span>;
    }

    return (
      <span className="text-sm text-muted-foreground">
        {libraryTitle}
        {cardCount ? ` • ${cardCount} thuật ngữ` : null}
      </span>
    );
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        {libraryId ? (
          <Link to={getLibraryDetailPath(libraryId)} className="shrink-0">
            <Button variant="ghost" size="icon" aria-label="Quay lại thư viện">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        ) : null}
        <PageHeader
          title="Cài đặt kiểm tra"
          description={subtitle}
          align="left"
        />
      </div>
    </div>
  );
}
