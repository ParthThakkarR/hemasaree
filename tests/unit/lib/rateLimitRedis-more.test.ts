// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  mockRedis: { incr: vi.fn(), expire: vi.fn() },
  mockGetRedisClient: vi.fn(),
}));

vi.mock('@/lib/redis', () => ({ getRedisClient: mocks.mockGetRedisClient }));

describe('rateLimitRedis - Allowed Through', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it('allows request under limit', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 10, 60);
    expect(result.success).toBe(true);
  });

  it('allows request at exact limit', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(10);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 10, 60);
    expect(result.success).toBe(true);
  });

  it('blocks request over limit', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(11);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 10, 60);
    expect(result.success).toBe(false);
  });

  it('returns correct current count', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(5);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 10, 60);
    expect(result.current).toBe(5);
  });

  it('returns correct limit', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 10, 60);
    expect(result.limit).toBe(10);
  });

  it('returns correct remaining when under limit', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(3);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 10, 60);
    expect(result.remaining).toBe(7);
  });

  it('returns 0 remaining when at limit', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(10);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 10, 60);
    expect(result.remaining).toBe(0);
  });

  it('returns 0 remaining when over limit', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(15);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 10, 60);
    expect(result.remaining).toBe(0);
  });

  it('sets expiry on first request', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    await rateLimit('key', 10, 60);
    expect(mocks.mockRedis.expire).toHaveBeenCalledWith('key', 60);
  });

  it('does not set expiry on subsequent requests', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(5);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    await rateLimit('key', 10, 60);
    expect(mocks.mockRedis.expire).not.toHaveBeenCalled();
  });

  it('allows when Redis unavailable', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 10, 60);
    expect(result.success).toBe(true);
  });

  it('returns limit as remaining when Redis unavailable', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 10, 60);
    expect(result.remaining).toBe(10);
  });

  it('returns current 0 when Redis unavailable', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 10, 60);
    expect(result.current).toBe(0);
  });

  it('allows when Redis throws', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockRejectedValue(new Error('Redis error'));
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 10, 60);
    expect(result.success).toBe(true);
  });

  it('returns limit as remaining when Redis throws', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockRejectedValue(new Error('Redis error'));
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 10, 60);
    expect(result.remaining).toBe(10);
  });

  it('uses correct key for incr', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    await rateLimit('mykey', 10, 60);
    expect(mocks.mockRedis.incr).toHaveBeenCalledWith('mykey');
  });

  it('handles limit of 1', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 1, 60);
    expect(result.success).toBe(true);
  });

  it('blocks when limit is 1 and count is 2', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(2);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 1, 60);
    expect(result.success).toBe(false);
  });

  it('handles limit of 100', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(50);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 100, 60);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(50);
  });

  it('handles limit of 1000', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(999);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 1000, 60);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it('handles window of 1 second', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    await rateLimit('key', 10, 1);
    expect(mocks.mockRedis.expire).toHaveBeenCalledWith('key', 1);
  });

  it('handles window of 3600 seconds', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    await rateLimit('key', 10, 3600);
    expect(mocks.mockRedis.expire).toHaveBeenCalledWith('key', 3600);
  });

  it('handles window of 86400 seconds', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    await rateLimit('key', 10, 86400);
    expect(mocks.mockRedis.expire).toHaveBeenCalledWith('key', 86400);
  });

  it('handles empty key', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('', 10, 60);
    expect(result.success).toBe(true);
  });

  it('handles key with special chars', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key:with:special:chars', 10, 60);
    expect(result.success).toBe(true);
  });

  it('handles unicode key', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('साड़ी', 10, 60);
    expect(result.success).toBe(true);
  });

  it('handles very long key', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('a'.repeat(1000), 10, 60);
    expect(result.success).toBe(true);
  });

  it('handles limit of 0', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 0, 60);
    expect(result.success).toBe(false);
  });

  it('handles negative limit', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', -5, 60);
    expect(result.success).toBe(false);
  });

  it('handles negative window', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 10, -60);
    expect(result.success).toBe(true);
  });

  it('handles window of 0', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 10, 0);
    expect(result.success).toBe(true);
  });

  it('returns remaining as Math.max(0, limit - current)', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(20);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 10, 60);
    expect(result.remaining).toBe(0);
  });

  it('handles concurrent requests simulation', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    mocks.mockRedis.incr.mockResolvedValue(1);
    const r1 = await rateLimit('key', 10, 60);
    expect(r1.success).toBe(true);
    mocks.mockRedis.incr.mockResolvedValue(10);
    const r2 = await rateLimit('key', 10, 60);
    expect(r2.success).toBe(true);
    mocks.mockRedis.incr.mockResolvedValue(11);
    const r3 = await rateLimit('key', 10, 60);
    expect(r3.success).toBe(false);
  });

  it('handles large current count', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(999999);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 100, 60);
    expect(result.success).toBe(false);
    expect(result.current).toBe(999999);
    expect(result.remaining).toBe(0);
  });

  it('handles expire error gracefully', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    mocks.mockRedis.expire.mockRejectedValue(new Error('Expire failed'));
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 10, 60);
    expect(result.success).toBe(true);
  });

  it('handles getRedisClient returning undefined', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(undefined);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 10, 60);
    expect(result.success).toBe(true);
  });

  it('handles getRedisClient throwing', async () => {
    mocks.mockGetRedisClient.mockRejectedValue(new Error('Connection failed'));
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 10, 60);
    expect(result.success).toBe(true);
  });

  it('returns correct shape', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    const { rateLimit } = await import('@/lib/rate-limit-redis');
    const result = await rateLimit('key', 10, 60);
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('current');
    expect(result).toHaveProperty('limit');
    expect(result).toHaveProperty('remaining');
  });
});
