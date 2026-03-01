// Domain types for user-related data — backend-agnostic

export interface UserFavoriteRecord {
  id: string;
  userId: string;
  libraryId: string;
  createdAt: string;
}

export interface NotificationDoc {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export interface AccessRequestDoc {
  id: string;
  libraryId: string;
  requesterId: string;
  ownerId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown> ? DeepPartial<T[K]> : T[K];
};

export interface UserSettings {
  profile?: {
    displayName?: string;
    language?: string;
    timezone?: string;
    bio?: string;
  };
  notifications?: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    studyReminders?: boolean;
    weeklySummary?: boolean;
  };
  study?: {
    dailyGoalMinutes?: number;
    reminderTime?: string;
    autoAddEvents?: boolean;
  };
  appearance?: {
    theme?: 'system' | 'light' | 'dark';
    density?: 'comfortable' | 'compact' | 'spacious';
    showConfetti?: boolean;
  };
  privacy?: {
    profileVisibility?: 'public' | 'friends' | 'private';
    shareActivity?: boolean;
    dataInsights?: boolean;
  };
}

export const defaultUserSettings: Required<UserSettings> = {
  profile: {
    displayName: '',
    language: 'vi',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh',
    bio: '',
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    studyReminders: true,
    weeklySummary: false,
  },
  study: {
    dailyGoalMinutes: 45,
    reminderTime: '19:00',
    autoAddEvents: true,
  },
  appearance: {
    theme: 'system',
    density: 'comfortable',
    showConfetti: true,
  },
  privacy: {
    profileVisibility: 'friends',
    shareActivity: true,
    dataInsights: true,
  },
};

export type UserSettingsUpdate = DeepPartial<UserSettings>;

export function mergeUserSettings(base?: UserSettings | null, patch?: UserSettingsUpdate): UserSettings {
  const safeBase = base || {};
  const safePatch = patch || {};

  return {
    profile: {
      ...defaultUserSettings.profile,
      ...(safeBase.profile || {}),
      ...(safePatch.profile || {}),
    },
    notifications: {
      ...defaultUserSettings.notifications,
      ...(safeBase.notifications || {}),
      ...(safePatch.notifications || {}),
    },
    study: {
      ...defaultUserSettings.study,
      ...(safeBase.study || {}),
      ...(safePatch.study || {}),
    },
    appearance: {
      ...defaultUserSettings.appearance,
      ...(safeBase.appearance || {}),
      ...(safePatch.appearance || {}),
    },
    privacy: {
      ...defaultUserSettings.privacy,
      ...(safeBase.privacy || {}),
      ...(safePatch.privacy || {}),
    },
  };
}
