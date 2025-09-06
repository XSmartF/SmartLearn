// Dynamically import Firestore functions per method.
import { getDb, getFirebaseAuth } from '@/shared/lib/firebaseClient';
import type { ShareRole, LibraryShare } from '@/shared/lib/models';
import { invalidateCache, cached } from '@/shared/lib/cache';

const SHARES = 'shares';
const db = getDb();
let _fsMod: Promise<typeof import('firebase/firestore')> | null = null;
function fs() { return _fsMod ??= import('firebase/firestore'); }

export class ShareRepository {
  async addShare(libraryId: string, targetUserId: string, role: ShareRole) {
    const user = getFirebaseAuth().currentUser; if(!user) throw new Error('Not authenticated');
    const { addDoc, collection, serverTimestamp } = await fs();
    await addDoc(collection(db, SHARES), { libraryId, targetUserId, role, grantedBy: user.uid, createdAt: serverTimestamp() });
    invalidateCache(`shares:${libraryId}`);
  }
  async listShares(libraryId: string): Promise<LibraryShare[]> {
    return cached([`shares:${libraryId}`], async () => {
      const { query, collection, where, getDocs } = await fs();
      const qShares = query(collection(db, SHARES), where('libraryId','==', libraryId));
      const snap = await getDocs(qShares); const shares: LibraryShare[] = [];
      snap.forEach(s=> { const d = s.data() as { libraryId: string; grantedBy: string; targetUserId: string; role: ShareRole | 'editor'; createdAt?: { toMillis?: () => number } }; const legacyRole = d.role as unknown as string; const mappedRole = (legacyRole === 'editor' ? 'contributor' : legacyRole) as ShareRole; shares.push({ id: s.id, libraryId: d.libraryId, grantedBy: d.grantedBy, targetUserId: d.targetUserId, role: mappedRole, createdAt: d.createdAt?.toMillis ? new Date(d.createdAt.toMillis()).toISOString() : '' }); });
      return shares;
    });
  }
  async removeShare(shareId: string) { const { deleteDoc, doc } = await fs(); await deleteDoc(doc(db, SHARES, shareId)); invalidateCache('shares:'); }
  async updateShareRole(shareId: string, role: ShareRole) { const { updateDoc, doc } = await fs(); await updateDoc(doc(db, SHARES, shareId), { role }); invalidateCache('shares:'); }

  listenUserSharedLibraries(cb: (shares: { libraryId: string; role: ShareRole }[]) => void) {
    const user = getFirebaseAuth().currentUser; if(!user) throw new Error('Not authenticated');
    let unsub: (()=>void) | null = null; let cancelled = false;
    fs().then(({ query, collection, where, onSnapshot }) => {
      if(cancelled) return;
      const qShared = query(collection(db, SHARES), where('targetUserId','==', user.uid));
      unsub = onSnapshot(qShared, snap => { const arr: { libraryId: string; role: ShareRole }[] = []; snap.forEach(ds => { const d = ds.data() as { libraryId?: string; role?: ShareRole | 'editor' }; if(d.libraryId && d.role) arr.push({ libraryId: d.libraryId, role: (d.role === 'editor' ? 'contributor' : d.role) as ShareRole }); }); cb(arr); });
    });
    return () => { cancelled = true; if(unsub) unsub(); };
  }
  listenCurrentUserShareForLibrary(libraryId: string, cb: (share: { id: string; role: ShareRole } | null) => void) {
    const user = getFirebaseAuth().currentUser; if(!user) throw new Error('Not authenticated');
    let unsub: (()=>void) | null = null; let cancelled = false;
    fs().then(({ query, collection, where, onSnapshot }) => {
      if(cancelled) return;
      const qShare = query(collection(db, SHARES), where('libraryId','==', libraryId), where('targetUserId','==', user.uid));
      unsub = onSnapshot(qShare, snap => { if(snap.empty) { cb(null); return; } const d = snap.docs[0].data() as { role: ShareRole | 'editor' }; cb({ id: snap.docs[0].id, role: (d.role === 'editor' ? 'contributor' : d.role) as ShareRole }); });
    });
    return () => { cancelled = true; if(unsub) unsub(); };
  }
}

export const shareRepository = new ShareRepository();
