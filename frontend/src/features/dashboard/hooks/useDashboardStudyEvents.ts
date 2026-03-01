import { useEffect, useState } from "react";
import { calendarRepository } from "@/shared/services";
import type { StudyEvent } from "@/features/study/types/calendar";

export function useDashboardStudyEvents(): StudyEvent[] {
  const [events, setEvents] = useState<StudyEvent[]>([]);

  useEffect(() => {
    const unsubscribe = calendarRepository.listenUserEvents(setEvents);
    return unsubscribe;
  }, []);

  return events;
}
