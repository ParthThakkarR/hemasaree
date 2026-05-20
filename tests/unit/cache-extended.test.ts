// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  mockRedis: { get: vi.fn(), set: vi.fn(), del: vi.fn(), keys: vi.fn() },
  mockGetRedisClient: vi.fn(),
}));

vi.mock('@/lib/redis', () => ({ getRedisClient: mocks.mockGetRedisClient }));

describe('cache.get', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it('returns null when key not found in Redis', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.get.mockResolvedValue(null);
    const { cache } = await import('@/lib/cache');
    const result = await cache.get('nonexistent');
    expect(result).toBeNull();
  });

  it('returns parsed value from Redis', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.get.mockResolvedValue(JSON.stringify({ key: 'value' }));
    const { cache } = await import('@/lib/cache');
    const result = await cache.get('test');
    expect(result).toEqual({ key: 'value' });
  });

  it('returns null when Redis unavailable', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    const { cache } = await import('@/lib/cache');
    const result = await cache.get('test');
    expect(result).toBeNull();
  });

  it('falls back to memory cache when Redis unavailable', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    const { cache } = await import('@/lib/cache');
    await cache.set('memkey', { data: 'test' }, 60);
    const result = await cache.get('memkey');
    expect(result).toEqual({ data: 'test' });
  });

  it('returns null for expired memory cache', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    const { cache } = await import('@/lib/cache');
    await cache.set('expirekey', { data: 'test' }, 0);
    await new Promise(r => setTimeout(r, 10));
    const result = await cache.get('expirekey');
    expect(result).toBeNull();
  });

  it('returns null when Redis throws', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.get.mockRejectedValue(new Error('Redis error'));
    const { cache } = await import('@/lib/cache');
    const result = await cache.get('test');
    expect(result).toBeNull();
  });

  it('returns null for invalid JSON in Redis', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.get.mockResolvedValue('not-json');
    const { cache } = await import('@/lib/cache');
    const result = await cache.get('test');
    expect(result).toBeNull();
  });

  it('handles array values', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.get.mockResolvedValue(JSON.stringify([1, 2, 3]));
    const { cache } = await import('@/lib/cache');
    const result = await cache.get('array');
    expect(result).toEqual([1, 2, 3]);
  });

  it('handles string values', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.get.mockResolvedValue(JSON.stringify('hello'));
    const { cache } = await import('@/lib/cache');
    const result = await cache.get('string');
    expect(result).toBe('hello');
  });

  it('handles number values', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.get.mockResolvedValue(JSON.stringify(42));
    const { cache } = await import('@/lib/cache');
    const result = await cache.get('number');
    expect(result).toBe(42);
  });

  it('handles boolean values', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.get.mockResolvedValue(JSON.stringify(true));
    const { cache } = await import('@/lib/cache');
    const result = await cache.get('bool');
    expect(result).toBe(true);
  });

  it('handles null values', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.get.mockResolvedValue(JSON.stringify(null));
    const { cache } = await import('@/lib/cache');
    const result = await cache.get('null');
    expect(result).toBeNull();
  });

  it('handles nested objects', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.get.mockResolvedValue(JSON.stringify({ a: { b: { c: 1 } } }));
    const { cache } = await import('@/lib/cache');
    const result = await cache.get('nested');
    expect(result.a.b.c).toBe(1);
  });

  it('handles unicode keys', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.get.mockResolvedValue(JSON.stringify({ data: 'test' }));
    const { cache } = await import('@/lib/cache');
    const result = await cache.get('साड़ी');
    expect(result).toEqual({ data: 'test' });
  });

  it('handles empty key', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.get.mockResolvedValue(null);
    const { cache } = await import('@/lib/cache');
    const result = await cache.get('');
    expect(result).toBeNull();
  });

  it('handles very long key', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.get.mockResolvedValue(null);
    const { cache } = await import('@/lib/cache');
    const result = await cache.get('a'.repeat(1000));
    expect(result).toBeNull();
  });
});

