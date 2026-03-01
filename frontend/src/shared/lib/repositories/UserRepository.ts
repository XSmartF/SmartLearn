import { getDb, getFirebaseAuth } from '@/shared/lib/firebase/client';
import { invalidateCache, cached } from '@/shared/lib/cache';
import type { IUserRepository } from '@/shared/services/contracts';
import type { UserSettings, UserSettingsUpdate, NotificationDoc, AccessRequestDoc } from '@/shared/types';
import { mergeUserSettings } from '@/shared/types';
import {
  query, collection, where, onSnapshot, getDocs, addDoc,
  serverTimestamp, limit, deleteDoc, doc, getDoc, updateDoc, setDoc,
} from 'firebase/firestore';

const FAVORITES = 'favorites';
const SHARES = 'shares';
const NOTIFICATIONS = 'notifications';
const ACCESS_REQUESTS = 'access_requests';
const USERS = 'users';
const db = getDb();

type FirestoreTimestamp = { toMillis?: () => number };

function tsToIso(ts?: FirestoreTimestamp): string {
  return ts?.toMillis ? new Date(ts.toMillis()).toISOString() : '';
}

function mapDocToNotification(d: import('firebase/firestore').QueryDocumentSnapshot): NotificationDoc {
  const data = d.data() as {
    userId: string; type: string; title: string; message: string;
    read?: boolean; createdAt?: FirestoreTimestamp; data?: Record<string, unknown>;
  };
  return {
    id: d.id,
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    data: data.data,
    read: !!data.read,
    createdAt: tsToIso(data.createdAt),
  };
}

function mapDocToAccessRequest(d: import('firebase/firestore').QueryDocumentSnapshot): AccessRequestDoc {
  const data = d.data() as {
    libraryId: string; requesterId: string; ownerId: string;
    status: 'pending' | 'approved' | 'rejected'; createdAt?: FirestoreTimestamp;
  };
  return {
    id: d.id,
    libraryId: data.libraryId,
    requesterId: data.requesterId,
    ownerId: data.ownerId,
    status: data.status,
    createdAt: tsToIso(data.createdAt),
  };
}

/** Creates a snapshot listener with standard cancelled/unsub pattern. */
function createSnapshotListener(
  setupFn: (onCancel: () => boolean) => (() => void),
): () => void {
  let unsub: (() => void) | null = null;
  let cancelled = false;
  (async () => {
    if (cancelled) return;
    unsub = setupFn(() => cancelled);
  })();
  return () => { cancelled = true; unsub?.(); };
}

export class UserRepository implements IUserRepository {
  listenUserFavoriteLibraryIds(cb: (ids: string[]) => void) {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    return createSnapshotListener(() => {
      const q = query(collection(db, FAVORITES), where('userId', '==', user.uid));
      return onSnapshot(q, snap => {
        const ids: string[] = [];
        snap?.forEach(d => {
          const data = d.data() as { libraryId?: string };
          if (data.libraryId) ids.push(data.libraryId);
        });
        cb(ids);
      });
    });
  }

  async addFavorite(libraryId: string) {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');
    const q = query(collection(db, FAVORITES), where('userId', '==', user.uid), where('libraryId', '==', libraryId));
    const snap = await getDocs(q);
    if (!snap || !snap.empty) return;
    await addDoc(collection(db, FAVORITES), { userId: user.uid, libraryId, createdAt: serverTimestamp() });
  }

  async removeFavorite(libraryId: string) {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');
    const q = query(collection(db, FAVORITES), where('userId', '==', user.uid), where('libraryId', '==', libraryId), limit(5));
    const snap = await getDocs(q);
    const ops: Promise<void>[] = [];
    snap.forEach(d => ops.push(deleteDoc(doc(db, FAVORITES, d.id))));
    await Promise.all(ops);
  }

  async getUserProfile(userId: string) {
    return cached([`user:${userId}`], async () => {
      try {
        const snap = await getDoc(doc(db, USERS, userId));
        if (!snap.exists()) return null;
        const d = snap.data() as { email?: string; displayName?: string; avatarUrl?: string };
        return { id: snap.id, email: d.email, displayName: d.displayName, avatarUrl: d.avatarUrl };
      } catch {
        return null;
      }
    });
  }

  async findUserByEmail(email: string) {
    if (!email) return [];
    const q = query(collection(db, USERS), where('email', '==', email.toLowerCase()), limit(5));
    const snap = await getDocs(q);
    const arr: { id: string; email?: string; displayName?: string }[] = [];
    snap.forEach(s => {
      const d = s.data() as { email?: string; displayName?: string };
      arr.push({ id: s.id, email: d.email, displayName: d.displayName });
    });
    return arr;
  }

  listenUserSettings(cb: (settings: UserSettings) => void) {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    return createSnapshotListener(() => {
      const ref = doc(db, USERS, user.uid);
      return onSnapshot(ref, snapshot => {
        const data = snapshot.exists() ? (snapshot.data().settings as UserSettings | undefined) : undefined;
        cb(mergeUserSettings(data));
      });
    });
  }

  async getUserSettings(): Promise<UserSettings> {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');
    const snapshot = await getDoc(doc(db, USERS, user.uid));
    const data = snapshot.exists() ? (snapshot.data().settings as UserSettings | undefined) : undefined;
    return mergeUserSettings(data);
  }

  async updateUserSettings(patch: UserSettingsUpdate): Promise<UserSettings> {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    const ref = doc(db, USERS, user.uid);
    const snapshot = await getDoc(ref);
    const existing = snapshot.exists() ? (snapshot.data().settings as UserSettings | undefined) : undefined;
    const merged = mergeUserSettings(existing, patch);

    const payload: Record<string, unknown> = { settings: merged };
    if (patch.profile?.displayName) payload.displayName = patch.profile.displayName;

    await setDoc(ref, payload, { merge: true });
    invalidateCache(`user:${user.uid}`);
    return merged;
  }

