import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { BookOpen, Users, Star, Plus } from "lucide-react";

export function QuickActionsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hành động nhanh</CardTitle>
        <CardDescription>
          Các tính năng thường được sử dụng
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <Plus className="h-6 w-6" />
            <span className="text-sm">Tạo flashcard mới</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <BookOpen className="h-6 w-6" />
            <span className="text-sm">Duyệt thư viện</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <Users className="h-6 w-6" />
            <span className="text-sm">Chia sẻ bộ thẻ</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <Star className="h-6 w-6" />
            <span className="text-sm">Thống kê học tập</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
