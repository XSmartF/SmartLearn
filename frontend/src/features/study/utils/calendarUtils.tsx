import type { StudyEvent, StudyStats } from '../types/calendar';
import {
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  AlertCircle,
  Target,
  Star,
  Plus
} from "lucide-react";

export const getEventIcon = (type: string) => {
  switch (type) {
    case 'review':
      return <AlertCircle className="h-4 w-4" />;
    case 'study':
      return <BookOpen className="h-4 w-4" />;
    case 'deadline':
      return <Clock className="h-4 w-4" />;
    case 'challenge':
      return <Target className="h-4 w-4" />;
    case 'favorite_review':
      return <Star className="h-4 w-4" />;
    case 'create':
      return <Plus className="h-4 w-4" />;
    default:
      return <CalendarIcon className="h-4 w-4" />;
  }
};

export const getEventColor = (type: string) => {
  switch (type) {
    case 'review':
      return 'border-l-chart-1 bg-chart-1/10 text-chart-1 dark:bg-chart-1/20 dark:text-chart-1';
    case 'study':
      return 'border-l-chart-2 bg-chart-2/10 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2';
    case 'deadline':
      return 'border-l-destructive bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive';
    case 'challenge':
      return 'border-l-chart-3 bg-chart-3/10 text-chart-3 dark:bg-chart-3/20 dark:text-chart-3';
    case 'favorite_review':
      return 'border-l-chart-4 bg-chart-4/10 text-chart-4 dark:bg-chart-4/20 dark:text-chart-4';
    case 'create':
      return 'border-l-chart-5 bg-chart-5/10 text-chart-5 dark:bg-chart-5/20 dark:text-chart-5';
    default:
      return 'border-l-primary bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary';
  }
};

export const formatTime = (date: Date) => {
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatShortDate = (date: Date) => {
  return date.toLocaleDateString('vi-VN', {
    month: 'short',
    day: 'numeric'
  });
};

export const generateCalendarDays = (currentDate: Date) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days: (Date | null)[] = [];

  // Add empty cells for previous month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  // Add days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  return days;
};

export const hasEventOnDate = (date: Date | null, events: StudyEvent[]) => {
  if (!date) return false;
  return events.some(event =>
    event.startTime.toDateString() === date.toDateString()
  );
};

export const getUpcomingEvents = (events: StudyEvent[]) => {
  return events
    .filter(event => event.startTime >= new Date())
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    .slice(0, 5);
};

export const getTodayEvents = (events: StudyEvent[]) => {
  const today = new Date();
  return events.filter(event =>
    event.startTime.toDateString() === today.toDateString()
  );
};

export const calculateStats = (events: StudyEvent[]): StudyStats[] => {
  const todayEvents = getTodayEvents(events);

  return [
    {
      title: "Sự kiện hôm nay",
      value: todayEvents.length.toString(),
      subtitle: "Hoạt động trong ngày"
    },
    {
      title: "Tuần này",
      value: events.filter(event => {
        const weekStart = new Date();
        const weekEnd = new Date();
        weekEnd.setDate(weekStart.getDate() + 7);
        return event.startTime >= weekStart && event.startTime <= weekEnd;
      }).length.toString(),
      subtitle: "Sự kiện sắp tới"
    },
    {
      title: "Ôn tập",
      value: events.filter(event => event.type === 'review').length.toString(),
      subtitle: "Cần ôn tập"
    },
    {
      title: "Học mới",
      value: events.filter(event => event.type === 'study').length.toString(),
      subtitle: "Flashcard mới"
    }
  ];
};
