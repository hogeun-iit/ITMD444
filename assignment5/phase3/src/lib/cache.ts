/** In-memory TTL cache (Phase 2 — single-instance friendly). */

type Entry = { exp: number; value: unknown };

const store = new Map<string, Entry>();

export function cacheGet<T>(key: string): T | undefined {
  const e = store.get(key);
  if (!e) return undefined;
  if (Date.now() > e.exp) {
    store.delete(key);
    return undefined;
  }
  return e.value as T;
}

export function cacheSet(key: string, value: unknown, ttlMs: number): void {
  store.set(key, { exp: Date.now() + ttlMs, value });
}

export function cacheDel(key: string): void {
  store.delete(key);
}
