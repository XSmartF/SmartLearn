import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Clock } from "lucide-react";

interface UpcomingEvent {
  title: string;
  time: string;
  type: 'review' | 'study' | 'test';
}

interface UpcomingEventsSectionProps {
  upcomingEvents: UpcomingEvent[];
}

export function UpcomingEventsSection({ upcomingEvents }: UpcomingEventsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch nhắc nhở</CardTitle>
        <CardDescription>
          Đừng bỏ lỡ những hoạt động quan trọng
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingEvents.map((event, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {event.type === 'test' && <Badge variant="destructive">Kiểm tra</Badge>}
              {event.type === 'study' && <Badge variant="default">Học mới</Badge>}
              {event.type === 'review' && <Badge variant="secondary">Ôn tập</Badge>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs text-muted-foreground">{event.time}</p>
            </div>
          </div>
        ))}
        <Button className="w-full" variant="outline" size="sm">
          <Clock className="h-4 w-4 mr-2" />
          Xem lịch đầy đủ
        </Button>
      </CardContent>
    </Card>
  );
}
