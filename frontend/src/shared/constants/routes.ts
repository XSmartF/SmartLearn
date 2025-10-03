
export const ROUTES = {
  // Auth routes
  LOGIN: '/login',

  // Main app routes
  HOME: '/',
  DASHBOARD: '/',

  // Library routes
  MY_LIBRARY: '/my-library',
  LIBRARY_DETAIL: '/library/:id',

  // Notes routes
  NOTES: '/notes',
  NOTE_DETAIL: '/notes/:id',

  // Study routes
  STUDY: '/study/:id',
  REVIEW: '/review',
  CALENDAR: '/calendar',

  // Games routes
  GAMES: '/games',
  MEMORY_GAME: '/games/memory/play',
  MEMORY_SETTINGS: '/games/memory/settings',
  QUIZ_GAME: '/games/quiz/play',
  QUIZ_SETTINGS: '/games/quiz/settings',
  SPEED_GAME: '/games/speed/play',
  SPEED_SETTINGS: '/games/speed/settings',
  TRUE_FALSE_GAME: '/games/true-false/play',
  TRUE_FALSE_SETTINGS: '/games/true-false/settings',
  FILL_BLANK_GAME: '/games/fill-blank/play',
  FILL_BLANK_SETTINGS: '/games/fill-blank/settings',
  WORD_SCRAMBLE_GAME: '/games/word-scramble/play',
  WORD_SCRAMBLE_SETTINGS: '/games/word-scramble/settings',
  MATCHING_GAME: '/games/matching/play',
  MATCHING_SETTINGS: '/games/matching/settings',
  SPELLING_BEE_GAME: '/games/spelling-bee/play',
  SPELLING_BEE_SETTINGS: '/games/spelling-bee/settings',
  GAME_SETTINGS: '/games/:gameId/settings',

  // Test routes
  TEST_SETUP: '/test-setup/:id',
  TEST: '/test/:id',
  TEST_ERROR: '/test-error',

  // Other routes
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  PROFILE: '/profile',

  // Legacy routes
  OLD_DASHBOARD: '/old',

  // Special routes
  NOT_FOUND: '*',
} as const;

// Helper functions for dynamic routes
export const getLibraryDetailPath = (id: string) => ROUTES.LIBRARY_DETAIL.replace(':id', id);
export const getStudyPath = (id: string) => ROUTES.STUDY.replace(':id', id);
export const getNoteDetailPath = (id: string) => ROUTES.NOTE_DETAIL.replace(':id', id);
export const getTestSetupPath = (id: string) => ROUTES.TEST_SETUP.replace(':id', id);
export const getTestPath = (id: string) => ROUTES.TEST.replace(':id', id);

// Type for route keys
export type RouteKey = keyof typeof ROUTES;
