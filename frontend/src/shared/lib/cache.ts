// Lightweight in-memory + sessionStorage cache helpers for Firebase data
// Goals: reduce duplicate reads, share across hooks, simple TTL invalidation.
// Design pattern: Repository layer fetches raw data; cache module wraps repository get* calls.

export interface CacheEntry<T> { value: T; expires: number }
const memoryCache = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL = 30_000; // 30s default

function now() { return Date.now(); }

function makeKey(parts: unknown[]) { return parts.join(':'); }

export function cacheGet<T>(key: string): T | undefined {
  const entry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (entry.expires < now()) { memoryCache.delete(key); return undefined; }
  return entry.value;
}

export function cacheSet<T>(key: string, value: T, ttl = DEFAULT_TTL) {
  memoryCache.set(key, { value, expires: now() + ttl });
}

export async function cached<T>(keyParts: unknown[], loader: () => Promise<T>, ttl?: number): Promise<T> {
  const key = makeKey(keyParts);
  const hit = cacheGet<T>(key);
  if (hit !== undefined) return hit;
  const value = await loader();
  cacheSet(key, value, ttl);
  return value;
}

// Simple event-based invalidation for mutations
const listeners = new Set<(pattern?: string) => void>();
export function onCacheInvalidated(cb: (pattern?: string) => void) { listeners.add(cb); return () => listeners.delete(cb); }
export function invalidateCache(prefix?: string) {
  for (const k of Array.from(memoryCache.keys())) {
    if (!prefix || k.startsWith(prefix)) memoryCache.delete(k);
  }
  listeners.forEach(l => l(prefix));
}
