import { collection, addDoc, doc, getDoc, getDocs, query, where, serverTimestamp, onSnapshot, limit, updateDoc, deleteDoc, increment, writeBatch } from 'firebase/firestore';
import { getDb } from './firebaseClient';
import type { LibraryMeta, LibraryVisibility, Card as EngineCard, ShareRole, LibraryShare } from './models';
import { getFirebaseAuth } from './firebaseClient';

// Firestore collection names
const LIBRARIES = 'libraries';
const CARDS = 'cards';
const SHARES = 'shares';
const ACCESS_REQUESTS = 'access_requests';
const NOTIFICATIONS = 'notifications';
const FAVORITES = 'favorites';
const USERS = 'users';
const PROGRESS = 'progress';

export interface CreateLibraryInput {
  title: string;
  description?: string;
  subject?: string;
  difficulty?: string;
  tags?: string[];
  visibility?: LibraryVisibility;
}

export interface CreateCardInput {
  libraryId: string;
  front: string;
  back: string;
  domain?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

const db = getDb();

export async function createLibrary(input: CreateLibraryInput): Promise<string> {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  const now = serverTimestamp();
  const ref = await addDoc(collection(db, LIBRARIES), {
    ownerId: user.uid,
    title: input.title,
    description: input.description ?? '',
    subject: input.subject ?? '',
    difficulty: input.difficulty ?? 'medium',
    tags: input.tags ?? [],
    visibility: input.visibility ?? 'private',
    cardCount: 0,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function createCard(input: CreateCardInput) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  const now = serverTimestamp();
  await addDoc(collection(db, CARDS), {
    libraryId: input.libraryId,
    front: input.front,
    back: input.back,
  domain: input.domain ?? null,
  difficulty: input.difficulty ?? null,
    createdAt: now,
    updatedAt: now,
  });
  // Update library cardCount atomically
  await updateDoc(doc(db, LIBRARIES, input.libraryId), { cardCount: increment(1), updatedAt: serverTimestamp() });
}

// Bulk create cards (front|back pairs). Returns number of cards actually created.
export async function createCardsBulk(libraryId: string, items: { front: string; back: string; domain?: string }[]): Promise<number> {
  if (!items.length) return 0;
  const user = getFirebaseAuth().currentUser; if (!user) throw new Error('Not authenticated');
  // Firestore batch limit = 500 operations. Each card is 1 operation. We'll chunk to 450 for safety.
  const CHUNK = 450;
  let created = 0;
  const now = serverTimestamp();
  for (let i = 0; i < items.length; i += CHUNK) {
    const slice = items.slice(i, i + CHUNK);
    const batch = writeBatch(db);
    for (const it of slice) {
      const ref = doc(collection(db, CARDS));
      batch.set(ref, {
        libraryId,
        front: it.front,
        back: it.back,
  domain: it.domain ?? null,
  difficulty: null,
        createdAt: now,
        updatedAt: now,
      });
    }
    await batch.commit();
    created += slice.length;
  }
  // Single atomic increment at end (race-safe even if other writers exist)
  try { await updateDoc(doc(db, LIBRARIES, libraryId), { cardCount: increment(created), updatedAt: serverTimestamp() }); } catch {/* ignore */}
  return created;
}

export async function getLibraryMeta(id: string): Promise<LibraryMeta | null> {
  const snap = await getDoc(doc(db, LIBRARIES, id));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    ownerId: data.ownerId,
    title: data.title,
    description: data.description,
    tags: data.tags ?? [],
    visibility: data.visibility,
    cardCount: data.cardCount ?? 0,
    subject: data.subject ?? '',
    createdAt: data.createdAt?.toMillis ? new Date(data.createdAt.toMillis()).toISOString() : '',
    updatedAt: data.updatedAt?.toMillis ? new Date(data.updatedAt.toMillis()).toISOString() : '',
  } as LibraryMeta;
}

// Update library basic fields (owner only enforced at security rules level)
export async function updateLibrary(id: string, data: { title?: string; description?: string; visibility?: LibraryVisibility; tags?: string[]; subject?: string; difficulty?: string }) {
  const patch: Record<string, unknown> = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.description !== undefined) patch.description = data.description;
  if (data.visibility !== undefined) patch.visibility = data.visibility;
  if (data.tags !== undefined) patch.tags = data.tags;
  if (data.subject !== undefined) patch.subject = data.subject;
  if (data.difficulty !== undefined) patch.difficulty = data.difficulty;
  patch.updatedAt = serverTimestamp();
  await updateDoc(doc(db, LIBRARIES, id), patch);
}

export function listenUserLibraries(cb: (libs: LibraryMeta[]) => void) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  const qOwned = query(collection(db, LIBRARIES), where('ownerId', '==', user.uid));
  return onSnapshot(qOwned, snap => {
    const arr: LibraryMeta[] = [];
    snap.forEach(docSnap => {
      const d = docSnap.data();
      arr.push({
        id: docSnap.id,
        ownerId: d.ownerId,
        title: d.title,
        description: d.description,
        tags: d.tags ?? [],
        visibility: d.visibility,
        cardCount: d.cardCount ?? 0,
        createdAt: d.createdAt?.toMillis ? new Date(d.createdAt.toMillis()).toISOString() : '',
        updatedAt: d.updatedAt?.toMillis ? new Date(d.updatedAt.toMillis()).toISOString() : '',
      });
    });
    cb(arr);
  });
}

