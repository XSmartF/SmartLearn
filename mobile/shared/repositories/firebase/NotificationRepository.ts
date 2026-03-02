import {
  collection,
  getDocs,
  limit,
  query,
  updateDoc,
  doc,
  where,
} from 'firebase/firestore';
import type { MobileNotification } from '@/shared/models/app';
import { getDb } from '@/shared/firebase/client';
import { COLLECTIONS, mapNotification, requireUserId } from './helpers';
import type { INotificationRepository } from '@/shared/services/contracts';

const db = getDb();

export class FirebaseNotificationRepository implements INotificationRepository {
  async listNotifications(): Promise<MobileNotification[]> {
    const userId = requireUserId();
    const snap = await getDocs(
      query(collection(db, COLLECTIONS.notifications), where('userId', '==', userId)),
    );
    const items: MobileNotification[] = [];
    snap.forEach((item) =>
      items.push(mapNotification(item.id, item.data() as Record<string, unknown>)),
    );
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async markAllNotificationsRead(): Promise<void> {
    const userId = requireUserId();
    const snap = await getDocs(
      query(
        collection(db, COLLECTIONS.notifications),
        where('userId', '==', userId),
        where('read', '==', false),
        limit(200),
      ),
    );
    const tasks: Promise<void>[] = [];
    snap.forEach((item) => {
      tasks.push(
        updateDoc(doc(db, COLLECTIONS.notifications, item.id), {
          read: true,
        }) as unknown as Promise<void>,
      );
    });
    await Promise.all(tasks);
  }
}

export const firebaseNotificationRepository = new FirebaseNotificationRepository();
