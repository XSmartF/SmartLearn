import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { H4 } from '@/shared/components/ui/typography';
import type { StudyEvent } from '../types/calendar';
import {
  getEventIcon,
  getEventColor,
  formatDate,
  formatTime,
  getStatusColor,
  getStatusText,
  updateEventStatus
} from '../utils/calendarUtils';

interface TodayEventsProps {
  events: StudyEvent[];
  onView?: (event: StudyEvent) => void;
  onDelete?: (eventId: string) => void;
  onStatusUpdate?: (eventId: string, status: StudyEvent['status']) => void;
}

export function TodayEvents({ events, onView, onDelete, onStatusUpdate }: TodayEventsProps) {
  if (events.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch trình hôm nay</CardTitle>
        <CardDescription>
          {formatDate(new Date())}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className={`p-4 rounded-lg border-l-4 ${getEventColor(event.type)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getEventIcon(event.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <H4 className="font-semibold">{event.title}</H4>
                      <Badge variant="secondary" className="text-xs">
                        {event.type === 'review' && 'Ôn tập'}
                        {event.type === 'study' && 'Học mới'}
                        {event.type === 'deadline' && 'Deadline'}
                        {event.type === 'challenge' && 'Thử thách'}
                        {event.type === 'favorite_review' && 'Yêu thích'}
                        {event.type === 'create' && 'Tạo mới'}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(updateEventStatus(event))}`}>
                        {getStatusText(updateEventStatus(event))}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{event.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                      <span>🎯 {event.cardCount > 0 ? `${event.cardCount} thẻ` : 'Tạo mới'}</span>
                      <Badge variant="outline" className="text-xs">{event.flashcardSet}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {updateEventStatus(event) !== 'completed' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onStatusUpdate?.(event.id, 'completed')}
                    >
                      Hoàn thành
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => onView?.(event)}>
                    Xem chi tiết
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDelete?.(event.id)}>
                    Xóa
                  </Button>
                  <Button size="sm">
                    Tham gia
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
