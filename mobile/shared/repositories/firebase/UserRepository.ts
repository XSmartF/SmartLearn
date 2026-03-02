import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { AppLanguage, MobileProfile, MobileSettings } from '@/shared/models/app';
import { getDb, getFirebaseAuth } from '@/shared/firebase/client';
import { COLLECTIONS, requireUserId } from './helpers';
import type { IUserRepository } from '@/shared/services/contracts';

const db = getDb();

export class FirebaseUserRepository implements IUserRepository {
  async getProfile(): Promise<MobileProfile> {
    const userId = requireUserId();
    const currentAuth = getFirebaseAuth().currentUser;
    const userSnap = await getDoc(doc(db, COLLECTIONS.users, userId));
    const data = userSnap.exists() ? (userSnap.data() as Record<string, unknown>) : {};
    const settings = (data.settings as Record<string, unknown> | undefined) ?? {};
    const profile = (settings.profile as Record<string, unknown> | undefined) ?? {};
    const study = (settings.study as Record<string, unknown> | undefined) ?? {};

    return {
      id: userId,
      displayName:
        (typeof data.displayName === 'string' && data.displayName) ||
        (typeof profile.displayName === 'string' && profile.displayName) ||
        currentAuth?.displayName ||
        '',
      email: currentAuth?.email ?? (typeof data.email === 'string' ? data.email : ''),
      targetMinutesPerDay:
        typeof study.dailyGoalMinutes === 'number' ? study.dailyGoalMinutes : 45,
      timezone: typeof profile.timezone === 'string' ? profile.timezone : 'Asia/Ho_Chi_Minh',
    };
  }

  async updateProfile(
    input: Partial<Omit<MobileProfile, 'id' | 'email'>>,
  ): Promise<MobileProfile> {
    const userId = requireUserId();
    const payload: Record<string, unknown> = {};
    if (input.displayName !== undefined) payload.displayName = input.displayName;
    if (input.targetMinutesPerDay !== undefined)
      payload['settings.study.dailyGoalMinutes'] = input.targetMinutesPerDay;
    if (input.timezone !== undefined) payload['settings.profile.timezone'] = input.timezone;
    if (input.displayName !== undefined)
      payload['settings.profile.displayName'] = input.displayName;
    payload.updatedAt = serverTimestamp();

    await setDoc(doc(db, COLLECTIONS.users, userId), payload, { merge: true });
    return this.getProfile();
  }

  async getSettings(): Promise<MobileSettings> {
    const userId = requireUserId();
    const userSnap = await getDoc(doc(db, COLLECTIONS.users, userId));
    const data = userSnap.exists() ? (userSnap.data() as Record<string, unknown>) : {};
    const settings = (data.settings as Record<string, unknown> | undefined) ?? {};
    const notifications = (settings.notifications as Record<string, unknown> | undefined) ?? {};
    const study = (settings.study as Record<string, unknown> | undefined) ?? {};
    const appearance = (settings.appearance as Record<string, unknown> | undefined) ?? {};
    const profile = (settings.profile as Record<string, unknown> | undefined) ?? {};
    const rawLanguage = profile.language;
    const language: AppLanguage = rawLanguage === 'en' ? 'en' : 'vi';

    return {
      remindersEnabled:
        typeof notifications.studyReminders === 'boolean'
          ? notifications.studyReminders
          : true,
      dailyGoalMinutes:
        typeof study.dailyGoalMinutes === 'number' ? study.dailyGoalMinutes : 45,
      darkMode: appearance.theme === 'dark',
      language,
    };
  }

  async updateSettings(input: Partial<MobileSettings>): Promise<MobileSettings> {
    const userId = requireUserId();
    const existing = await this.getSettings();
    const next: MobileSettings = {
      remindersEnabled: input.remindersEnabled ?? existing.remindersEnabled,
      dailyGoalMinutes: input.dailyGoalMinutes ?? existing.dailyGoalMinutes,
      darkMode: input.darkMode ?? existing.darkMode,
      language: input.language ?? existing.language,
    };

    await setDoc(
      doc(db, COLLECTIONS.users, userId),
      {
        settings: {
          notifications: { studyReminders: next.remindersEnabled },
          study: { dailyGoalMinutes: next.dailyGoalMinutes },
          appearance: { theme: next.darkMode ? 'dark' : 'light' },
          profile: { language: next.language },
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return next;
  }
}

export const firebaseUserRepository = new FirebaseUserRepository();
