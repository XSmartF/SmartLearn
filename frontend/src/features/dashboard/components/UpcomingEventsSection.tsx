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
    <Card className="col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-1">
      <CardHeader>
        <CardTitle>Lịch nhắc nhở</CardTitle>
        <CardDescription>
          Đừng bỏ lỡ những hoạt động quan trọng
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingEvents.map((event, index) => (
          <div key={event.id || index} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getEventIcon(event.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-sm font-medium">{event.title}</p>
                <Badge variant="secondary" className="text-xs">
                  {event.type === 'review' && 'Ôn tập'}
                  {event.type === 'study' && 'Học mới'}
                  {event.type === 'deadline' && 'Deadline'}
                  {event.type === 'challenge' && 'Thử thách'}
                  {event.type === 'favorite_review' && 'Yêu thích'}
                  {event.type === 'create' && 'Tạo mới'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {event.startTime.toLocaleDateString('vi-VN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
        <Button className="w-full" variant="outline" size="sm" asChild>
          <Link to="/study/calendar">
            <Clock className="h-4 w-4 mr-2" />
            Xem lịch đầy đủ
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
