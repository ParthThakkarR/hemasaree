// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rateLimit } from '@/lib/rate-limit-redis';

const mocks = vi.hoisted(() => ({
  mockRedis: { incr: vi.fn(), expire: vi.fn() },
  mockGetRedisClient: vi.fn(),
}));

vi.mock('@/lib/redis', () => ({ getRedisClient: mocks.mockGetRedisClient }));

describe('rateLimit - Extended', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('Redis unavailable', () => {
    it('allows request when Redis returns null', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(null);
      const result = await rateLimit('key1', 5, 60);
      expect(result.success).toBe(true);
    });

    it('returns current=0 when Redis unavailable', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(null);
      const result = await rateLimit('key1', 5, 60);
      expect(result.current).toBe(0);
    });

    it('returns correct limit when Redis unavailable', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(null);
      const result = await rateLimit('key1', 10, 60);
      expect(result.limit).toBe(10);
    });

    it('returns correct remaining when Redis unavailable', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(null);
      const result = await rateLimit('key1', 10, 60);
      expect(result.remaining).toBe(10);
    });

    it('allows request when Redis returns undefined', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(undefined);
      const result = await rateLimit('key1', 5, 60);
      expect(result.success).toBe(true);
    });

    it('handles limit of 1 when Redis unavailable', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(null);
      const result = await rateLimit('key1', 1, 60);
      expect(result.success).toBe(true);
      expect(result.limit).toBe(1);
    });

    it('handles large limit when Redis unavailable', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(null);
      const result = await rateLimit('key1', 10000, 60);
      expect(result.success).toBe(true);
      expect(result.limit).toBe(10000);
    });

    it('handles window of 1 when Redis unavailable', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(null);
      const result = await rateLimit('key1', 5, 1);
      expect(result.success).toBe(true);
    });

    it('handles window of 86400 when Redis unavailable', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(null);
      const result = await rateLimit('key1', 5, 86400);
      expect(result.success).toBe(true);
    });

    it('handles window of 0 when Redis unavailable', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(null);
      const result = await rateLimit('key1', 5, 0);
      expect(result.success).toBe(true);
    });
  });

  describe('Redis available', () => {
    it('increments counter', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1);
      await rateLimit('key1', 5, 60);
      expect(mocks.mockRedis.incr).toHaveBeenCalledWith('key1');
    });

    it('sets expiry on first request', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1);
      await rateLimit('key1', 5, 60);
      expect(mocks.mockRedis.expire).toHaveBeenCalledWith('key1', 60);
    });

    it('does not set expiry on subsequent requests', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(2);
      await rateLimit('key1', 5, 60);
      expect(mocks.mockRedis.expire).not.toHaveBeenCalled();
    });

    it('returns success when under limit', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(3);
      const result = await rateLimit('key1', 5, 60);
      expect(result.success).toBe(true);
    });

    it('returns success when at limit', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(5);
      const result = await rateLimit('key1', 5, 60);
      expect(result.success).toBe(true);
    });

    it('returns failure when over limit', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(6);
      const result = await rateLimit('key1', 5, 60);
      expect(result.success).toBe(false);
    });

    it('returns correct current count', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(3);
      const result = await rateLimit('key1', 5, 60);
      expect(result.current).toBe(3);
    });

    it('returns correct remaining count', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(3);
      const result = await rateLimit('key1', 5, 60);
      expect(result.remaining).toBe(2);
    });

    it('returns 0 remaining when at limit', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(5);
      const result = await rateLimit('key1', 5, 60);
      expect(result.remaining).toBe(0);
    });

    it('caps remaining at 0 when over limit', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(10);
      const result = await rateLimit('key1', 5, 60);
      expect(result.remaining).toBe(0);
    });

    it('handles limit of 1', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1);
      const result = await rateLimit('key1', 1, 60);
      expect(result.success).toBe(true);
    });

    it('blocks second request with limit of 1', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(2);
      const result = await rateLimit('key1', 1, 60);
      expect(result.success).toBe(false);
    });

    it('handles large limit', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1000);
      const result = await rateLimit('key1', 10000, 60);
      expect(result.success).toBe(true);
    });

    it('handles short window', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1);
      await rateLimit('key1', 5, 1);
      expect(mocks.mockRedis.expire).toHaveBeenCalledWith('key1', 1);
    });

    it('handles long window', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1);
      await rateLimit('key1', 5, 86400);
      expect(mocks.mockRedis.expire).toHaveBeenCalledWith('key1', 86400);
    });

    it('handles window of 0', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1);
      await rateLimit('key1', 5, 0);
      expect(mocks.mockRedis.expire).toHaveBeenCalledWith('key1', 0);
    });

    it('handles unique key per user', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1);
      await rateLimit('user:123:api', 5, 60);
      expect(mocks.mockRedis.incr).toHaveBeenCalledWith('user:123:api');
    });

    it('handles key with special characters', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1);
      await rateLimit('key/with/slashes', 5, 60);
      expect(mocks.mockRedis.incr).toHaveBeenCalledWith('key/with/slashes');
    });

    it('handles key with colons', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1);
      await rateLimit('rate:limit:user:123', 5, 60);
      expect(mocks.mockRedis.incr).toHaveBeenCalledWith('rate:limit:user:123');
    });

    it('handles empty key', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1);
      await rateLimit('', 5, 60);
      expect(mocks.mockRedis.incr).toHaveBeenCalledWith('');
    });

    it('handles limit of 0', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1);
      const result = await rateLimit('key1', 0, 60);
      expect(result.success).toBe(false);
    });

    it('handles increment returning max safe integer', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(Number.MAX_SAFE_INTEGER);
      const result = await rateLimit('key1', 5, 60);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('handles increment returning 1', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1);
      const result = await rateLimit('key1', 5, 60);
      expect(result.success).toBe(true);
      expect(result.current).toBe(1);
      expect(result.remaining).toBe(4);
    });

    it('handles increment returning exactly limit', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(5);
      const result = await rateLimit('key1', 5, 60);
      expect(result.success).toBe(true);
      expect(result.current).toBe(5);
      expect(result.remaining).toBe(0);
    });

    it('handles increment returning limit + 1', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(6);
      const result = await rateLimit('key1', 5, 60);
      expect(result.success).toBe(false);
      expect(result.current).toBe(6);
      expect(result.remaining).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('allows request on Redis incr error', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockRejectedValue(new Error('Redis error'));
      const result = await rateLimit('key1', 5, 60);
      expect(result.success).toBe(true);
    });

    it('returns current=0 on Redis error', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockRejectedValue(new Error('Redis error'));
      const result = await rateLimit('key1', 5, 60);
      expect(result.current).toBe(0);
    });

    it('returns correct limit on Redis error', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockRejectedValue(new Error('Redis error'));
      const result = await rateLimit('key1', 10, 60);
      expect(result.limit).toBe(10);
    });

    it('returns correct remaining on Redis error', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockRejectedValue(new Error('Redis error'));
      const result = await rateLimit('key1', 10, 60);
      expect(result.remaining).toBe(10);
    });

    it('allows request on Redis expire error', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1);
      mocks.mockRedis.expire.mockRejectedValue(new Error('Expire error'));
      const result = await rateLimit('key1', 5, 60);
      expect(result.success).toBe(true);
    });

    it('allows request on getRedisClient error', async () => {
      mocks.mockGetRedisClient.mockRejectedValue(new Error('Connection error'));
      const result = await rateLimit('key1', 5, 60);
      expect(result.success).toBe(true);
    });
  });

  describe('Concurrent requests', () => {
    it('handles concurrent rate limit checks', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1);
      const results = await Promise.all(
        Array.from({ length: 5 }, () => rateLimit('key1', 5, 60))
      );
      expect(results).toHaveLength(5);
      expect(results.every(r => r.success)).toBe(true);
    });

    it('handles concurrent checks with different keys', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1);
      const results = await Promise.all(
        Array.from({ length: 5 }, (_, i) => rateLimit(`key${i}`, 5, 60))
      );
      expect(results).toHaveLength(5);
      expect(results.every(r => r.success)).toBe(true);
    });

    it('handles concurrent checks with mixed Redis availability', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(null);
      const results = await Promise.all(
        Array.from({ length: 5 }, (_, i) => rateLimit(`key${i}`, 5, 60))
      );
      expect(results).toHaveLength(5);
      expect(results.every(r => r.success)).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('handles negative limit', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1);
      const result = await rateLimit('key1', -5, 60);
      expect(result.limit).toBe(-5);
    });

    it('handles negative window', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1);
      await rateLimit('key1', 5, -60);
      expect(mocks.mockRedis.expire).toHaveBeenCalledWith('key1', -60);
    });

    it('handles float limit', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1);
      const result = await rateLimit('key1', 5.5, 60);
      expect(result.limit).toBe(5.5);
    });

    it('handles float window', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1);
      await rateLimit('key1', 5, 60.5);
      expect(mocks.mockRedis.expire).toHaveBeenCalledWith('key1', 60.5);
    });

    it('handles very long key', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1);
      const longKey = 'a'.repeat(1000);
      await rateLimit(longKey, 5, 60);
      expect(mocks.mockRedis.incr).toHaveBeenCalledWith(longKey);
    });

    it('handles key with unicode', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1);
      await rateLimit('साड़ी:rate', 5, 60);
      expect(mocks.mockRedis.incr).toHaveBeenCalledWith('साड़ी:rate');
    });

    it('handles key with emojis', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1);
      await rateLimit('🔑:rate', 5, 60);
      expect(mocks.mockRedis.incr).toHaveBeenCalledWith('🔑:rate');
    });

    it('handles key with newlines', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1);
      await rateLimit('key\nrate', 5, 60);
      expect(mocks.mockRedis.incr).toHaveBeenCalledWith('key\nrate');
    });

    it('handles key with null bytes', async () => {
      mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
      mocks.mockRedis.incr.mockResolvedValue(1);
      await rateLimit('key\0rate', 5, 60);
      expect(mocks.mockRedis.incr).toHaveBeenCalledWith('key\0rate');
    });
  });
});
