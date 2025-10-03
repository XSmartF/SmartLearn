import { useEffect, useState } from "react";
import { listenUserStudyEvents } from "@/shared/lib/firebase";
import type { StudyEvent } from "@/features/study/types/calendar";

export function useDashboardStudyEvents(): StudyEvent[] {
  const [events, setEvents] = useState<StudyEvent[]>([]);

  useEffect(() => {
    const unsubscribe = listenUserStudyEvents(setEvents);
    return unsubscribe;
  }, []);

  return events;
}
