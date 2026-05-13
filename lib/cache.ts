import redisClient from './redis';

const DEFAULT_TTL = 3600; // 1 hour

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  },

  async set(key: string, value: any, ttl = DEFAULT_TTL): Promise<void> {
    try {
      const data = JSON.stringify(value);
      await redisClient.set(key, data, { EX: ttl });
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error);
    }
  },

  async delete(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error(`Cache DELETE error for key ${key}:`, error);
    }
  },

  async clearPattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error(`Cache CLEAR error for pattern ${pattern}:`, error);
    }
  },
};