  listenUserNotifications(cb: (items: NotificationDoc[]) => void) {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    return createSnapshotListener(() => {
      const q = query(collection(db, NOTIFICATIONS), where('userId', '==', user.uid));
      return onSnapshot(q, snap => {
        const arr: NotificationDoc[] = [];
        snap?.forEach(d => arr.push(mapDocToNotification(d)));
        arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        cb(arr);
      });
    });
  }

  async markNotificationRead(id: string) {
    await updateDoc(doc(db, NOTIFICATIONS, id), { read: true });
  }

  async markAllNotificationsRead() {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');
    const q = query(collection(db, NOTIFICATIONS), where('userId', '==', user.uid), where('read', '==', false), limit(200));
    const snap = await getDocs(q);
    const ops: Promise<void>[] = [];
    snap.forEach(d => ops.push(updateDoc(doc(db, NOTIFICATIONS, d.id), { read: true }) as unknown as Promise<void>));
    if (ops.length) await Promise.all(ops);
  }

  async createNotification(userId: string, input: { type: string; title: string; message: string; data?: Record<string, unknown> }) {
    await addDoc(collection(db, NOTIFICATIONS), {
      userId, type: input.type, title: input.title,
      message: input.message, data: input.data || {},
      read: false, createdAt: serverTimestamp(),
    });
  }

  async createAccessRequest(libraryId: string, ownerId: string): Promise<string> {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');
    if (user.uid === ownerId) return 'owner';

    // Check existing share
    try {
      const qShare = query(collection(db, SHARES), where('libraryId', '==', libraryId), where('targetUserId', '==', user.uid), limit(1));
      const shareSnap = await getDocs(qShare);
      if (shareSnap && !shareSnap.empty) return shareSnap.docs[0].id;
    } catch { /* ignore */ }

    // Check existing pending request
    const qReq = query(collection(db, ACCESS_REQUESTS), where('libraryId', '==', libraryId), where('requesterId', '==', user.uid), where('status', '==', 'pending'), limit(1));
    const snap = await getDocs(qReq);
    if (snap && !snap.empty) return snap.docs[0].id;

    const ref = await addDoc(collection(db, ACCESS_REQUESTS), {
      libraryId, requesterId: user.uid, ownerId,
      status: 'pending', createdAt: serverTimestamp(),
    });

    try {
      await this.createNotification(ownerId, {
        type: 'access_request',
        title: 'Yêu cầu truy cập thư viện',
        message: `Người dùng yêu cầu truy cập thư viện ${libraryId}`,
        data: { libraryId, requesterId: user.uid, requestId: ref.id },
      });
    } catch { /* ignore */ }
    return ref.id;
  }

  listenPendingAccessRequestsForOwner(cb: (reqs: AccessRequestDoc[]) => void) {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    return createSnapshotListener(() => {
      const q = query(collection(db, ACCESS_REQUESTS), where('ownerId', '==', user.uid), where('status', '==', 'pending'));
      return onSnapshot(q, snap => {
        const arr: AccessRequestDoc[] = [];
        snap?.forEach(d => arr.push(mapDocToAccessRequest(d)));
        arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        cb(arr);
      });
    });
  }

  async actOnAccessRequest(reqId: string, approve: boolean) {
    const reqRef = doc(db, ACCESS_REQUESTS, reqId);
    const snap = await getDoc(reqRef);
    if (!snap.exists()) return;

    const data = snap.data() as { libraryId: string; requesterId: string; ownerId: string; status: string };
    if (data.status !== 'pending') return;

    if (approve) {
      try {
        await addDoc(collection(db, SHARES), {
          libraryId: data.libraryId, targetUserId: data.requesterId,
          role: 'viewer', grantedBy: data.ownerId, createdAt: serverTimestamp(),
        });
      } catch { /* ignore */ }
      await updateDoc(reqRef, { status: 'approved', updatedAt: serverTimestamp() });
      try {
        await this.createNotification(data.requesterId, {
          type: 'access_request_approved',
          title: 'Được chấp nhận',
          message: `Bạn đã được cấp quyền xem thư viện ${data.libraryId}`,
          data: { libraryId: data.libraryId },
        });
      } catch { /* ignore */ }
    } else {
      await updateDoc(reqRef, { status: 'rejected', updatedAt: serverTimestamp() });
      try {
        await this.createNotification(data.requesterId, {
          type: 'access_request_rejected',
          title: 'Bị từ chối',
          message: `Yêu cầu truy cập thư viện ${data.libraryId} bị từ chối`,
          data: { libraryId: data.libraryId },
        });
      } catch { /* ignore */ }
    }
    invalidateCache(`shares:${data.libraryId}`);
  }

  async listAccessRequestsForOwner(): Promise<AccessRequestDoc[]> {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');
    const q = query(collection(db, ACCESS_REQUESTS), where('ownerId', '==', user.uid), where('status', '==', 'pending'));
    const snap = await getDocs(q);
    const arr: AccessRequestDoc[] = [];
    snap.forEach(d => arr.push(mapDocToAccessRequest(d)));
    return arr;
  }

  async listUserAccessRequests(libraryId: string): Promise<AccessRequestDoc[]> {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');
    const q = query(collection(db, ACCESS_REQUESTS), where('libraryId', '==', libraryId), where('requesterId', '==', user.uid));
    const snap = await getDocs(q);
    const arr: AccessRequestDoc[] = [];
    snap.forEach(d => arr.push(mapDocToAccessRequest(d)));
    return arr;
  }
}

export const userRepository = new UserRepository();
