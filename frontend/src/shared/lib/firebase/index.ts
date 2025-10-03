export {
	getFirebaseApp,
	getFirebaseAuth,
	getDb,
	preloadFirestore,
} from './client';

export { FirebaseAuthAdapter } from './auth-adapter';

export {
	createStudyEvent,
	updateStudyEvent,
	deleteStudyEvent,
	getUserStudyEvents,
	listenUserStudyEvents,
	updateStudyEventStatus,
} from './calendar-service';

export type {
	UserFavoriteRecord,
	NotificationDoc,
	AccessRequestDoc,
	UserLibraryProgressDoc,
	CreateLibraryInput,
	CreateCardInput,
} from './library-service';

export {
	createLibrary,
	updateLibrary,
	getLibraryMeta,
	recalcLibraryCardCount,
	listenUserLibraries,
	fetchLibrariesByIds,
	createCard,
	createCardsBulk,
	listCards,
	listCardsPreferCache,
	listenLibraryCards,
	updateCard,
	deleteCard,
	deleteCardsBulk,
	addShare,
	listShares,
	removeShare,
	updateShareRole,
	listenUserSharedLibraries,
	listenCurrentUserShareForLibrary,
	fetchLibraryWithCards,
	fetchLibraryMetaAndShares,
	listenUserFavoriteLibraryIds,
	addFavorite,
	removeFavorite,
	getUserProfile,
	findUserByEmail,
	listenUserNotifications,
	markNotificationRead,
	markAllNotificationsRead,
	createNotification,
	createAccessRequest,
	listenPendingAccessRequestsForOwner,
	actOnAccessRequest,
	listAccessRequestsForOwner,
	listUserAccessRequests,
	getUserLibraryProgress,
	upsertUserLibraryProgress,
	computeBasicProgressStats,
} from './library-service';

export type { ProgressDoc, ProgressSummaryLite } from './progress-service';
export {
	loadProgress,
	saveProgress,
	loadProgressSummary,
	listenProgressSummary,
} from './progress-service';
