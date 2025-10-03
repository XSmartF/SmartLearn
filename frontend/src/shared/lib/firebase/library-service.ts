// Facade file replacing legacy monolith. All previous function names are preserved
// but internally delegate to repository instances for maintainability.
// This allows incremental migration: existing imports keep working.

import type { LibraryMeta, LibraryVisibility, Card as EngineCard, ShareRole, LibraryShare } from '@/shared/lib/models';
import { cardRepository } from '@/shared/lib/repositories/CardRepository';
import { shareRepository } from '@/shared/lib/repositories/ShareRepository';
import { userRepository } from '@/shared/lib/repositories/UserRepository';
import type { NotificationDoc, AccessRequestDoc, UserFavoriteRecord } from '@/shared/lib/repositories/UserRepository';
import { progressRepository } from '@/shared/lib/repositories/ProgressRepository';
import type { UserLibraryProgressDoc } from '@/shared/lib/repositories/ProgressRepository';
import { cached } from '@/shared/lib/cache';

// Re-export legacy input types (mirror original interfaces)
export type { UserFavoriteRecord, NotificationDoc, AccessRequestDoc, UserLibraryProgressDoc };
export interface CreateLibraryInput { title: string; description?: string; subject?: string; difficulty?: string; tags?: string[]; visibility?: LibraryVisibility }
export interface CreateCardInput { libraryId: string; front: string; back: string; domain?: string; difficulty?: 'easy'|'medium'|'hard' }

// Library CRUD & meta
export const createLibrary = async (input: CreateLibraryInput) => {
  const { libraryRepository } = await import('@/shared/lib/repositories/LibraryRepository');
  return libraryRepository.createLibrary(input);
};
export const updateLibrary = async (id: string, data: { title?: string; description?: string; visibility?: LibraryVisibility; tags?: string[]; subject?: string; difficulty?: string }) => {
  const { libraryRepository } = await import('@/shared/lib/repositories/LibraryRepository');
  return libraryRepository.updateLibrary(id, data);
};
export const getLibraryMeta = async (id: string) => {
  const { libraryRepository } = await import('@/shared/lib/repositories/LibraryRepository');
  return libraryRepository.getLibraryMeta(id);
};
export const recalcLibraryCardCount = async (libraryId: string) => {
  const { libraryRepository } = await import('@/shared/lib/repositories/LibraryRepository');
  return libraryRepository.recalcLibraryCardCount(libraryId);
};
export const listenUserLibraries = (cb: (libs: LibraryMeta[]) => void) => {
  import('@/shared/lib/repositories/LibraryRepository').then(({ libraryRepository }) => {
    libraryRepository.listenUserLibraries(cb);
  });
};
export const fetchLibrariesByIds = async (ids: string[]) => {
  const { libraryRepository } = await import('@/shared/lib/repositories/LibraryRepository');
  return libraryRepository.fetchLibrariesByIds(ids);
};

// Cards
export const createCard = async (input: CreateCardInput) => {
  const { libraryRepository } = await import('@/shared/lib/repositories/LibraryRepository');
  return libraryRepository.createCard(input);
};
export const createCardsBulk = async (libraryId: string, items: { front: string; back: string; domain?: string }[]) => {
  const { libraryRepository } = await import('@/shared/lib/repositories/LibraryRepository');
  return libraryRepository.createCardsBulk(libraryId, items);
};
export const listCards = (libraryId: string) => cardRepository.listCards(libraryId);
export const listCardsPreferCache = (libraryId: string) => cardRepository.listCardsPreferCache(libraryId);
export const listenLibraryCards = (libraryId: string, cb: (cards: EngineCard[]) => void) => cardRepository.listenLibraryCards(libraryId, cb);
export const updateCard = (cardId: string, data: { front?: string; back?: string; domain?: string | null; difficulty?: 'easy' | 'medium' | 'hard' | null }) => cardRepository.updateCard(cardId, data);
export const deleteCard = (cardId: string) => cardRepository.deleteCard(cardId);
export const deleteCardsBulk = (cardIds: string[]) => cardRepository.deleteCardsBulk(cardIds);

