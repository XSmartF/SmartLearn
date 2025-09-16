import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
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
    <div className="space-y-4">
      {eventList.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Không có {title.toLowerCase()}</p>
        </div>
      ) : (
        eventList.map((event) => (
          <div key={event.id} className={`p-3 sm:p-4 rounded-lg border-l-4 ${getEventColor(event.type)}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex-shrink-0">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <H4 className="font-semibold text-sm sm:text-base">{event.title}</H4>
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
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                    <span><Calendar className="h-3 w-3 inline mr-1" /> {formatDate(event.startTime)}</span>
                    <span><Target className="h-3 w-3 inline mr-1" /> {event.cardCount > 0 ? `${event.cardCount} thẻ` : 'Tạo mới'}</span>
                    <Badge variant="outline" className="text-xs">{event.flashcardSet}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {updateEventStatus(event) === 'overdue' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusUpdate?.(event.id, 'completed')}
                    className="text-xs"
                  >
                    Hoàn thành
                  </Button>
                )}
                {updateEventStatus(event) === 'upcoming' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusUpdate?.(event.id, 'completed')}
                    className="text-xs"
                  >
                    Hoàn thành
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => onEdit?.(event)} className="text-xs">
                  Chỉnh sửa
                </Button>
                <Button size="sm" variant="outline" onClick={() => onView?.(event)} className="text-xs">
                  Xem chi tiết
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete?.(event.id)} className="text-xs">
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trạng thái nhiệm vụ</CardTitle>
        <CardDescription>
          Theo dõi và quản lý các nhiệm vụ học tập của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              Tất cả ({events.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Sắp tới ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="overdue">
              Quá hạn ({overdueEvents.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Hoàn thành ({completedEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {renderEventList(events, "nhiệm vụ")}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            {renderEventList(upcomingEvents, "nhiệm vụ sắp tới")}
          </TabsContent>

          <TabsContent value="overdue" className="mt-6">
            {renderEventList(overdueEvents, "nhiệm vụ quá hạn")}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {renderEventList(completedEvents, "nhiệm vụ hoàn thành")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
