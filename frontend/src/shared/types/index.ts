// Barrel export for all shared domain types

export type {
  UserFavoriteRecord,
  NotificationDoc,
  AccessRequestDoc,
  UserSettings,
  UserSettingsUpdate,
} from './user';

export {
  defaultUserSettings,
  mergeUserSettings,
} from './user';

export type {
  CreateNoteInput,
  UpdateNoteInput,
} from './note';

export type {
  CreateLibraryInput,
  CreateCardInput,
} from './library';

export type {
  UserLibraryProgressDoc,
  UserLibraryProgressSummary,
  ProgressSummaryLite,
} from './progress';

export type {
  CardFlagDoc,
  CardFlag,
  FlagMap,
} from './card-flag';

export type {
  QueryResult,
  WithLegacy,
} from './query';