// Shares
export const addShare = (libraryId: string, targetUserId: string, role: ShareRole) => shareRepository.addShare(libraryId, targetUserId, role);
export const listShares = (libraryId: string) => shareRepository.listShares(libraryId);
export const removeShare = (shareId: string) => shareRepository.removeShare(shareId);
export const updateShareRole = (shareId: string, role: ShareRole) => shareRepository.updateShareRole(shareId, role);
export const listenUserSharedLibraries = (cb: (shares: { libraryId: string; role: ShareRole }[]) => void) => shareRepository.listenUserSharedLibraries(cb);
export const listenCurrentUserShareForLibrary = (libraryId: string, cb: (share: { id: string; role: ShareRole } | null) => void) => shareRepository.listenCurrentUserShareForLibrary(libraryId, cb);

// Combined meta + cards (retain legacy helper) using existing cache keys
export async function fetchLibraryWithCards(libraryId: string, opts: { preferCache?: boolean } = {}): Promise<{ meta: LibraryMeta | null; cards: EngineCard[] }> {
  const metaPromise = cached([`library:${libraryId}`], async () => {
    const { libraryRepository } = await import('@/shared/lib/repositories/LibraryRepository');
    return libraryRepository.getLibraryMeta(libraryId);
  });
  const listFn = opts.preferCache ? listCardsPreferCache : listCards;
  const cardsPromise = cached([`cards:${libraryId}`, opts.preferCache ? 'prefer' : 'direct'], () => listFn(libraryId));
  const [meta, cards] = await Promise.all([metaPromise, cardsPromise]);
  return { meta, cards };
}

export async function fetchLibraryMetaAndShares(libraryId: string): Promise<{ meta: LibraryMeta | null; shares: LibraryShare[] }> {
  const meta = await cached([`library:${libraryId}`], async () => {
    const { libraryRepository } = await import('@/shared/lib/repositories/LibraryRepository');
    return libraryRepository.getLibraryMeta(libraryId);
  });
  if(!meta) return { meta: null, shares: [] };
  let shares: LibraryShare[] = [];
  if(meta.visibility === 'private') { try { shares = await listShares(libraryId); } catch { /* ignore */ } }
  return { meta, shares };
}

// Favorites & user profile
export const listenUserFavoriteLibraryIds = (cb: (ids: string[]) => void) => userRepository.listenUserFavoriteLibraryIds(cb);
export const addFavorite = (libraryId: string) => userRepository.addFavorite(libraryId);
export const removeFavorite = (libraryId: string) => userRepository.removeFavorite(libraryId);
export const getUserProfile = (userId: string) => userRepository.getUserProfile(userId);
export const findUserByEmail = (email: string) => userRepository.findUserByEmail(email);

// Notifications
export const listenUserNotifications = (cb: (items: NotificationDoc[]) => void) => userRepository.listenUserNotifications(cb);
export const markNotificationRead = (id: string) => userRepository.markNotificationRead(id);
export const markAllNotificationsRead = () => userRepository.markAllNotificationsRead();
export const createNotification = (userId: string, input: { type: string; title: string; message: string; data?: Record<string, unknown> }) => userRepository.createNotification(userId, input);

// Access requests
export const createAccessRequest = (libraryId: string, ownerId: string) => userRepository.createAccessRequest(libraryId, ownerId);
export const listenPendingAccessRequestsForOwner = (cb: (reqs: AccessRequestDoc[]) => void) => userRepository.listenPendingAccessRequestsForOwner(cb);
export const actOnAccessRequest = (reqId: string, approve: boolean) => userRepository.actOnAccessRequest(reqId, approve);
export const listAccessRequestsForOwner = () => userRepository.listAccessRequestsForOwner();
export const listUserAccessRequests = (libraryId: string) => userRepository.listUserAccessRequests(libraryId);

// Progress
export const getUserLibraryProgress = (libraryId: string) => progressRepository.getUserLibraryProgress(libraryId);
export const upsertUserLibraryProgress = (libraryId: string, engineState: Record<string, unknown>) => progressRepository.upsertUserLibraryProgress(libraryId, engineState);
export const computeBasicProgressStats = (libraryId: string) => progressRepository.computeBasicProgressStats(libraryId);

// End facade
