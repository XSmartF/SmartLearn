export interface StudyEvent {
  id: string;
  userId: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  type: 'review' | 'study' | 'deadline' | 'challenge' | 'favorite_review' | 'create';
  flashcardSet: string;
  cardCount: number;
  status: 'upcoming' | 'completed' | 'overdue';
  createdAt: string;
  updatedAt: string;
}

export interface StudyStats {
  title: string;
  value: string;
  subtitle: string;
}

export interface CreateStudyEventInput {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  type: StudyEvent['type'];
  flashcardSet: string;
  cardCount: number;
}
