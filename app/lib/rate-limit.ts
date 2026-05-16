/**
 * In-memory rate limiter for development/fallback use.
 * Uses a proper sliding window with Map-based storage.
 * Not recommended for production without Redis.
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter({
  interval = 60 * 1000, // 1 minute in ms
  uniqueTokenPerInterval = 500,
  maxRequests = 10, // Max requests per interval
}) {
  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const now = Date.now();
        const key = `${token}:${Math.floor(now / interval)}`;
        const record = rateLimitStore.get(key) || { count: 0, resetTime: now + interval };

        // Reset if window expired
        if (now > record.resetTime) {
          record.count = 0;
          record.resetTime = now + interval;
        }

        // Increment before check to prevent race conditions
        record.count++;
        rateLimitStore.set(key, record);

        // Clean up old entries periodically (prevent memory leak)
        if (rateLimitStore.size > uniqueTokenPerInterval * 2) {
          for (const [k, v] of rateLimitStore.entries()) {
            if (now > v.resetTime) rateLimitStore.delete(k);
          }
        }

        if (record.count > limit) {
          reject(new Error('Rate limit exceeded'));
        } else {
          resolve();
        }
      }),
  };
}