export async function listCards(libraryId: string): Promise<EngineCard[]> {
  const qCards = query(collection(db, CARDS), where('libraryId', '==', libraryId), limit(1000));
  const snap = await getDocs(qCards);
  const list: EngineCard[] = [];
  snap.forEach(s => {
    const d = s.data();
  list.push({ id: s.id, front: d.front, back: d.back, domain: d.domain ?? undefined, difficulty: d.difficulty ?? undefined });
  });
  return list;
}

// Simple share record
export async function addShare(libraryId: string, targetUserId: string, role: ShareRole) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  await addDoc(collection(db, SHARES), {
    libraryId,
    targetUserId,
    role,
    grantedBy: user.uid,
    createdAt: serverTimestamp(),
  });
}

export async function listShares(libraryId: string): Promise<LibraryShare[]> {
  const qShares = query(collection(db, SHARES), where('libraryId', '==', libraryId));
  const snap = await getDocs(qShares);
  const shares: LibraryShare[] = [];
  snap.forEach(s => {
    const d = s.data() as { libraryId: string; grantedBy: string; targetUserId: string; role: ShareRole; createdAt?: { toMillis?: () => number } };
    // Backward compatibility: legacy documents may still store role 'editor'
  const legacyRole = (d.role as unknown as string);
  const mappedRole = (legacyRole === 'editor' ? 'contributor' : legacyRole) as ShareRole;
    shares.push({
      id: s.id,
      libraryId: d.libraryId,
      grantedBy: d.grantedBy,
      targetUserId: d.targetUserId,
      role: mappedRole,
      createdAt: d.createdAt?.toMillis ? new Date(d.createdAt.toMillis()).toISOString() : ''
    });
  });
  return shares;
}

export async function removeShare(shareId: string) {
  await deleteDoc(doc(db, SHARES, shareId));
}

export async function updateShareRole(shareId: string, role: ShareRole) {
  await updateDoc(doc(db, SHARES, shareId), { role });
}

// Basic user profile lookup (expects a 'users' collection maintained elsewhere)
export async function getUserProfile(userId: string): Promise<{ id: string; email?: string; displayName?: string; avatarUrl?: string } | null> {
  try {
    const snap = await getDoc(doc(db, USERS, userId));
    if (!snap.exists()) return null;
  const d = snap.data() as { email?: string; displayName?: string; avatarUrl?: string };
  return { id: snap.id, email: d.email, displayName: d.displayName, avatarUrl: d.avatarUrl };
  } catch { return null; }
}

export async function findUserByEmail(email: string): Promise<{ id: string; email?: string; displayName?: string }[]> {
  if (!email) return [];
  const qUsers = query(collection(db, USERS), where('email', '==', email.toLowerCase()), limit(5));
  const snap = await getDocs(qUsers);
  const arr: { id: string; email?: string; displayName?: string }[] = [];
  snap.forEach(s => { const d = s.data() as { email?: string; displayName?: string }; arr.push({ id: s.id, email: d.email, displayName: d.displayName }); });
  return arr;
}

