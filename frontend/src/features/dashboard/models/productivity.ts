import { differenceInMinutes, endOfDay, format, isWithinInterval, startOfDay, subDays } from "date-fns";

import type { StudyEvent } from "@/features/study/types/calendar";
import type { DashboardSources } from "../data/useDashboardSources";
import type { DashboardProductivityPoint, DashboardProductivitySectionModel } from "../types";

const SUPPORTED_EVENT_TYPES = new Set<StudyEvent["type"]>([
  "review",
  "favorite_review",
  "study",
  "challenge",
]);

const DAY_COUNT = 7;
const DAY_LABEL_FORMAT = "dd/MM";

const toValidDate = (value: unknown): Date | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return null;
};

interface NormalizedStudyEvent {
  start: Date;
  end: Date;
  reference: Date;
  focusMinutes: number;
  isReviewSession: boolean;
}

const normalizeStudyEvents = (events: StudyEvent[]): NormalizedStudyEvent[] => {
  const now = new Date();
  const normalized: NormalizedStudyEvent[] = [];

  for (const event of events) {
    if (!SUPPORTED_EVENT_TYPES.has(event.type)) {
      continue;
    }

    const start = toValidDate(event.startTime);
    if (!start) {
      continue;
    }

    const end = toValidDate(event.endTime) ?? start;
    const completedAt = event.completedAt ? toValidDate(event.completedAt) : null;
    const reference = completedAt ?? end ?? start;
    if (!reference) {
      continue;
    }

    if (event.status !== "completed" && reference.getTime() > now.getTime()) {
      continue;
    }

    const duration = Math.max(0, differenceInMinutes(end, start));
    const fallbackFromCards = event.cardCount
      ? Math.min(120, Math.max(10, event.cardCount * 2))
      : 15;
    const focusMinutes = duration > 0 ? duration : fallbackFromCards;

    normalized.push({
      start,
      end,
      reference,
      focusMinutes,
      isReviewSession: event.type === "review" || event.type === "favorite_review",
    });
  }

  return normalized;
};

const buildDayBuckets = (days: number) => {
  const today = startOfDay(new Date());
  return Array.from({ length: days }, (_, index) => {
    const current = subDays(today, days - index - 1);
    const start = startOfDay(current);
    const end = endOfDay(current);
    const label = format(current, DAY_LABEL_FORMAT);
    return { start, end, label, iso: start.toISOString() };
  });
};

export const buildUserProductivityPoints = (
  events: StudyEvent[],
  days: number = DAY_COUNT
): DashboardProductivityPoint[] => {
  if (days <= 0) {
    return [];
  }

  const normalized = normalizeStudyEvents(events);
  const buckets = buildDayBuckets(days);

  return buckets.map(({ start, end, label, iso }) => {
    const dailyEvents = normalized.filter((event) =>
      isWithinInterval(event.reference, { start, end })
    );

    const focusMinutes = dailyEvents.reduce((sum, event) => sum + event.focusMinutes, 0);
    const reviewSessions = dailyEvents.reduce(
      (count, event) => count + (event.isReviewSession ? 1 : 0),
      0
    );

    return {
      date: iso,
      label,
      focusMinutes: Math.round(focusMinutes),
      reviewSessions,
    } satisfies DashboardProductivityPoint;
  });
};

export function buildDashboardProductivitySectionModel(
  sources: DashboardSources
): DashboardProductivitySectionModel {
  const data = buildUserProductivityPoints(sources.studyEvents);

  return {
    title: "Hiệu suất học tập",
  description: "Thời gian tập trung và phiên ôn tập từng ngày trong 7 ngày gần nhất",
    palette: sources.palette,
    config: {
      focusMinutes: {
        label: "Phút tập trung",
        color: sources.palette.focus,
      },
      reviewSessions: {
        label: "Phiên ôn tập",
        color: sources.palette.review,
      },
    },
    data,
  } satisfies DashboardProductivitySectionModel;
}