describe('cache.set', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it('sets value in Redis', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    const { cache } = await import('@/lib/cache');
    await cache.set('key', { data: 'test' }, 60);
    expect(mocks.mockRedis.set).toHaveBeenCalledWith('key', JSON.stringify({ data: 'test' }), { EX: 60 });
  });

  it('sets value in memory when Redis unavailable', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    const { cache } = await import('@/lib/cache');
    await cache.set('memkey', { data: 'test' }, 60);
    const result = await cache.get('memkey');
    expect(result).toEqual({ data: 'test' });
  });

  it('uses default TTL', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    const { cache } = await import('@/lib/cache');
    await cache.set('key', { data: 'test' });
    expect(mocks.mockRedis.set).toHaveBeenCalledWith('key', expect.any(String), { EX: 3600 });
  });

  it('handles custom TTL', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    const { cache } = await import('@/lib/cache');
    await cache.set('key', { data: 'test' }, 120);
    expect(mocks.mockRedis.set).toHaveBeenCalledWith('key', expect.any(String), { EX: 120 });
  });

  it('handles TTL of 0', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    const { cache } = await import('@/lib/cache');
    await cache.set('key', { data: 'test' }, 0);
    expect(mocks.mockRedis.set).toHaveBeenCalledWith('key', expect.any(String), { EX: 0 });
  });

  it('handles TTL of 1', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    const { cache } = await import('@/lib/cache');
    await cache.set('key', { data: 'test' }, 1);
    expect(mocks.mockRedis.set).toHaveBeenCalledWith('key', expect.any(String), { EX: 1 });
  });

  it('handles large TTL', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    const { cache } = await import('@/lib/cache');
    await cache.set('key', { data: 'test' }, 86400);
    expect(mocks.mockRedis.set).toHaveBeenCalledWith('key', expect.any(String), { EX: 86400 });
  });

  it('handles null value', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    const { cache } = await import('@/lib/cache');
    await cache.set('key', null, 60);
    expect(mocks.mockRedis.set).toHaveBeenCalledWith('key', 'null', { EX: 60 });
  });

  it('handles undefined value', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    const { cache } = await import('@/lib/cache');
    await cache.set('key', undefined, 60);
    expect(mocks.mockRedis.set).toHaveBeenCalledWith('key', undefined, { EX: 60 });
  });

  it('handles array value', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    const { cache } = await import('@/lib/cache');
    await cache.set('key', [1, 2, 3], 60);
    expect(mocks.mockRedis.set).toHaveBeenCalledWith('key', '[1,2,3]', { EX: 60 });
  });

  it('handles string value', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    const { cache } = await import('@/lib/cache');
    await cache.set('key', 'hello', 60);
    expect(mocks.mockRedis.set).toHaveBeenCalledWith('key', '"hello"', { EX: 60 });
  });

  it('handles number value', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    const { cache } = await import('@/lib/cache');
    await cache.set('key', 42, 60);
    expect(mocks.mockRedis.set).toHaveBeenCalledWith('key', '42', { EX: 60 });
  });

  it('handles boolean value', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    const { cache } = await import('@/lib/cache');
    await cache.set('key', true, 60);
    expect(mocks.mockRedis.set).toHaveBeenCalledWith('key', 'true', { EX: 60 });
  });

  it('does not throw when Redis throws', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.set.mockRejectedValue(new Error('Redis error'));
    const { cache } = await import('@/lib/cache');
    await expect(cache.set('key', { data: 'test' }, 60)).resolves.toBeUndefined();
  });

  it('does not throw when memory cache throws', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    const { cache } = await import('@/lib/cache');
    await expect(cache.set('key', { data: 'test' }, 60)).resolves.toBeUndefined();
  });

  it('handles empty key', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    const { cache } = await import('@/lib/cache');
    await cache.set('', { data: 'test' }, 60);
    expect(mocks.mockRedis.set).toHaveBeenCalled();
  });

  it('handles unicode key', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    const { cache } = await import('@/lib/cache');
    await cache.set('साड़ी', { data: 'test' }, 60);
    expect(mocks.mockRedis.set).toHaveBeenCalledWith('साड़ी', expect.any(String), { EX: 60 });
  });

  it('handles nested object value', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    const { cache } = await import('@/lib/cache');
    await cache.set('key', { a: { b: { c: 1 } } }, 60);
    expect(mocks.mockRedis.set).toHaveBeenCalledWith('key', JSON.stringify({ a: { b: { c: 1 } } }), { EX: 60 });
  });

  it('handles circular reference gracefully', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    const { cache } = await import('@/lib/cache');
    const circular: any = {};
    circular.self = circular;
    await expect(cache.set('key', circular, 60)).resolves.toBeUndefined();
  });
});