// Listen to shares where current user is target, provide AccessibleLibrary objects
export function listenUserSharedLibraries(cb: (shares: { libraryId: string; role: ShareRole }[]) => void) {
  const user = getFirebaseAuth().currentUser; if (!user) throw new Error('Not authenticated');
  const qShared = query(collection(db, SHARES), where('targetUserId', '==', user.uid));
  return onSnapshot(qShared, snap => {
    const arr: { libraryId: string; role: ShareRole }[] = [];
  snap.forEach(ds => { const d = ds.data() as { libraryId?: string; role?: ShareRole | 'editor' }; if (d.libraryId && d.role) arr.push({ libraryId: d.libraryId, role: (d.role === 'editor' ? 'contributor' : d.role) as ShareRole }); });
    cb(arr);
  });
}

// Listen for a share record (if any) granting current user access to a specific library
export function listenCurrentUserShareForLibrary(libraryId: string, cb: (share: { id: string; role: ShareRole } | null) => void) {
  const user = getFirebaseAuth().currentUser; if(!user) throw new Error('Not authenticated');
  const qShare = query(collection(db, SHARES), where('libraryId','==', libraryId), where('targetUserId','==', user.uid));
  return onSnapshot(qShare, snap => {
    if (snap.empty) { cb(null); return; }
    const d = snap.docs[0].data() as { role: ShareRole | 'editor' };
    cb({ id: snap.docs[0].id, role: (d.role === 'editor' ? 'contributor' : d.role) as ShareRole });
  });
}

export async function updateCard(cardId: string, data: { front?: string; back?: string; domain?: string | null; difficulty?: 'easy' | 'medium' | 'hard' | null }) {
  await updateDoc(doc(db, CARDS, cardId), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteCard(cardId: string) {
  // Need libraryId to decrement count
  const cardRef = doc(db, CARDS, cardId);
  const snap = await getDoc(cardRef);
  let libId: string | null = null;
  if (snap.exists()) {
    const d = snap.data() as { libraryId?: string };
    if (d.libraryId) libId = d.libraryId;
  }
  await deleteDoc(cardRef);
  if (libId) {
    try { await updateDoc(doc(db, LIBRARIES, libId), { cardCount: increment(-1), updatedAt: serverTimestamp() }); } catch { /* ignore */ }
  }
}

// Bulk delete cards by ids (same library). Decrements library cardCount once.
export async function deleteCardsBulk(cardIds: string[]): Promise<number> {
  if (!cardIds.length) return 0;
  // Fetch their libraryId (assume same library, but we'll count valid ones)
  const toDelete: { id: string; libraryId: string }[] = [];
  for (const id of cardIds) {
    try {
      const ref = doc(db, CARDS, id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const d = snap.data() as { libraryId?: string };
        if (d.libraryId) toDelete.push({ id, libraryId: d.libraryId });
      }
    } catch {/* ignore individual errors */}
  }
  if (!toDelete.length) return 0;
  const libraryId = toDelete[0].libraryId;
  const batch = writeBatch(db);
  for (const c of toDelete) batch.delete(doc(db, CARDS, c.id));
  await batch.commit();
  try { await updateDoc(doc(db, LIBRARIES, libraryId), { cardCount: increment(-toDelete.length), updatedAt: serverTimestamp() }); } catch { /* ignore */ }
  return toDelete.length;
}

// -------- Favorites (user <-> library) ---------
// Firestore schema (collection: favorites)
//  { userId, libraryId, createdAt }

export interface UserFavoriteRecord {
  id: string;
  userId: string;
  libraryId: string;
  createdAt: string; // ISO
}

export async function addFavorite(libraryId: string) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  // Prevent duplicate: query first
  const qFav = query(collection(db, FAVORITES), where('userId', '==', user.uid), where('libraryId', '==', libraryId));
  const snap = await getDocs(qFav);
  if (!snap.empty) return; // already exists
  await addDoc(collection(db, FAVORITES), {
    userId: user.uid,
    libraryId,
    createdAt: serverTimestamp(),
  });
}

export async function removeFavorite(libraryId: string) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  const qFav = query(collection(db, FAVORITES), where('userId', '==', user.uid), where('libraryId', '==', libraryId), limit(5));
  const snap = await getDocs(qFav);
  const batchDeletes: Promise<void>[] = [];
  snap.forEach(dSnap => batchDeletes.push(deleteDoc(doc(db, FAVORITES, dSnap.id))));
  await Promise.all(batchDeletes);
}

