import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Clock } from "lucide-react";
import { Link } from "react-router-dom";
import type { StudyEvent } from '../../study/types/calendar';
import { getEventIcon } from '../../study/utils/calendarUtils';

interface UpcomingEventsSectionProps {
  upcomingEvents: StudyEvent[];
}

export function UpcomingEventsSection({ upcomingEvents }: UpcomingEventsSectionProps) {
  return (
    <Card className="flex flex-col h-full min-h-0">
      <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
        <CardTitle className="text-lg">Lịch nhắc nhở</CardTitle>
        <CardDescription className="text-xs">
          Bạn có {upcomingEvents.length} hoạt động đang chờ xử lý
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 flex-1 min-h-0 flex flex-col">
        {/* Compact summary for small screens */}
        <div className="sm:hidden">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">Không có sự kiện sắp tới</div>
          ) : (
            <div className="flex items-center justify-between p-2 rounded-md bg-muted/40">
              <div className="text-sm">Có {upcomingEvents.length} sự kiện sắp tới</div>
              <div className="text-xs text-muted-foreground">Xem chi tiết</div>
            </div>
          )}
        </div>
        {/* Detailed list for md+ */}
        <div className="hidden sm:block space-y-2 flex-1 min-h-0 overflow-y-auto pr-1">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">Không có sự kiện sắp tới</div>
          ) : (
            upcomingEvents.map((event, index) => (
              <div key={event.id || index} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0 mt-0.5">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium truncate flex-1">{event.title}</p>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 flex-shrink-0">
                      {event.type === 'review' && 'Ôn tập'}
                      {event.type === 'study' && 'Học mới'}
                      {event.type === 'deadline' && 'Deadline'}
                      {event.type === 'challenge' && 'Thử thách'}
                      {event.type === 'favorite_review' && 'Yêu thích'}
                      {event.type === 'create' && 'Tạo mới'}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {event.startTime.toLocaleDateString('vi-VN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        <Button className="w-full mt-2 flex-shrink-0" variant="outline" size="sm" asChild>
          <Link to="/study/calendar">
            <Clock className="h-3 w-3 mr-2" />
            Xem lịch đầy đủ
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
