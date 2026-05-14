import { getRedisClient } from './redis';

const DEFAULT_TTL = 3600; // 1 hour

/**
 * Simple in-memory fallback cache used when Redis is unavailable (e.g. Vercel).
 * Not shared across serverless instances — acceptable for short-lived cache hits.
 */
const memoryStore = new Map<string, { value: string; expiresAt: number }>();

function memGet(key: string): string | null {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
}

function memSet(key: string, value: string, ttlSeconds: number): void {
  memoryStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

function memDel(key: string): void {
  memoryStore.delete(key);
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const redis = await getRedisClient();
      if (redis) {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
      }
      // Fallback to in-memory
      const data = memGet(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  },

  async set(key: string, value: any, ttl = DEFAULT_TTL): Promise<void> {
    try {
      const data = JSON.stringify(value);
      const redis = await getRedisClient();
      if (redis) {
        await redis.set(key, data, { EX: ttl });
      } else {
        memSet(key, data, ttl);
      }
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error);
    }
  },

  async delete(key: string): Promise<void> {
    try {
      const redis = await getRedisClient();
      if (redis) {
        await redis.del(key);
      } else {
        memDel(key);
      }
    } catch (error) {
      console.error(`Cache DELETE error for key ${key}:`, error);
    }
  },

  async clearPattern(pattern: string): Promise<void> {
    try {
      const redis = await getRedisClient();
      if (redis) {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(keys);
        }
      } else {
        // Crude pattern match for in-memory store
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        for (const key of memoryStore.keys()) {
          if (regex.test(key)) {
            memoryStore.delete(key);
          }
        }
      }
    } catch (error) {
      console.error(`Cache CLEAR error for pattern ${pattern}:`, error);
    }
  },
};
