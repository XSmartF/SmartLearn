import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ChevronLeft, ChevronRight, Eye, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import type { StudyEvent } from '../types/calendar';
import { generateCalendarDays, getEventIcon, getEventColor } from '../utils/calendarUtils';
import { cn } from "@/shared/lib/utils";

const eventDotColorMap: Record<string, string> = {
  review: 'bg-chart-1/80',
  study: 'bg-chart-2/80',
  deadline: 'bg-destructive/80',
  challenge: 'bg-chart-3/80',
  favorite_review: 'bg-chart-4/80',
  create: 'bg-chart-5/80'
};

const getEventDotColor = (type: string) => eventDotColorMap[type] ?? 'bg-primary/80';

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: Date | null;
  events: StudyEvent[];
  onDateChange: (date: Date) => void;
  onCurrentDateChange: (date: Date) => void;
  onViewEvent?: (event: StudyEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export function CalendarGrid({
  currentDate,
  selectedDate,
  events,
  onDateChange,
  onCurrentDateChange,
  onViewEvent,
  onDeleteEvent
}: CalendarGridProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<StudyEvent | null>(null);

  const handleDeleteClick = (event: StudyEvent) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (eventToDelete && onDeleteEvent) {
      await onDeleteEvent(eventToDelete.id);
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  // Helper function to get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event =>
      event.startTime.toDateString() === date.toDateString()
    );
  };

  return (
    <>
      <TooltipProvider>
        <Card className="w-full">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base sm:text-lg text-foreground dark:text-foreground">
                {currentDate.toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long'
                })}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCurrentDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCurrentDateChange(new Date())}
                  className="text-xs sm:text-sm"
                >
                  Hôm nay
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCurrentDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays(currentDate).map((date, index) => {
                const dayEvents = date ? getEventsForDate(date) : [];
                const hasEvents = dayEvents.length > 0;

                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "flex flex-col items-center gap-1 p-2 text-center text-[11px] sm:text-xs cursor-pointer rounded-md transition-colors min-h-[64px] sm:min-h-[52px] overflow-hidden",
                          date ? "hover:bg-muted" : "pointer-events-none opacity-50",
                          date && date.toDateString() === new Date().toDateString() && "ring-2 ring-primary bg-background text-foreground font-bold",
                          date && selectedDate && date.toDateString() === selectedDate.toDateString() && "bg-accent text-accent-foreground"
                        )}
                        onClick={() => date && onDateChange(date)}
                      >
                        {date && (
                          <div className="relative h-full w-full">
                            <span className="block text-foreground dark:text-foreground sm:text-xs">{date.getDate()}</span>
                            {hasEvents && (
                              <>
                                <div className="mt-1 hidden space-y-1 sm:block">
                                  {dayEvents.slice(0, 2).map((event) => (
                                    <div
                                      key={event.id}
                                      className={cn(
                                        "w-full overflow-hidden whitespace-nowrap text-ellipsis text-[10px] leading-tight px-1 py-0.5 rounded",
                                        getEventColor(event.type)
                                      )}
                                      title={event.title}
                                    >
                                      {event.title}
                                    </div>
                                  ))}
                                  {dayEvents.length > 2 && (
                                    <div className="w-full text-[10px] text-muted-foreground dark:text-muted-foreground whitespace-nowrap">
                                      +{dayEvents.length - 2} nữa
                                    </div>
                                  )}
                                </div>
                                <div className="mt-1 flex items-center justify-center gap-1 sm:hidden">
                                  {dayEvents.slice(0, 3).map((event) => (
                                    <span
                                      key={event.id}
                                      className={cn(
                                        "h-1.5 w-3 rounded-full",
                                        getEventDotColor(event.type)
                                      )}
                                    />
                                  ))}
                                  {dayEvents.length > 3 && (
                                    <span className="text-[10px] text-muted-foreground">
                                      +{dayEvents.length - 3}
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    {hasEvents && (
                      <TooltipContent side="top" className="max-w-xs bg-popover border border-border shadow-lg rounded-lg p-3 text-popover-foreground">
                        <div className="space-y-2">
                          <div className="font-semibold text-popover-foreground">
                            {date?.toLocaleDateString('vi-VN', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.map((event) => (
                              <div key={event.id} className="flex items-start justify-between gap-2 p-2 bg-muted rounded border border-border">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1 mb-1">
                                    {getEventIcon(event.type)}
                                    <span className="font-medium text-sm truncate text-foreground">{event.title}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {event.startTime.toLocaleTimeString('vi-VN', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 hover:bg-accent hover:text-accent-foreground"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onViewEvent?.(event);
                                    }}
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(event);
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa sự kiện"
        description={`Bạn có chắc chắn muốn xóa sự kiện "${eventToDelete?.title}" không? Hành động này không thể hoàn tác.`}
        onConfirm={handleDeleteConfirm}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
      >
        <div />
      </ConfirmDialog>
    </>
  );
}
