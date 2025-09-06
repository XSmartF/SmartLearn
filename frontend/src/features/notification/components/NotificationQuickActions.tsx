import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { BellRing, Calendar, BookOpen, MessageSquare } from "lucide-react"

export function NotificationQuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Cài đặt thông báo nhanh</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <BellRing className="h-6 w-6" />
            <span className="text-sm">Thông báo email</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <Calendar className="h-6 w-6" />
            <span className="text-sm">Nhắc nhở ôn tập</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <BookOpen className="h-6 w-6" />
            <span className="text-sm">Cập nhật flashcard</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <MessageSquare className="h-6 w-6" />
            <span className="text-sm">Chia sẻ bộ thẻ</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