export function listenUserFavoriteLibraryIds(cb: (libraryIds: string[]) => void) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  const qFav = query(collection(db, FAVORITES), where('userId', '==', user.uid));
  return onSnapshot(qFav, snap => {
    const ids: string[] = [];
    snap.forEach(d => {
      const data = d.data() as { libraryId?: string };
      if (data.libraryId) ids.push(data.libraryId);
    });
    cb(ids);
  });
}

export async function fetchLibrariesByIds(ids: string[]): Promise<LibraryMeta[]> {
  if (!ids.length) return [];
  // Firestore doesn't support in queries >10; chunk accordingly
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));
  const results: LibraryMeta[] = [];
  for (const chunk of chunks) {
    const qLibs = query(collection(db, LIBRARIES), where('__name__', 'in', chunk));
    const snap = await getDocs(qLibs);
    snap.forEach(docSnap => {
      const d = docSnap.data();
      results.push({
        id: docSnap.id,
        ownerId: d.ownerId,
        title: d.title,
        description: d.description,
        tags: d.tags ?? [],
        visibility: d.visibility,
        cardCount: d.cardCount ?? 0,
        subject: d.subject ?? '',
        createdAt: d.createdAt?.toMillis ? new Date(d.createdAt.toMillis()).toISOString() : '',
        updatedAt: d.updatedAt?.toMillis ? new Date(d.updatedAt.toMillis()).toISOString() : '',
      } as LibraryMeta);
    });
  }
  // Keep same order as original ids
  return results.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
}

// -------- User Progress (per library) ----------
// Firestore collection 'progress' documents keyed arbitrarily (auto id): { userId, libraryId, engineState, updatedAt }
// engineState kept as JSON object.
export interface UserLibraryProgressDoc {
  id: string;
  userId: string;
  libraryId: string;
  engineState: Record<string, unknown> | null;
  updatedAt: string; // ISO
}

export async function getUserLibraryProgress(libraryId: string): Promise<UserLibraryProgressDoc | null> {
  const user = getFirebaseAuth().currentUser; if (!user) throw new Error('Not authenticated');
  const qProg = query(collection(db, PROGRESS), where('userId', '==', user.uid), where('libraryId', '==', libraryId), limit(1));
  const snap = await getDocs(qProg);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  const d = docSnap.data() as Record<string, unknown> & { userId: string; libraryId: string; engineState?: Record<string, unknown>; updatedAt?: { toMillis?: () => number } };
  return {
    id: docSnap.id,
    userId: d.userId,
    libraryId: d.libraryId,
  engineState: (d.engineState as Record<string, unknown> | undefined) ?? null,
    updatedAt: d.updatedAt?.toMillis ? new Date(d.updatedAt.toMillis()).toISOString() : ''
  };
}

export async function upsertUserLibraryProgress(libraryId: string, engineState: Record<string, unknown>) {
  const user = getFirebaseAuth().currentUser; if (!user) throw new Error('Not authenticated');
  const existing = await getUserLibraryProgress(libraryId);
  if (existing) {
    await updateDoc(doc(db, PROGRESS, existing.id), { engineState, updatedAt: serverTimestamp() });
    return existing.id;
  }
  const ref = await addDoc(collection(db, PROGRESS), { userId: user.uid, libraryId, engineState, updatedAt: serverTimestamp(), createdAt: serverTimestamp() });
  return ref.id;
}

export async function computeBasicProgressStats(libraryId: string): Promise<{ mastered: number; learning: number; due: number; total: number }> {
  // Placeholder: Real logic would parse engineState (spaced repetition queues)
  const prog = await getUserLibraryProgress(libraryId);
  const state = (prog?.engineState || {}) as Record<string, unknown>;
  const num = (v: unknown) => typeof v === 'number' ? v : 0;
  const mastered = num(state.masteredCount);
  const learning = num(state.learningCount);
  const due = num(state.dueCount);
  const total = num(state.totalCount);
  return { mastered, learning, due, total };
}

