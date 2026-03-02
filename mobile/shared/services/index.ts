import { resolveDataServices } from './provider';

// ── Re-export types ─────────────────────────────────────────────

export type { MobileDataServices } from './contracts';
export type {
  MobileAuthUser,
  IAuthService,
  ILibraryRepository,
  INoteRepository,
  IStudyEventRepository,
  INotificationRepository,
  IUserRepository,
  ITestRepository,
  ICardFlagRepository,
  IGameRepository,
  IDashboardRepository,
} from './contracts';

export { resolveDataServices };

// ── Resolve & destructure ───────────────────────────────────────

const dataServices = resolveDataServices();

export const {
  authService,
  libraryRepository,
  noteRepository,
  studyEventRepository,
  notificationRepository,
  userRepository,
  testRepository,
  cardFlagRepository,
  gameRepository,
  dashboardRepository,
} = dataServices;
