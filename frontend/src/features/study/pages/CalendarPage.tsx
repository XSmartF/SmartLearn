import { useState, useEffect } from "react"
import { H1 } from '@/shared/components/ui/typography'
import { Button } from "@/shared/components/ui/button"
import { Plus } from "lucide-react"
import { Stats, CalendarGrid, EventDialog, TaskStatusCards } from '../components'
import { listenUserStudyEvents, createStudyEvent, updateStudyEvent, deleteStudyEvent, updateStudyEventStatus } from '@/shared/lib/firebaseCalendarService'
import ConfirmDialog from "@/shared/components/ConfirmDialog"
import type { StudyEvent, CreateStudyEventInput } from '../types/calendar'
import {
  calculateStats,
  updateEventStatus
} from '../utils/calendarUtils'

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <H1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Lịch học tập
            </H1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Quản lý thời gian biểu và sự kiện học tập của bạn
            </p>
          </div>
          <div className="flex items-center justify-center sm:justify-end">
            <Button
              onClick={handleAddEvent}
              size="lg"
              className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Thêm sự kiện
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <Stats stats={stats} />
        </div>

        <div className="grid gap-6 lg:gap-8">
          {/* Calendar */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <CalendarGrid
              currentDate={currentDate}
              selectedDate={selectedDate}
              events={events}
              onDateChange={setSelectedDate}
              onCurrentDateChange={setCurrentDate}
              onViewEvent={handleViewEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          </div>
        </div>

        {/* Task Status Cards */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <TaskStatusCards
            events={events}
            onView={handleViewEvent}
            onDelete={handleDeleteEvent}
            onStatusUpdate={handleStatusUpdate}
            onEdit={handleEditEvent}
          />
        </div>

        {/* Event Dialog */}
        <EventDialog
          isOpen={dialogOpen}
          onClose={handleDialogClose}
          onSave={handleSaveEvent}
          editingEvent={editingEvent}
          viewOnly={viewOnly}
          onStatusUpdate={handleStatusUpdate}
        />

        {/* Delete Confirmation Dialog */}
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
      </div>
    </div>
  )
}
