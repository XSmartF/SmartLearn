import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { H4 } from '@/shared/components/ui/typography';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Calendar, Target } from "lucide-react";
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
import { cn } from '@/shared/lib/utils';

interface TaskStatusCardsProps {
  events: StudyEvent[];
  onView?: (event: StudyEvent) => void;
  onDelete?: (eventId: string) => void;
  onStatusUpdate?: (eventId: string, status: StudyEvent['status']) => void;
  onEdit?: (event: StudyEvent) => void;
}

export function TaskStatusCards({ events, onView, onDelete, onStatusUpdate, onEdit }: TaskStatusCardsProps) {
  // Phân loại events theo trạng thái
  const completedEvents = events.filter(event => updateEventStatus(event) === 'completed');
  const overdueEvents = events.filter(event => updateEventStatus(event) === 'overdue');
  const upcomingEvents = events.filter(event => updateEventStatus(event) === 'upcoming');

  const renderEventList = (eventList: StudyEvent[], title: string) => (
    <div className="space-y-3 sm:space-y-4">
      {eventList.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Không có {title.toLowerCase()}</p>
        </div>
      ) : (
        eventList.map((event) => {
          const status = updateEventStatus(event);
          return (
            <div
              key={event.id}
              className={cn(
                "rounded-xl border border-border/40 bg-background/70 p-3 shadow-sm backdrop-blur-sm sm:p-4",
                "border-l-4",
                getEventColor(event.type)
              )}
            >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4 lg:flex-1">
                <div className="flex-shrink-0">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <H4 className="font-semibold text-sm sm:text-base leading-tight">{event.title}</H4>
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">
                      {event.type === 'review' && 'Ôn tập'}
                      {event.type === 'study' && 'Học mới'}
                      {event.type === 'deadline' && 'Deadline'}
                      {event.type === 'challenge' && 'Thử thách'}
                      {event.type === 'favorite_review' && 'Yêu thích'}
                      {event.type === 'create' && 'Tạo mới'}
                    </Badge>
                    <Badge
                      className={cn(
                        "text-[10px] sm:text-xs border",
                        getStatusColor(status)
                      )}
                    >
                      {getStatusText(status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{event.description}</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(event.startTime)}</span>
                    <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                    <span className="flex items-center gap-1"><Target className="h-3 w-3" /> {event.cardCount > 0 ? `${event.cardCount} thẻ` : 'Tạo mới'}</span>
                    <Badge variant="outline" className="text-[10px] sm:text-xs font-medium">{event.flashcardSet}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                {status !== 'completed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusUpdate?.(event.id, 'completed')}
                    className="h-8 px-3 text-xs"
                  >
                    Hoàn thành
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => onEdit?.(event)} className="h-8 px-3 text-xs">
                  Chỉnh sửa
                </Button>
                <Button size="sm" variant="outline" onClick={() => onView?.(event)} className="h-8 px-3 text-xs">
                  Xem chi tiết
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete?.(event.id)} className="h-8 px-3 text-xs text-destructive border-destructive/40">
                  Xóa
                </Button>
              </div>
            </div>
          </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <Tabs defaultValue="all" className="w-full space-y-5">
        <TabsList className="flex w-full overflow-x-auto rounded-full bg-muted/40 p-1 gap-2">
          <TabsTrigger
            value="all"
            className="flex-1 min-w-[132px] flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold sm:text-sm data-[state=active]:scale-100"
          >
            Tất cả ({events.length})
          </TabsTrigger>
          <TabsTrigger
            value="upcoming"
            className="flex-1 min-w-[132px] flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold sm:text-sm data-[state=active]:scale-100"
          >
            Sắp tới ({upcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger
            value="overdue"
            className="flex-1 min-w-[132px] flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold sm:text-sm data-[state=active]:scale-100"
          >
            Quá hạn ({overdueEvents.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="flex-1 min-w-[132px] flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold sm:text-sm data-[state=active]:scale-100"
          >
            Hoàn thành ({completedEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {renderEventList(events, "nhiệm vụ")}
        </TabsContent>

        <TabsContent value="upcoming">
          {renderEventList(upcomingEvents, "nhiệm vụ sắp tới")}
        </TabsContent>

        <TabsContent value="overdue">
          {renderEventList(overdueEvents, "nhiệm vụ quá hạn")}
        </TabsContent>

        <TabsContent value="completed">
          {renderEventList(completedEvents, "nhiệm vụ hoàn thành")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
