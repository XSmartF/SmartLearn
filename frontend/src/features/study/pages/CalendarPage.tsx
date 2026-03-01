import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { CalendarDays, Plus } from "lucide-react"
import { CalendarGrid, EventDialog, TaskStatusCards } from '../components'
import { calendarRepository } from '@/shared/services'
import ConfirmDialog from "@/shared/components/ConfirmDialog"
import type { StudyEvent, CreateStudyEventInput } from '../types/calendar'
import { updateEventStatus } from '../utils/calendarUtils'
import { PageHeader } from '@/shared/components/PageHeader'
import { PageSection } from '@/shared/components/PageSection'

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<StudyEvent[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<StudyEvent | null>(null)
  const [viewOnly, setViewOnly] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = calendarRepository.listenUserEvents((fetchedEvents) => {
      setEvents(fetchedEvents);
    });

    return unsubscribe;
  }, []);

  // Auto-update event statuses based on time (single effect, runs once after events load)
  useEffect(() => {
    if (!events.length) return;
    let cancelled = false;

    const run = async () => {
      const toUpdate = events.filter(event => {
        if (event.status === 'completed') return false;
        const newStatus = updateEventStatus(event);
        return newStatus !== event.status;
      });

      for (const event of toUpdate) {
        if (cancelled) return;
        const newStatus = updateEventStatus(event);
        try {
          await calendarRepository.updateEventStatus(event.id, newStatus);
        } catch (error) {
          console.error('Error auto-updating event status:', error);
        }
      }
    };

    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events.length]);

  // Removed monthly overview stats section

  const handleCreateEvent = async (eventData: CreateStudyEventInput) => {
    await calendarRepository.createEvent(eventData)
  }

  const handleUpdateEvent = async (eventData: CreateStudyEventInput) => {
    if (editingEvent) {
      await calendarRepository.updateEvent(editingEvent.id, eventData)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    setEventToDelete(eventId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (eventToDelete) {
      await calendarRepository.deleteEvent(eventToDelete)
      setDeleteDialogOpen(false)
      setEventToDelete(null)
    }
  }

  const handleViewEvent = (event: StudyEvent) => {
    setEditingEvent(event)
    setViewOnly(true)
    setDialogOpen(true)
  }

  const handleEditEvent = (event: StudyEvent) => {
    setEditingEvent(event);
    setViewOnly(false);
    setDialogOpen(true);
  }

  const handleAddEvent = () => {
    setEditingEvent(null)
    setViewOnly(false)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingEvent(null)
    setViewOnly(false)
  }

  const handleStatusUpdate = async (eventId: string, status: StudyEvent['status']) => {
    try {
      await calendarRepository.updateEventStatus(eventId, status);
      // Update local state
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === eventId ? { ...event, status } : event
        )
      );
    } catch (error) {
      console.error('Error updating event status:', error);
    }
  };

  const handleSaveEvent = async (eventData: CreateStudyEventInput) => {
    if (editingEvent) {
      await handleUpdateEvent(eventData)
    } else {
      await handleCreateEvent(eventData)
    }
  }

  return (
    <>
      <div className="space-y-5">
        <PageHeader
          title="Lịch học tập"
          eyebrow="Quản lý lịch học"
          description="Theo dõi tiến độ từng ngày và chủ động sắp xếp các phiên học tập phù hợp với mục tiêu của bạn."
          icon={<CalendarDays className="h-6 w-6 text-primary" />}
          actions={
            <Button onClick={handleAddEvent} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Thêm sự kiện
            </Button>
          }
        />

        {/** Monthly overview removed as requested */}

        <PageSection
          heading="Lịch sự kiện"
          description="Chạm vào một ngày để xem chi tiết hoặc chỉnh sửa sự kiện học tập."
        >
          <CalendarGrid
            currentDate={currentDate}
            selectedDate={selectedDate}
            events={events}
            onDateChange={setSelectedDate}
            onCurrentDateChange={setCurrentDate}
            onViewEvent={handleViewEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        </PageSection>

        <PageSection
          heading="Nhiệm vụ & trạng thái"
          description="Cập nhật tiến độ, đánh dấu hoàn thành hoặc điều chỉnh kế hoạch nếu cần."
        >
          <TaskStatusCards
            events={events}
            onView={handleViewEvent}
            onDelete={handleDeleteEvent}
            onStatusUpdate={handleStatusUpdate}
            onEdit={handleEditEvent}
          />
        </PageSection>
      </div>

      <EventDialog
        isOpen={dialogOpen}
        onClose={handleDialogClose}
        onSave={handleSaveEvent}
        editingEvent={editingEvent}
        viewOnly={viewOnly}
        onStatusUpdate={handleStatusUpdate}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa sự kiện"
        description="Bạn có chắc chắn muốn xóa sự kiện này không? Hành động này không thể hoàn tác."
        onConfirm={handleDeleteConfirm}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
      >
        <div />
      </ConfirmDialog>
    </>
  )
}
