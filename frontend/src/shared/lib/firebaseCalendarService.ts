// Calendar service for managing study events
import { CalendarRepository } from './repositories/CalendarRepository';
import type { StudyEvent, CreateStudyEventInput } from '../../features/study/types/calendar';

export const createStudyEvent = async (input: CreateStudyEventInput): Promise<StudyEvent> => {
  return CalendarRepository.createEvent(input);
};

export const updateStudyEvent = async (id: string, updates: Partial<CreateStudyEventInput>): Promise<void> => {
  return CalendarRepository.updateEvent(id, updates);
};

export const deleteStudyEvent = async (id: string): Promise<void> => {
  return CalendarRepository.deleteEvent(id);
};

export const getUserStudyEvents = async (): Promise<StudyEvent[]> => {
  return CalendarRepository.getUserEvents();
};

export const listenUserStudyEvents = (callback: (events: StudyEvent[]) => void): (() => void) => {
  return CalendarRepository.listenUserEvents(callback);
};

export const updateStudyEventStatus = async (id: string, status: StudyEvent['status']): Promise<void> => {
  return CalendarRepository.updateEventStatus(id, status);
};
