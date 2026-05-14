import { getRedisClient } from './redis';

/**
 * Redis-backed rate limiter with automatic fallback.
 * When Redis is unavailable (e.g. on Vercel), requests are allowed through
 * to avoid blocking legitimate traffic.
 */
export async function rateLimit(key: string, limit: number, windowInSeconds: number) {
  try {
    const redis = await getRedisClient();

    if (!redis) {
      // No Redis available — allow the request through
      return { success: true, current: 0, limit, remaining: limit };
    }

    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, windowInSeconds);
    }

    return {
      success: current <= limit,
      current,
      limit,
      remaining: Math.max(0, limit - current),
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fallback to allow request if Redis is down
    return { success: true, current: 0, limit, remaining: limit };
  }
}