// One-off helper to recompute and fix cardCount if historical data incorrect
export async function recalcLibraryCardCount(libraryId: string): Promise<number> {
  const qCards = query(collection(db, CARDS), where('libraryId', '==', libraryId));
  const snap = await getDocs(qCards);
  await updateDoc(doc(db, LIBRARIES, libraryId), { cardCount: snap.size, updatedAt: serverTimestamp() });
  return snap.size;
}

// -------- Access Requests (private library view -> request access) ----------
// Firestore: access_requests { libraryId, requesterId, ownerId, status: 'pending'|'approved'|'rejected', createdAt }
export interface AccessRequestDoc { id: string; libraryId: string; requesterId: string; ownerId: string; status: 'pending'|'approved'|'rejected'; createdAt: string }

// -------- Notifications ----------
// notifications: { userId, type, title, message, data?, read, createdAt }
export interface NotificationDoc { id: string; userId: string; type: string; title: string; message: string; read: boolean; createdAt: string; data?: Record<string, unknown> }

export async function createNotification(userId: string, input: { type: string; title: string; message: string; data?: Record<string, unknown> }) {
  const now = serverTimestamp();
  await addDoc(collection(db, NOTIFICATIONS), { userId, type: input.type, title: input.title, message: input.message, data: input.data || {}, read: false, createdAt: now });
}

export function listenUserNotifications(cb: (items: NotificationDoc[]) => void) {
  const user = getFirebaseAuth().currentUser; if(!user) throw new Error('Not authenticated');
  const qN = query(collection(db, NOTIFICATIONS), where('userId','==', user.uid));
  return onSnapshot(qN, snap => {
    const arr: NotificationDoc[] = [];
    snap.forEach(d=> { const data = d.data() as { userId: string; type: string; title: string; message: string; read?: boolean; createdAt?: { toMillis?: ()=>number }; data?: Record<string, unknown> };
      arr.push({ id: d.id, userId: data.userId, type: data.type, title: data.title, message: data.message, data: data.data, read: !!data.read, createdAt: data.createdAt?.toMillis? new Date(data.createdAt.toMillis()).toISOString(): '' });
    });
    // newest first
    arr.sort((a,b)=> b.createdAt.localeCompare(a.createdAt));
    cb(arr);
  });
}

export async function markNotificationRead(id: string) {
  await updateDoc(doc(db, NOTIFICATIONS, id), { read: true });
}

export async function markAllNotificationsRead() {
  const user = getFirebaseAuth().currentUser; if(!user) throw new Error('Not authenticated');
  const qN = query(collection(db, NOTIFICATIONS), where('userId','==', user.uid), where('read','==', false), limit(200));
  const snap = await getDocs(qN);
  const batch = writeBatch(db);
  snap.forEach(d=> batch.update(doc(db, NOTIFICATIONS, d.id), { read: true }));
  if(!snap.empty) await batch.commit();
}

export async function createAccessRequest(libraryId: string, ownerId: string): Promise<string> {
  const user = getFirebaseAuth().currentUser; if(!user) throw new Error('Not authenticated');
  // Guard: requester is owner -> no request needed
  if (user.uid === ownerId) return 'owner';
  // Guard: already has a share -> skip creating request
  try {
    const qExistingShare = query(collection(db, SHARES), where('libraryId','==', libraryId), where('targetUserId','==', user.uid), limit(1));
    const shareSnap = await getDocs(qExistingShare);
    if (!shareSnap.empty) return shareSnap.docs[0].id; // indicate access already granted
  } catch {/* ignore share lookup errors */}
  // Check existing pending
  const qReq = query(collection(db, ACCESS_REQUESTS), where('libraryId','==', libraryId), where('requesterId','==', user.uid), where('status','==','pending'), limit(1));
  const snap = await getDocs(qReq); if(!snap.empty) return snap.docs[0].id;
  const ref = await addDoc(collection(db, ACCESS_REQUESTS), { libraryId, requesterId: user.uid, ownerId, status: 'pending', createdAt: serverTimestamp() });
  // Notify owner
  try { await createNotification(ownerId, { type: 'access_request', title: 'Yêu cầu truy cập thư viện', message: `Người dùng yêu cầu truy cập thư viện ${libraryId}`, data: { libraryId, requesterId: user.uid, requestId: ref.id } }); } catch {/* ignore */}
  return ref.id;
}

