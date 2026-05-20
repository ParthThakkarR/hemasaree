// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  mockRedis: {
    incr: vi.fn(),
    expire: vi.fn(),
  },
  mockGetRedisClient: vi.fn(),
}));

vi.mock('@/lib/redis', () => ({ getRedisClient: mocks.mockGetRedisClient }));

const { rateLimit } = await import('@/lib/rate-limit-redis');

describe('rateLimit', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('allows request when Redis unavailable', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    const result = await rateLimit('test-key', 10, 60);
    expect(result.success).toBe(true);
    expect(result.current).toBe(0);
    expect(result.limit).toBe(10);
    expect(result.remaining).toBe(10);
  });

  it('allows request when Redis throws error', async () => {
    mocks.mockGetRedisClient.mockRejectedValue(new Error('Redis error'));
    const result = await rateLimit('test-key', 10, 60);
    expect(result.success).toBe(true);
    expect(result.current).toBe(0);
    expect(result.limit).toBe(10);
    expect(result.remaining).toBe(10);
  });

  it('increments counter in Redis', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    mocks.mockRedis.expire.mockResolvedValue(undefined);

    await rateLimit('test-key', 10, 60);

    expect(mocks.mockRedis.incr).toHaveBeenCalledWith('test-key');
  });

  it('sets expiry on first request', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    mocks.mockRedis.expire.mockResolvedValue(undefined);

    await rateLimit('test-key', 10, 60);

    expect(mocks.mockRedis.expire).toHaveBeenCalledWith('test-key', 60);
  });

  it('does not set expiry on subsequent requests', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(5);
    mocks.mockRedis.expire.mockResolvedValue(undefined);

    await rateLimit('test-key', 10, 60);

    expect(mocks.mockRedis.expire).not.toHaveBeenCalled();
  });

  it('returns success when under limit', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(5);

    const result = await rateLimit('test-key', 10, 60);

    expect(result.success).toBe(true);
  });

  it('returns success when at limit', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(10);

    const result = await rateLimit('test-key', 10, 60);

    expect(result.success).toBe(true);
  });

  it('returns failure when over limit', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(11);

    const result = await rateLimit('test-key', 10, 60);

    expect(result.success).toBe(false);
  });

  it('returns correct current count', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(7);

    const result = await rateLimit('test-key', 10, 60);

    expect(result.current).toBe(7);
  });

  it('returns correct remaining count', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(3);

    const result = await rateLimit('test-key', 10, 60);

    expect(result.remaining).toBe(7);
  });

  it('returns zero remaining when over limit', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(15);

    const result = await rateLimit('test-key', 10, 60);

    expect(result.remaining).toBe(0);
  });

  it('returns correct limit value', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);

    const result = await rateLimit('test-key', 50, 60);

    expect(result.limit).toBe(50);
  });

  it('handles limit of 1', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);

    const result = await rateLimit('test-key', 1, 60);

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('handles limit of 1 exceeded', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(2);

    const result = await rateLimit('test-key', 1, 60);

    expect(result.success).toBe(false);
  });

  it('handles limit of 100', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(50);

    const result = await rateLimit('test-key', 100, 60);

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(50);
  });

  it('handles window of 1 second', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    mocks.mockRedis.expire.mockResolvedValue(undefined);

    await rateLimit('test-key', 10, 1);

    expect(mocks.mockRedis.expire).toHaveBeenCalledWith('test-key', 1);
  });

  it('handles window of 3600 seconds', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    mocks.mockRedis.expire.mockResolvedValue(undefined);

    await rateLimit('test-key', 10, 3600);

    expect(mocks.mockRedis.expire).toHaveBeenCalledWith('test-key', 3600);
  });

  it('handles window of 86400 seconds', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    mocks.mockRedis.expire.mockResolvedValue(undefined);

    await rateLimit('test-key', 10, 86400);

    expect(mocks.mockRedis.expire).toHaveBeenCalledWith('test-key', 86400);
  });

  it('handles complex key', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    mocks.mockRedis.expire.mockResolvedValue(undefined);

    await rateLimit('ratelimit:1.2.3.4:/api/test', 10, 60);

    expect(mocks.mockRedis.incr).toHaveBeenCalledWith('ratelimit:1.2.3.4:/api/test');
  });

  it('handles key with special characters', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    mocks.mockRedis.expire.mockResolvedValue(undefined);

    await rateLimit('key:with:colons:and-dashes', 10, 60);

    expect(mocks.mockRedis.incr).toHaveBeenCalledWith('key:with:colons:and-dashes');
  });

  it('handles empty key', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    mocks.mockRedis.expire.mockResolvedValue(undefined);

    await rateLimit('', 10, 60);

    expect(mocks.mockRedis.incr).toHaveBeenCalledWith('');
  });

  it('returns success true on Redis incr error', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockRejectedValue(new Error('Redis incr error'));

    const result = await rateLimit('test-key', 10, 60);

    expect(result.success).toBe(true);
  });

  it('returns success true on Redis expire error', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    mocks.mockRedis.expire.mockRejectedValue(new Error('Expire error'));

    const result = await rateLimit('test-key', 10, 60);

    expect(result.success).toBe(true);
  });

  it('handles first request correctly', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(1);
    mocks.mockRedis.expire.mockResolvedValue(undefined);

    const result = await rateLimit('test-key', 10, 60);

    expect(result.success).toBe(true);
    expect(result.current).toBe(1);
    expect(result.remaining).toBe(9);
  });

  it('handles exactly at limit', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(10);

    const result = await rateLimit('test-key', 10, 60);

    expect(result.success).toBe(true);
    expect(result.current).toBe(10);
    expect(result.remaining).toBe(0);
  });

  it('handles one over limit', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(11);

    const result = await rateLimit('test-key', 10, 60);

    expect(result.success).toBe(false);
    expect(result.current).toBe(11);
    expect(result.remaining).toBe(0);
  });

  it('handles far over limit', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(100);

    const result = await rateLimit('test-key', 10, 60);

    expect(result.success).toBe(false);
    expect(result.current).toBe(100);
    expect(result.remaining).toBe(0);
  });

  it('returns object with all required properties', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    const result = await rateLimit('test-key', 10, 60);

    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('current');
    expect(result).toHaveProperty('limit');
    expect(result).toHaveProperty('remaining');
  });

  it('returns boolean success', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    const result = await rateLimit('test-key', 10, 60);

    expect(typeof result.success).toBe('boolean');
  });

  it('returns number current', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    const result = await rateLimit('test-key', 10, 60);

    expect(typeof result.current).toBe('number');
  });

  it('returns number limit', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    const result = await rateLimit('test-key', 10, 60);

    expect(typeof result.limit).toBe('number');
  });

  it('returns number remaining', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    const result = await rateLimit('test-key', 10, 60);

    expect(typeof result.remaining).toBe('number');
  });

  it('never returns negative remaining', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.incr.mockResolvedValue(999);

    const result = await rateLimit('test-key', 10, 60);

    expect(result.remaining).toBeGreaterThanOrEqual(0);
  });
});
