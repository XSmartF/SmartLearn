// Generic query result shape used across custom hooks
export interface QueryResult<T, E = unknown> {
  data: T;
  loading: boolean;
  error: E | null;
}

// Helper for combining with legacy named fields
export type WithLegacy<T, L extends Record<string, unknown>> = T & L;
