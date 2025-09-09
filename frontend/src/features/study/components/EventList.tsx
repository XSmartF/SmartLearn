import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { H4 } from '@/shared/components/ui/typography';
import {
  Calendar as CalendarIcon,
  Clock,
  MoreVertical,
  Check
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import type { StudyEvent } from '../types/calendar';
import {
  getEventIcon,
  getEventColor,
  formatShortDate,
  formatTime,
  getStatusColor,
  getStatusText,
  updateEventStatus
} from '../utils/calendarUtils';

interface EventListProps {
  events: StudyEvent[];
  onView?: (event: StudyEvent) => void;
  onDelete?: (eventId: string) => void;
  onStatusUpdate?: (eventId: string, status: StudyEvent['status']) => void;
}

export function EventList({ events, onView, onDelete, onStatusUpdate }: EventListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sự kiện sắp tới</CardTitle>
        <CardDescription>
          5 hoạt động gần nhất
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <CalendarIcon className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-sm sm:text-base">Không có sự kiện nào sắp tới</p>
          </div>
        ) : (
          events.map((event) => (
            <Card key={event.id} className={`border-l-4 ${getEventColor(event.type)}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <H4 className="text-sm font-semibold truncate">{event.title}</H4>
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
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {formatShortDate(event.startTime)}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(event.startTime)} - {formatTime(event.endTime)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          🎯 {event.cardCount > 0 ? `${event.cardCount} thẻ` : 'Tạo mới'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {updateEventStatus(event) !== 'completed' && (
                        <DropdownMenuItem onClick={() => onStatusUpdate?.(event.id, 'completed')}>
                          <Check className="h-4 w-4 mr-2" />
                          Đánh dấu hoàn thành
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onView?.(event)}>
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDelete?.(event.id)}
                      >
                        Xóa sự kiện
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}
