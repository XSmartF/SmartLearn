export type Difficulty = 'easy' | 'medium' | 'hard';
export type StudyEventStatus = 'upcoming' | 'completed' | 'missed';
export type AppLanguage = 'vi' | 'en';

export interface MobileLibrary {
  id: string;
  title: string;
  description: string;
  cardCount: number;
  subject?: string;
  difficulty?: Difficulty;
  updatedAt: string;
}

export interface MobileCard {
  id: string;
  libraryId: string;
  front: string;
  back: string;
  difficulty: Difficulty;
}

export interface MobileNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

export interface MobileStudyEvent {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  status: StudyEventStatus;
  libraryId?: string;
}

export interface MobileNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface MobileGameMode {
  id: string;
  title: string;
  description: string;
}

export const DEFAULT_GAME_MODES: MobileGameMode[] = [
  { id: 'quiz', title: 'Quiz nhanh', description: 'Trả lời nhanh theo bộ thẻ đang học.' },
  { id: 'memory', title: 'Ghép cặp', description: 'Ghép cặp mặt trước/mặt sau để tăng trí nhớ.' },
  { id: 'speed', title: 'Thử thách tốc độ', description: 'Vượt giới hạn thời gian với chuỗi câu hỏi.' },
  { id: 'word-scramble', title: 'Xếp chữ', description: 'Sắp xếp lại từ và cú pháp đúng.' },
];

export interface MobileProfile {
  id: string;
  displayName: string;
  email: string;
  targetMinutesPerDay: number;
  timezone: string;
}

export interface MobileSettings {
  remindersEnabled: boolean;
  dailyGoalMinutes: number;
  darkMode: boolean;
  language: AppLanguage;
}

export interface MobileDashboardSnapshot {
  totalLibraries: number;
  totalCards: number;
  dueCards: number;
  upcomingEvents: number;
  unreadNotifications: number;
  streakDays: number;
}

export interface MobileLibraryDetail {
  library: MobileLibrary;
  cards: MobileCard[];
}

export interface MobileTestQuestion {
  id: string;
  libraryId: string;
  prompt: string;
  answer: string;
}

export interface MobileCardFlag {
  id: string;
  userId: string;
  libraryId: string;
  cardId: string;
  starred?: boolean;
  difficulty?: Difficulty;
}

export type MobileFlagMap = Record<string, { starred?: boolean; difficulty?: Difficulty }>;
