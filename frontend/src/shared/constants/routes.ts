// Route constants for the application
// Centralize all route paths here to make them easy to manage and update
//
// USAGE:
// - Import: import { ROUTES, getLibraryDetailPath } from '@/shared/constants/routes'
// - Static routes: ROUTES.HOME, ROUTES.LOGIN, etc.
// - Dynamic routes: getLibraryDetailPath(id), getStudyPath(id), etc.
// - Examples:
//   - getLibraryDetailPath('123') => '/library/123'
//   - getStudyPath('456') => '/study/456'
//
// BENEFITS:
// - Single source of truth for all routes
// - Easy to update paths across the entire app
// - Type safety with TypeScript
// - Centralized route management

export const ROUTES = {
  // Auth routes
  LOGIN: '/login',

  // Main app routes
  HOME: '/',
  DASHBOARD: '/',

  // Library routes
  MY_LIBRARY: '/my-library',
  LIBRARY_DETAIL: '/library/:id',

  // Study routes
  STUDY: '/study/:id',
  CALENDAR: '/calendar',

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
export const getTestSetupPath = (id: string) => ROUTES.TEST_SETUP.replace(':id', id);
export const getTestPath = (id: string) => ROUTES.TEST.replace(':id', id);

// Type for route keys
export type RouteKey = keyof typeof ROUTES;
