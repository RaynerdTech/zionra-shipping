type CacheEntry = {
  value: unknown;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<unknown>>();
const keyGenerations = new Map<string, number>();
let cacheGeneration = 0;

export function readMemoryCache<T>(key: string): T | undefined {
  return cache.get(key)?.value as T | undefined;
}

export function isMemoryCacheFresh(key: string) {
  const entry = cache.get(key);
  return Boolean(entry && entry.expiresAt > Date.now());
}

export function writeMemoryCache<T>(key: string, value: T, ttlMs: number) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function invalidateMemoryCache(key: string) {
  keyGenerations.set(key, (keyGenerations.get(key) ?? 0) + 1);
  const entry = cache.get(key);
  if (entry) entry.expiresAt = 0;
}

export function clearMemoryCache(prefix?: string) {
  cacheGeneration += 1;
  if (!prefix) {
    cache.clear();
    inFlight.clear();
    keyGenerations.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
  for (const key of inFlight.keys()) {
    if (key.startsWith(prefix)) inFlight.delete(key);
  }
  for (const key of keyGenerations.keys()) {
    if (key.startsWith(prefix)) keyGenerations.delete(key);
  }
}

export function fetchMemoryCached<T>(
  key: string,
  loader: () => Promise<T>,
  ttlMs: number,
): Promise<T> {
  if (isMemoryCacheFresh(key)) {
    return Promise.resolve(readMemoryCache<T>(key) as T);
  }

  const existing = inFlight.get(key);
  if (existing) return existing as Promise<T>;

  const requestGeneration = cacheGeneration;
  const requestKeyGeneration = keyGenerations.get(key) ?? 0;
  const request = loader()
    .then((value) => {
      if (
        requestGeneration === cacheGeneration &&
        requestKeyGeneration === (keyGenerations.get(key) ?? 0)
      ) {
        writeMemoryCache(key, value, ttlMs);
      }
      return value;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, request);
  return request;
}
