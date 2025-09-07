import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { BookOpen, Users, Star, Plus } from "lucide-react";

export function QuickActionsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Hành động nhanh</CardTitle>
        <CardDescription className="text-sm">
          Các tính năng thường được sử dụng
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
          <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center space-y-1 sm:space-y-2">
            <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-xs sm:text-sm text-center">Tạo flashcard mới</span>
          </Button>
          <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center space-y-1 sm:space-y-2">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-xs sm:text-sm text-center">Duyệt thư viện</span>
          </Button>
          <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center space-y-1 sm:space-y-2">
            <Users className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-xs sm:text-sm text-center">Chia sẻ bộ thẻ</span>
          </Button>
          <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center space-y-1 sm:space-y-2">
            <Star className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-xs sm:text-sm text-center">Thống kê học tập</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