describe('cache.delete', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it('deletes key from Redis', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    const { cache } = await import('@/lib/cache');
    await cache.delete('key');
    expect(mocks.mockRedis.del).toHaveBeenCalledWith('key');
  });

  it('deletes key from memory when Redis unavailable', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    const { cache } = await import('@/lib/cache');
    await cache.set('delkey', { data: 'test' }, 60);
    await cache.delete('delkey');
    const result = await cache.get('delkey');
    expect(result).toBeNull();
  });

  it('does not throw when Redis throws', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.del.mockRejectedValue(new Error('Redis error'));
    const { cache } = await import('@/lib/cache');
    await expect(cache.delete('key')).resolves.toBeUndefined();
  });

  it('handles empty key', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    const { cache } = await import('@/lib/cache');
    await cache.delete('');
    expect(mocks.mockRedis.del).toHaveBeenCalledWith('');
  });

  it('handles non-existent key', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.del.mockResolvedValue(0);
    const { cache } = await import('@/lib/cache');
    await cache.delete('nonexistent');
    expect(mocks.mockRedis.del).toHaveBeenCalledWith('nonexistent');
  });
});

describe('cache.clearPattern', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it('clears keys matching pattern in Redis', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.keys.mockResolvedValue(['key1', 'key2']);
    const { cache } = await import('@/lib/cache');
    await cache.clearPattern('key*');
    expect(mocks.mockRedis.keys).toHaveBeenCalledWith('key*');
    expect(mocks.mockRedis.del).toHaveBeenCalledWith(['key1', 'key2']);
  });

  it('clears memory cache matching pattern', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    const { cache } = await import('@/lib/cache');
    await cache.set('prefix:1', { data: 'a' }, 60);
    await cache.set('prefix:2', { data: 'b' }, 60);
    await cache.set('other', { data: 'c' }, 60);
    await cache.clearPattern('prefix:*');
    expect(await cache.get('prefix:1')).toBeNull();
    expect(await cache.get('prefix:2')).toBeNull();
    expect(await cache.get('other')).toEqual({ data: 'c' });
  });

  it('does nothing when no keys match', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.keys.mockResolvedValue([]);
    const { cache } = await import('@/lib/cache');
    await cache.clearPattern('nonexistent*');
    expect(mocks.mockRedis.del).not.toHaveBeenCalled();
  });

  it('does not throw when Redis throws', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.keys.mockRejectedValue(new Error('Redis error'));
    const { cache } = await import('@/lib/cache');
    await expect(cache.clearPattern('key*')).resolves.toBeUndefined();
  });

  it('handles empty pattern', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.keys.mockResolvedValue([]);
    const { cache } = await import('@/lib/cache');
    await cache.clearPattern('');
    expect(mocks.mockRedis.keys).toHaveBeenCalledWith('');
  });

  it('handles pattern with special regex chars', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    const { cache } = await import('@/lib/cache');
    await cache.set('test.key', { data: 'a' }, 60);
    await cache.clearPattern('test.*');
    expect(await cache.get('test.key')).toBeNull();
  });

  it('handles wildcard at start', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    const { cache } = await import('@/lib/cache');
    await cache.set('end:key', { data: 'a' }, 60);
    await cache.clearPattern('*:key');
    expect(await cache.get('end:key')).toBeNull();
  });

  it('handles multiple wildcards', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    const { cache } = await import('@/lib/cache');
    await cache.set('a:b:c', { data: 'a' }, 60);
    await cache.clearPattern('*:*:*');
    expect(await cache.get('a:b:c')).toBeNull();
  });
});