export async function listAccessRequestsForOwner(): Promise<AccessRequestDoc[]> {
  const user = getFirebaseAuth().currentUser; if(!user) throw new Error('Not authenticated');
  const qOwn = query(collection(db, ACCESS_REQUESTS), where('ownerId','==', user.uid), where('status','==','pending'));
  const snap = await getDocs(qOwn); const arr: AccessRequestDoc[] = [];
  snap.forEach(d=>{ const data = d.data() as { libraryId: string; requesterId: string; ownerId: string; status: 'pending'|'approved'|'rejected'; createdAt?: { toMillis?: ()=>number } };
    arr.push({ id: d.id, libraryId: data.libraryId, requesterId: data.requesterId, ownerId: data.ownerId, status: data.status, createdAt: data.createdAt?.toMillis? new Date(data.createdAt.toMillis()).toISOString(): '' }); });
  return arr;
}

// Realtime pending access requests for current owner user
export function listenPendingAccessRequestsForOwner(cb: (reqs: AccessRequestDoc[]) => void) {
  const user = getFirebaseAuth().currentUser; if(!user) throw new Error('Not authenticated');
  const qOwn = query(collection(db, ACCESS_REQUESTS), where('ownerId','==', user.uid), where('status','==','pending'));
  return onSnapshot(qOwn, snap => {
    const arr: AccessRequestDoc[] = [];
    snap.forEach(d=>{ const data = d.data() as { libraryId: string; requesterId: string; ownerId: string; status: 'pending'|'approved'|'rejected'; createdAt?: { toMillis?: ()=>number } };
      arr.push({ id: d.id, libraryId: data.libraryId, requesterId: data.requesterId, ownerId: data.ownerId, status: data.status, createdAt: data.createdAt?.toMillis? new Date(data.createdAt.toMillis()).toISOString(): '' }); });
    // sort newest first
    arr.sort((a,b)=> b.createdAt.localeCompare(a.createdAt));
    cb(arr);
  });
}

export async function actOnAccessRequest(reqId: string, approve: boolean) {
  // If approved -> create share viewer
  const reqRef = doc(db, ACCESS_REQUESTS, reqId); const snap = await getDoc(reqRef); if(!snap.exists()) return;
  const data = snap.data() as { libraryId: string; requesterId: string; ownerId: string; status: string };
  if (data.status !== 'pending') return;
  if (approve) {
    try { await addShare(data.libraryId, data.requesterId, 'viewer'); } catch {/* ignore duplicate */}
    await updateDoc(reqRef, { status: 'approved', updatedAt: serverTimestamp() });
  try { await createNotification(data.requesterId, { type: 'access_request_approved', title: 'Được chấp nhận', message: `Bạn đã được cấp quyền xem thư viện ${data.libraryId}`, data: { libraryId: data.libraryId } }); } catch {/* ignore */}
  } else {
    await updateDoc(reqRef, { status: 'rejected', updatedAt: serverTimestamp() });
  try { await createNotification(data.requesterId, { type: 'access_request_rejected', title: 'Bị từ chối', message: `Yêu cầu truy cập thư viện ${data.libraryId} bị từ chối`, data: { libraryId: data.libraryId } }); } catch {/* ignore */}
  }
}

export async function listUserAccessRequests(libraryId: string): Promise<AccessRequestDoc[]> {
  const user = getFirebaseAuth().currentUser; if(!user) throw new Error('Not authenticated');
  const qReq = query(collection(db, ACCESS_REQUESTS), where('libraryId','==', libraryId), where('requesterId','==', user.uid));
  const snap = await getDocs(qReq); const arr: AccessRequestDoc[] = [];
  snap.forEach(d=>{ const dat = d.data() as { libraryId: string; requesterId: string; ownerId: string; status: 'pending'|'approved'|'rejected'; createdAt?: { toMillis?: ()=>number } };
    arr.push({ id: d.id, libraryId: dat.libraryId, requesterId: dat.requesterId, ownerId: dat.ownerId, status: dat.status, createdAt: dat.createdAt?.toMillis? new Date(dat.createdAt.toMillis()).toISOString(): '' }); });
  return arr;
}
