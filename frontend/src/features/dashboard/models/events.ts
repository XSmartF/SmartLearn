import { MAX_UPCOMING_EVENTS } from "../constants";
import type { DashboardSources } from "../data/useDashboardSources";
import type { DashboardEventItemModel, DashboardEventSectionModel } from "../types";
import { getUpcomingEvents } from "@/features/study/utils/calendarUtils";
import type { StudyEvent } from "@/features/study/types/calendar";

const relativeTimeFormatter = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });

const EVENT_TYPE_LABELS: Record<StudyEvent["type"], string> = {
  review: "Phiên ôn tập",
  study: "Buổi học",
  deadline: "Hạn nộp",
  challenge: "Thử thách",
  favorite_review: "Ôn thẻ yêu thích",
  create: "Tạo mới",
};

const formatRelativeTime = (target: Date) => {
  const diffMs = target.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (Math.abs(diffMinutes) < 60) {
    return relativeTimeFormatter.format(diffMinutes, "minutes");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return relativeTimeFormatter.format(diffHours, "hours");
  }

  const diffDays = Math.round(diffHours / 24);
  return relativeTimeFormatter.format(diffDays, "days");
};

const limitUpcomingEvents = (events: DashboardEventItemModel[]): DashboardEventItemModel[] =>
  events.slice(0, MAX_UPCOMING_EVENTS);

export function buildDashboardEventsSectionModel(
  sources: DashboardSources
): DashboardEventSectionModel {
  const upcoming = getUpcomingEvents(sources.studyEvents).map((event) => ({
    id: event.id,
    title: event.title,
    scheduledAt: event.startTime,
    relativeTime: formatRelativeTime(event.startTime),
    location: event.flashcardSet,
    type: event.type,
    typeLabel: EVENT_TYPE_LABELS[event.type],
  }));

  return {
    title: "Lịch sắp tới",
    description: "Chuẩn bị trước cho các phiên học và ôn tập",
    items: limitUpcomingEvents(upcoming),
    emptyState: {
      title: "Chưa có sự kiện",
      description: "Lên lịch một phiên học để giữ nhịp độ ổn định.",
    },
  } satisfies DashboardEventSectionModel;
}
