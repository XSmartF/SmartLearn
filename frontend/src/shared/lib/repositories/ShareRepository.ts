import { getDb, getFirebaseAuth } from '@/shared/lib/firebase/client';
import type { ShareRole, LibraryShare } from '@/shared/lib/models';
import type { IShareRepository } from '@/shared/services/contracts';
import { invalidateCache, cached } from '@/shared/lib/cache';
import {
  addDoc, collection, serverTimestamp, query, where,
  getDocs, deleteDoc, doc, updateDoc, onSnapshot,
} from 'firebase/firestore';

const SHARES = 'shares';
const db = getDb();

/** Normalize legacy 'editor' role to 'contributor'. */
function normalizeRole(role: string): ShareRole {
  return (role === 'editor' ? 'contributor' : role) as ShareRole;
}

export class ShareRepository implements IShareRepository {
  async addShare(libraryId: string, targetUserId: string, role: ShareRole) {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');
    await addDoc(collection(db, SHARES), {
      libraryId, targetUserId, role,
      grantedBy: user.uid,
      createdAt: serverTimestamp(),
    });
    invalidateCache(`shares:${libraryId}`);
  }

  async listShares(libraryId: string): Promise<LibraryShare[]> {
    return cached([`shares:${libraryId}`], async () => {
      const q = query(collection(db, SHARES), where('libraryId', '==', libraryId));
      const snap = await getDocs(q);
      const shares: LibraryShare[] = [];
      snap.forEach(s => {
        const d = s.data() as {
          libraryId: string; grantedBy: string; targetUserId: string;
          role: ShareRole | 'editor'; createdAt?: { toMillis?: () => number };
        };
        shares.push({
          id: s.id,
          libraryId: d.libraryId,
          grantedBy: d.grantedBy,
          targetUserId: d.targetUserId,
          role: normalizeRole(d.role),
          createdAt: d.createdAt?.toMillis ? new Date(d.createdAt.toMillis()).toISOString() : '',
        });
      });
      return shares;
    });
  }

  async removeShare(shareId: string) {
    await deleteDoc(doc(db, SHARES, shareId));
    invalidateCache('shares:');
  }

  async updateShareRole(shareId: string, role: ShareRole) {
    await updateDoc(doc(db, SHARES, shareId), { role });
    invalidateCache('shares:');
  }

  listenUserSharedLibraries(cb: (shares: { libraryId: string; role: ShareRole }[]) => void) {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    let unsub: (() => void) | null = null;
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      const q = query(collection(db, SHARES), where('targetUserId', '==', user.uid));
      unsub = onSnapshot(q, snap => {
        const arr: { libraryId: string; role: ShareRole }[] = [];
        snap?.forEach(s => {
          const d = s.data() as { libraryId?: string; role?: ShareRole | 'editor' };
          if (d.libraryId && d.role) {
            arr.push({ libraryId: d.libraryId, role: normalizeRole(d.role) });
          }
        });
        cb(arr);
      });
    })();
    return () => { cancelled = true; unsub?.(); };
  }

  listenCurrentUserShareForLibrary(libraryId: string, cb: (share: { id: string; role: ShareRole } | null) => void) {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Not authenticated');

    let unsub: (() => void) | null = null;
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      const q = query(collection(db, SHARES), where('libraryId', '==', libraryId), where('targetUserId', '==', user.uid));
      unsub = onSnapshot(q, snap => {
        if (!snap || snap.empty) { cb(null); return; }
        const d = snap.docs[0].data() as { role: ShareRole | 'editor' };
        cb({ id: snap.docs[0].id, role: normalizeRole(d.role) });
      });
    })();
    return () => { cancelled = true; unsub?.(); };
  }
}

export const shareRepository = new ShareRepository();
