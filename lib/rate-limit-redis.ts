import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

if (!redisClient.isOpen) {
  redisClient.connect().catch(console.error);
}

export async function rateLimit(key: string, limit: number, windowInSeconds: number) {
  try {
    const current = await redisClient.incr(key);
    
    if (current === 1) {
      await redisClient.expire(key, windowInSeconds);
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
