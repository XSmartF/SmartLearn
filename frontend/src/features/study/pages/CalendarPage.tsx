import { useState, useEffect } from "react"
import { H1 } from '@/shared/components/ui/typography';
import { Button } from "@/shared/components/ui/button"
import { Plus } from "lucide-react"
import { Stats, CalendarGrid, EventList, TodayEvents, EventDialog, RecentActivities } from '../components'
import { listenUserStudyEvents, createStudyEvent, updateStudyEvent, deleteStudyEvent } from '@/shared/lib/firebaseCalendarService'
import ConfirmDialog from "@/shared/components/ConfirmDialog"
import type { StudyEvent, CreateStudyEventInput } from '../types/calendar'
import {
  getUpcomingEvents,
  getTodayEvents,
  calculateStats
} from '../utils/calendarUtils'

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<StudyEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<StudyEvent | null>(null)
  const [viewOnly, setViewOnly] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)

  useEffect(() => {
    try {
      const unsubscribe = listenUserStudyEvents((fetchedEvents) => {
        setEvents(fetchedEvents)
        setLoading(false)
        setError(null)
      })

      return unsubscribe
    } catch {
      setError('Không thể tải dữ liệu lịch học tập. Vui lòng thử lại sau.')
      setLoading(false)
      return () => {}
    }
  }, [])

  const upcomingEvents = getUpcomingEvents(events)
  const todayEvents = getTodayEvents(events)
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

  const handleSaveEvent = async (eventData: CreateStudyEventInput) => {
    if (editingEvent) {
      await handleUpdateEvent(eventData)
    } else {
      await handleCreateEvent(eventData)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <H1 className="text-3xl font-bold">Lịch học tập</H1>
            <p className="text-muted-foreground">
              Đang tải dữ liệu...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <H1 className="text-3xl font-bold">Lịch học tập</H1>
            <p className="text-muted-foreground">
              {error}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H1 className="text-3xl font-bold">Lịch học tập</H1>
          <p className="text-muted-foreground">
            Quản lý thời gian biểu và sự kiện học tập
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleAddEvent}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm sự kiện
          </Button>
        </div>
      </div>

      {/* Stats */}
      <Stats stats={stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <CalendarGrid
          currentDate={currentDate}
          selectedDate={selectedDate}
          events={events}
          onDateChange={setSelectedDate}
          onCurrentDateChange={setCurrentDate}
          onViewEvent={handleViewEvent}
          onDeleteEvent={handleDeleteEvent}
        />

        {/* Upcoming Events */}
        <EventList
          events={upcomingEvents}
          onView={handleViewEvent}
          onDelete={handleDeleteEvent}
        />

        {/* Recent Activities */}
        <RecentActivities />
      </div>

      {/* Today's Events */}
      <TodayEvents
        events={todayEvents}
        onView={handleViewEvent}
        onDelete={handleDeleteEvent}
      />

      {/* Event Dialog */}
      <EventDialog
        isOpen={dialogOpen}
        onClose={handleDialogClose}
        onSave={handleSaveEvent}
        editingEvent={editingEvent}
        viewOnly={viewOnly}
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
  )
}
