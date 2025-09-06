// Dynamically import Firestore functions per method to reduce initial bundle.
import { getDb, getFirebaseAuth } from '@/shared/lib/firebaseClient';
import { invalidateCache, cached } from '@/shared/lib/cache';
import {
  query,
  collection,
  where,
  onSnapshot,
  getDocs,
  addDoc,
  serverTimestamp,
  limit,
  deleteDoc,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';

const FAVORITES = 'favorites';
const SHARES = 'shares';
const NOTIFICATIONS = 'notifications';
const ACCESS_REQUESTS = 'access_requests';
const USERS = 'users';
const db = getDb();

export interface UserFavoriteRecord { id: string; userId: string; libraryId: string; createdAt: string }
export interface NotificationDoc { id: string; userId: string; type: string; title: string; message: string; read: boolean; createdAt: string; data?: Record<string, unknown> }
export interface AccessRequestDoc { id: string; libraryId: string; requesterId: string; ownerId: string; status: 'pending'|'approved'|'rejected'; createdAt: string }

export class UserRepository {
  listenUserFavoriteLibraryIds(cb: (ids: string[]) => void) {
    const user = getFirebaseAuth().currentUser; if(!user) throw new Error('Not authenticated');
    let unsub: (()=>void) | null = null; let cancelled = false;
    (async () => {
      if(cancelled) return;
      const qFav = query(collection(db, FAVORITES), where('userId','==', user.uid));
      unsub = onSnapshot(qFav, snap => { const ids: string[] = []; snap.forEach(d => { const data = d.data() as { libraryId?: string }; if(data.libraryId) ids.push(data.libraryId); }); cb(ids); });
    })();
    return () => { cancelled = true; if(unsub) unsub(); };
  }
  async addFavorite(libraryId: string) {
    const user = getFirebaseAuth().currentUser; if(!user) throw new Error('Not authenticated');
    const qFav = query(collection(db, FAVORITES), where('userId','==', user.uid), where('libraryId','==', libraryId));
    const snap = await getDocs(qFav); if(!snap.empty) return;
    await addDoc(collection(db, FAVORITES), { userId: user.uid, libraryId, createdAt: serverTimestamp() });
  }
  async removeFavorite(libraryId: string) {
    const user = getFirebaseAuth().currentUser; if(!user) throw new Error('Not authenticated');
    const qFav = query(collection(db, FAVORITES), where('userId','==', user.uid), where('libraryId','==', libraryId), limit(5));
    const snap = await getDocs(qFav); const ops: Promise<void>[] = []; snap.forEach(d=> ops.push(deleteDoc(doc(db, FAVORITES, d.id)))); await Promise.all(ops);
  }
  async getUserProfile(userId: string): Promise<{ id: string; email?: string; displayName?: string; avatarUrl?: string } | null> {
    return cached([`user:${userId}`], async () => { try { const snap = await getDoc(doc(db, USERS, userId)); if(!snap.exists()) return null; const d = snap.data() as { email?: string; displayName?: string; avatarUrl?: string }; return { id: snap.id, email: d.email, displayName: d.displayName, avatarUrl: d.avatarUrl }; } catch { return null; } });
  }
  async findUserByEmail(email: string): Promise<{ id: string; email?: string; displayName?: string }[]> {
    if(!email) return []; const qUsers = query(collection(db, USERS), where('email','==', email.toLowerCase()), limit(5)); const snap = await getDocs(qUsers); const arr: { id: string; email?: string; displayName?: string }[] = []; snap.forEach(s=> { const d = s.data() as { email?: string; displayName?: string }; arr.push({ id: s.id, email: d.email, displayName: d.displayName }); }); return arr;
  }
  listenUserNotifications(cb: (items: NotificationDoc[]) => void) {
    const user = getFirebaseAuth().currentUser; if(!user) throw new Error('Not authenticated');
    let unsub: (()=>void) | null = null; let cancelled = false;
    (async () => {
      if(cancelled) return;
      const qN = query(collection(db, NOTIFICATIONS), where('userId','==', user.uid));
      unsub = onSnapshot(qN, snap => { const arr: NotificationDoc[] = []; snap.forEach(d=> { const data = d.data() as { userId: string; type: string; title: string; message: string; read?: boolean; createdAt?: { toMillis?: ()=>number }; data?: Record<string, unknown> }; arr.push({ id: d.id, userId: data.userId, type: data.type, title: data.title, message: data.message, data: data.data, read: !!data.read, createdAt: data.createdAt?.toMillis? new Date(data.createdAt.toMillis()).toISOString(): '' }); }); arr.sort((a,b)=> b.createdAt.localeCompare(a.createdAt)); cb(arr); });
    })();
    return () => { cancelled = true; if(unsub) unsub(); };
  }
  async markNotificationRead(id: string) { await updateDoc(doc(db, NOTIFICATIONS, id), { read: true }); }
  async markAllNotificationsRead() {
    const user = getFirebaseAuth().currentUser; if(!user) throw new Error('Not authenticated');
    const qN = query(collection(db, NOTIFICATIONS), where('userId','==', user.uid), where('read','==', false), limit(200)); const snap = await getDocs(qN); const batchOps: Promise<void>[] = []; snap.forEach(d=> batchOps.push(updateDoc(doc(db, NOTIFICATIONS, d.id), { read: true }) as unknown as Promise<void>)); if(batchOps.length) await Promise.all(batchOps);
  }
  async createNotification(userId: string, input: { type: string; title: string; message: string; data?: Record<string, unknown> }) { await addDoc(collection(db, NOTIFICATIONS), { userId, type: input.type, title: input.title, message: input.message, data: input.data || {}, read: false, createdAt: serverTimestamp() }); }
  async createAccessRequest(libraryId: string, ownerId: string): Promise<string> {
    const user = getFirebaseAuth().currentUser; if(!user) throw new Error('Not authenticated'); if(user.uid === ownerId) return 'owner';
    try { const qExistingShare = query(collection(db, SHARES), where('libraryId','==', libraryId), where('targetUserId','==', user.uid), limit(1)); const shareSnap = await getDocs(qExistingShare); if(!shareSnap.empty) return shareSnap.docs[0].id; } catch { /* ignore */ }
    const qReq = query(collection(db, ACCESS_REQUESTS), where('libraryId','==', libraryId), where('requesterId','==', user.uid), where('status','==','pending'), limit(1)); const snap = await getDocs(qReq); if(!snap.empty) return snap.docs[0].id;
    const ref = await addDoc(collection(db, ACCESS_REQUESTS), { libraryId, requesterId: user.uid, ownerId, status: 'pending', createdAt: serverTimestamp() });
    try { await this.createNotification(ownerId, { type: 'access_request', title: 'Yêu cầu truy cập thư viện', message: `Người dùng yêu cầu truy cập thư viện ${libraryId}`, data: { libraryId, requesterId: user.uid, requestId: ref.id } }); } catch { /* ignore */ }
    return ref.id;
  }
  listenPendingAccessRequestsForOwner(cb: (reqs: AccessRequestDoc[]) => void) {
    const user = getFirebaseAuth().currentUser; if(!user) throw new Error('Not authenticated');
    let unsub: (()=>void) | null = null; let cancelled = false;
    (async () => {
      if(cancelled) return;
      const qOwn = query(collection(db, ACCESS_REQUESTS), where('ownerId','==', user.uid), where('status','==','pending'));
      unsub = onSnapshot(qOwn, snap => { const arr: AccessRequestDoc[] = []; snap.forEach(d=> { const data = d.data() as { libraryId: string; requesterId: string; ownerId: string; status: 'pending'|'approved'|'rejected'; createdAt?: { toMillis?: ()=>number } }; arr.push({ id: d.id, libraryId: data.libraryId, requesterId: data.requesterId, ownerId: data.ownerId, status: data.status, createdAt: data.createdAt?.toMillis? new Date(data.createdAt.toMillis()).toISOString(): '' }); }); arr.sort((a,b)=> b.createdAt.localeCompare(a.createdAt)); cb(arr); });
    })();
    return () => { cancelled = true; if(unsub) unsub(); };
  }
  async actOnAccessRequest(reqId: string, approve: boolean) {
    const reqRef = doc(db, ACCESS_REQUESTS, reqId); const snap = await getDoc(reqRef); if(!snap.exists()) return; const data = snap.data() as { libraryId: string; requesterId: string; ownerId: string; status: string };
    if(data.status !== 'pending') return;
    if(approve) { try { await addDoc(collection(db, SHARES), { libraryId: data.libraryId, targetUserId: data.requesterId, role: 'viewer', grantedBy: data.ownerId, createdAt: serverTimestamp() }); } catch { /* ignore */ } await updateDoc(reqRef, { status: 'approved', updatedAt: serverTimestamp() }); try { await this.createNotification(data.requesterId, { type: 'access_request_approved', title: 'Được chấp nhận', message: `Bạn đã được cấp quyền xem thư viện ${data.libraryId}`, data: { libraryId: data.libraryId } }); } catch { /* ignore */ } }
    else { await updateDoc(reqRef, { status: 'rejected', updatedAt: serverTimestamp() }); try { await this.createNotification(data.requesterId, { type: 'access_request_rejected', title: 'Bị từ chối', message: `Yêu cầu truy cập thư viện ${data.libraryId} bị từ chối`, data: { libraryId: data.libraryId } }); } catch { /* ignore */ } }
    invalidateCache(`shares:${data.libraryId}`);
  }

  async listAccessRequestsForOwner() : Promise<AccessRequestDoc[]> {
    const user = getFirebaseAuth().currentUser; if(!user) throw new Error('Not authenticated');
    const qOwn = query(collection(db, ACCESS_REQUESTS), where('ownerId','==', user.uid), where('status','==','pending'));
    const snap = await getDocs(qOwn); const arr: AccessRequestDoc[] = [];
    snap.forEach(d=> { const data = d.data() as { libraryId: string; requesterId: string; ownerId: string; status: 'pending'|'approved'|'rejected'; createdAt?: { toMillis?: ()=>number } }; arr.push({ id: d.id, libraryId: data.libraryId, requesterId: data.requesterId, ownerId: data.ownerId, status: data.status, createdAt: data.createdAt?.toMillis? new Date(data.createdAt.toMillis()).toISOString(): '' }); });
    return arr;
  }

  async listUserAccessRequests(libraryId: string): Promise<AccessRequestDoc[]> {
    const user = getFirebaseAuth().currentUser; if(!user) throw new Error('Not authenticated');
    const qReq = query(collection(db, ACCESS_REQUESTS), where('libraryId','==', libraryId), where('requesterId','==', user.uid));
    const snap = await getDocs(qReq); const arr: AccessRequestDoc[] = [];
    snap.forEach(d=> { const dat = d.data() as { libraryId: string; requesterId: string; ownerId: string; status: 'pending'|'approved'|'rejected'; createdAt?: { toMillis?: ()=>number } }; arr.push({ id: d.id, libraryId: dat.libraryId, requesterId: dat.requesterId, ownerId: dat.ownerId, status: dat.status, createdAt: dat.createdAt?.toMillis? new Date(dat.createdAt.toMillis()).toISOString(): '' }); });
    return arr;
  }
}

export const userRepository = new UserRepository();
