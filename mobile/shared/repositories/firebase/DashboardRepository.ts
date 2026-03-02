import { collection, getDocs, query, where } from 'firebase/firestore';
import type { MobileDashboardSnapshot } from '@/shared/models/app';
import { getDb } from '@/shared/firebase/client';
import { COLLECTIONS, requireUserId, safeNum } from './helpers';
import type { IDashboardRepository } from '@/shared/services/contracts';
import type { ILibraryRepository } from '@/shared/services/contracts';
import type { IStudyEventRepository } from '@/shared/services/contracts';
import type { INotificationRepository } from '@/shared/services/contracts';

const db = getDb();

/**
 * DashboardRepository aggregates data from other repositories to build
 * the dashboard snapshot. Dependencies are injected via constructor so
 * this class stays decoupled and testable.
 */
export class FirebaseDashboardRepository implements IDashboardRepository {
  constructor(
    private readonly libraryRepo: ILibraryRepository,
    private readonly studyEventRepo: IStudyEventRepository,
    private readonly notificationRepo: INotificationRepository,
  ) {}

  async getDashboardSnapshot(): Promise<MobileDashboardSnapshot> {
    const userId = requireUserId();
    const libraries = await this.libraryRepo.listLibraries();

    const detailList = await Promise.all(
      libraries.map((item) => this.libraryRepo.getLibraryDetail(item.id)),
    );
    const totalCards = detailList.reduce(
      (sum, item) => sum + (item?.cards.length ?? 0),
      0,
    );

    const progressSnap = await getDocs(
      query(
        collection(db, COLLECTIONS.progress),
        where('userId', '==', userId),
      ),
    );
    let dueCards = 0;
    progressSnap.forEach((item) => {
      if (!item.id.endsWith('__summary')) return;
      const data = item.data() as Record<string, unknown>;
      dueCards += safeNum(data.due);
    });

    const events = await this.studyEventRepo.listStudyEvents();
    const notifications = await this.notificationRepo.listNotifications();

    return {
      totalLibraries: libraries.length,
      totalCards,
      dueCards,
      upcomingEvents: events.filter((item) => item.status === 'upcoming').length,
      unreadNotifications: notifications.filter((item) => !item.read).length,
      streakDays: 0,
    };
  }
}
