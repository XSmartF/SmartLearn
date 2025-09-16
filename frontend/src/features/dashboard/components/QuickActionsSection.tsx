import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { BookOpen, Users, Star, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StudyStatsDialog } from "./StudyStatsDialog";
import { ROUTES } from "@/shared/constants/routes";

export function QuickActionsSection() {
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleCreateFlashcard = () => {
    // Navigate to library creation or flashcard creation
    navigate(ROUTES.MY_LIBRARY);
  };

  const handleBrowseLibrary = () => {
    navigate(ROUTES.MY_LIBRARY);
  };

  const handleShareLibrary = () => {
    // This could open a share dialog or navigate to sharing page
    navigate(ROUTES.MY_LIBRARY);
  };

  const handleViewStats = () => {
    setStatsDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Hành động nhanh</CardTitle>
          <CardDescription className="text-sm">
            Các tính năng thường được sử dụng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto p-3 sm:p-4 flex flex-col items-center space-y-1 sm:space-y-2"
              onClick={handleCreateFlashcard}
            >
              <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm text-center">Tạo flashcard mới</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-3 sm:p-4 flex flex-col items-center space-y-1 sm:space-y-2"
              onClick={handleBrowseLibrary}
            >
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm text-center">Duyệt thư viện</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-3 sm:p-4 flex flex-col items-center space-y-1 sm:space-y-2"
              onClick={handleShareLibrary}
            >
              <Users className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm text-center">Chia sẻ bộ thẻ</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-3 sm:p-4 flex flex-col items-center space-y-1 sm:space-y-2"
              onClick={handleViewStats}
            >
              <Star className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm text-center">Thống kê học tập</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <StudyStatsDialog
        open={statsDialogOpen}
        onOpenChange={setStatsDialogOpen}
      />
    </>
  );
}
