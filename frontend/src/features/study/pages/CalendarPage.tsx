import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { CalendarDays, Plus } from "lucide-react"
import { Stats, CalendarGrid, EventDialog, TaskStatusCards } from '../components'
import { listenUserStudyEvents, createStudyEvent, updateStudyEvent, deleteStudyEvent, updateStudyEventStatus } from '@/shared/lib/firebaseCalendarService'
import ConfirmDialog from "@/shared/components/ConfirmDialog"
import type { StudyEvent, CreateStudyEventInput } from '../types/calendar'
import {
  calculateStats,
  updateEventStatus
} from '../utils/calendarUtils'
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
    const unsubscribe = listenUserStudyEvents((fetchedEvents) => {
      setEvents(fetchedEvents);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const updateStatuses = async () => {
      const now = new Date();
      const eventsToUpdate = events.filter(event => {
        const currentStatus = event.status;
        const calculatedStatus = event.endTime < now ? 'overdue' : 'upcoming';
        return currentStatus !== calculatedStatus && currentStatus !== 'completed';
      });

      for (const event of eventsToUpdate) {
        const newStatus = event.endTime < now ? 'overdue' : 'upcoming';
        try {
          await updateStudyEventStatus(event.id, newStatus);
        } catch (error) {
          console.error('Error updating event status:', error);
        }
      }
    };

    if (events.length > 0) {
      updateStatuses();
    }
  }, [events]);

  // Auto-update event statuses based on time
  useEffect(() => {
    const updateStatuses = async () => {
      const eventsToUpdate = events.filter(event => {
        if (event.status === 'completed') return false;
        const newStatus = updateEventStatus(event);
        return newStatus !== event.status;
      });

      for (const event of eventsToUpdate) {
        try {
          const newStatus = updateEventStatus(event);
          await updateStudyEventStatus(event.id, newStatus);
        } catch (error) {
          console.error('Error auto-updating event status:', error);
        }
      }
    };

    if (events.length > 0) {
      updateStatuses();
    }
  }, [events]);

  const stats = calculateStats(events)

  const handleCreateEvent = async (eventData: CreateStudyEventInput) => {
    await createStudyEvent(eventData)
  }

  const handleUpdateEvent = async (eventData: CreateStudyEventInput) => {
    if (editingEvent) {
      await updateStudyEvent(editingEvent.id, eventData)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    setEventToDelete(eventId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (eventToDelete) {
      await deleteStudyEvent(eventToDelete)
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
      await updateStudyEventStatus(eventId, status);
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
      <div className="space-y-8 sm:space-y-10">
        <PageHeader
          title="Lịch học tập"
          description="Theo dõi tiến độ từng ngày và chủ động sắp xếp các phiên học tập phù hợp với mục tiêu của bạn."
          icon={<CalendarDays className="h-6 w-6 text-primary" />}
          actions={
            <Button onClick={handleAddEvent}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm sự kiện
            </Button>
          }
        />

        <PageSection
          heading="Tổng quan trong tháng"
          description="Số liệu nhanh giúp bạn biết mình đã học bao nhiêu và còn những gì đang chờ."
        >
          <Stats stats={stats} />
        </PageSection>

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
