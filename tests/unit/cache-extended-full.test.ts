// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  mockRedis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
  },
  mockGetRedisClient: vi.fn(),
}));

vi.mock('@/lib/redis', () => ({ getRedisClient: mocks.mockGetRedisClient }));

const { cache } = await import('@/lib/cache');

describe('cache.get', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns null when Redis is unavailable and key not in memory', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    const result = await cache.get('nonexistent');
    expect(result).toBeNull();
  });

  it('returns null when Redis returns null', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.get.mockResolvedValue(null);
    const result = await cache.get('nonexistent');
    expect(result).toBeNull();
  });

  it('returns parsed value from Redis', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.get.mockResolvedValue(JSON.stringify({ foo: 'bar' }));
    const result = await cache.get('test-key');
    expect(result).toEqual({ foo: 'bar' });
  });

  it('returns parsed array from Redis', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.get.mockResolvedValue(JSON.stringify([1, 2, 3]));
    const result = await cache.get('array-key');
    expect(result).toEqual([1, 2, 3]);
  });

  it('returns parsed string from Redis', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.get.mockResolvedValue(JSON.stringify('hello'));
    const result = await cache.get('string-key');
    expect(result).toBe('hello');
  });

  it('returns parsed number from Redis', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.get.mockResolvedValue(JSON.stringify(42));
    const result = await cache.get('number-key');
    expect(result).toBe(42);
  });

  it('returns parsed boolean from Redis', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.get.mockResolvedValue(JSON.stringify(true));
    const result = await cache.get('bool-key');
    expect(result).toBe(true);
  });

  it('returns null when Redis throws error', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.get.mockRejectedValue(new Error('Redis error'));
    const result = await cache.get('error-key');
    expect(result).toBeNull();
  });

  it('returns null when getRedisClient throws', async () => {
    mocks.mockGetRedisClient.mockRejectedValue(new Error('Connection failed'));
    const result = await cache.get('fail-key');
    expect(result).toBeNull();
  });

  it('falls back to memory when Redis unavailable', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    await cache.set('mem-key', { data: 'test' }, 60);
    const result = await cache.get('mem-key');
    expect(result).toEqual({ data: 'test' });
  });

  it('returns null for expired memory entry', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    await cache.set('expire-key', { data: 'test' }, -1);
    const result = await cache.get('expire-key');
    expect(result).toBeNull();
  });

  it('calls Redis get with correct key', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.get.mockResolvedValue(null);
    await cache.get('my-key');
    expect(mocks.mockRedis.get).toHaveBeenCalledWith('my-key');
  });

  it('handles complex nested object', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    const complex = { a: { b: { c: [1, 2, { d: 'deep' }] } } };
    mocks.mockRedis.get.mockResolvedValue(JSON.stringify(complex));
    const result = await cache.get('complex');
    expect(result).toEqual(complex);
  });

  it('handles null value in Redis', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.get.mockResolvedValue(JSON.stringify(null));
    const result = await cache.get('null-val');
    expect(result).toBeNull();
  });

  it('handles empty object', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.get.mockResolvedValue(JSON.stringify({}));
    const result = await cache.get('empty-obj');
    expect(result).toEqual({});
  });

  it('handles empty array', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.get.mockResolvedValue(JSON.stringify([]));
    const result = await cache.get('empty-arr');
    expect(result).toEqual([]);
  });
});

describe('cache.set', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('sets value in Redis', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    await cache.set('key', { value: 123 }, 3600);
    expect(mocks.mockRedis.set).toHaveBeenCalledWith(
      'key',
      JSON.stringify({ value: 123 }),
      { EX: 3600 }
    );
  });

  it('uses default TTL', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    await cache.set('key', 'value');
    expect(mocks.mockRedis.set).toHaveBeenCalledWith(
      'key',
      JSON.stringify('value'),
      { EX: 3600 }
    );
  });

  it('uses custom TTL', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    await cache.set('key', 'value', 7200);
    expect(mocks.mockRedis.set).toHaveBeenCalledWith(
      'key',
      JSON.stringify('value'),
      { EX: 7200 }
    );
  });

  it('falls back to memory when Redis unavailable', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    await cache.set('mem-key', { data: 'test' }, 60);
    const result = await cache.get('mem-key');
    expect(result).toEqual({ data: 'test' });
  });

  it('handles string value', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    await cache.set('str-key', 'hello');
    expect(mocks.mockRedis.set).toHaveBeenCalledWith(
      'str-key',
      JSON.stringify('hello'),
      { EX: 3600 }
    );
  });

  it('handles number value', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    await cache.set('num-key', 42);
    expect(mocks.mockRedis.set).toHaveBeenCalledWith(
      'num-key',
      JSON.stringify(42),
      { EX: 3600 }
    );
  });

  it('handles boolean value', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    await cache.set('bool-key', true);
    expect(mocks.mockRedis.set).toHaveBeenCalledWith(
      'bool-key',
      JSON.stringify(true),
      { EX: 3600 }
    );
  });

  it('handles array value', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    await cache.set('arr-key', [1, 2, 3]);
    expect(mocks.mockRedis.set).toHaveBeenCalledWith(
      'arr-key',
      JSON.stringify([1, 2, 3]),
      { EX: 3600 }
    );
  });

  it('handles null value', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    await cache.set('null-key', null);
    expect(mocks.mockRedis.set).toHaveBeenCalledWith(
      'null-key',
      JSON.stringify(null),
      { EX: 3600 }
    );
  });

  it('handles empty object', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    await cache.set('empty-key', {});
    expect(mocks.mockRedis.set).toHaveBeenCalledWith(
      'empty-key',
      JSON.stringify({}),
      { EX: 3600 }
    );
  });

  it('handles complex nested object', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    const complex = { a: { b: [1, 2, { c: 'deep' }] } };
    await cache.set('complex-key', complex);
    expect(mocks.mockRedis.set).toHaveBeenCalledWith(
      'complex-key',
      JSON.stringify(complex),
      { EX: 3600 }
    );
  });

  it('does not throw when Redis errors', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.set.mockRejectedValue(new Error('Redis error'));
    await expect(cache.set('error-key', 'value')).resolves.toBeUndefined();
  });

  it('does not throw when getRedisClient errors', async () => {
    mocks.mockGetRedisClient.mockRejectedValue(new Error('Connection failed'));
    await expect(cache.set('fail-key', 'value')).resolves.toBeUndefined();
  });

  it('uses zero TTL', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    await cache.set('key', 'value', 0);
    expect(mocks.mockRedis.set).toHaveBeenCalledWith(
      'key',
      JSON.stringify('value'),
      { EX: 0 }
    );
  });

  it('uses large TTL', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    await cache.set('key', 'value', 86400);
    expect(mocks.mockRedis.set).toHaveBeenCalledWith(
      'key',
      JSON.stringify('value'),
      { EX: 86400 }
    );
  });
});

describe('cache.delete', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('deletes key from Redis', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    await cache.delete('key-to-delete');
    expect(mocks.mockRedis.del).toHaveBeenCalledWith('key-to-delete');
  });

  it('falls back to memory when Redis unavailable', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    await cache.set('del-key', 'value');
    await cache.delete('del-key');
    const result = await cache.get('del-key');
    expect(result).toBeNull();
  });

  it('does not throw when Redis errors', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.del.mockRejectedValue(new Error('Redis error'));
    await expect(cache.delete('error-key')).resolves.toBeUndefined();
  });

  it('does not throw when getRedisClient errors', async () => {
    mocks.mockGetRedisClient.mockRejectedValue(new Error('Connection failed'));
    await expect(cache.delete('fail-key')).resolves.toBeUndefined();
  });

  it('handles empty key', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    await cache.delete('');
    expect(mocks.mockRedis.del).toHaveBeenCalledWith('');
  });
});

describe('cache.clearPattern', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('clears keys matching pattern in Redis', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.keys.mockResolvedValue(['key1', 'key2']);
    mocks.mockRedis.del.mockResolvedValue(2);

    await cache.clearPattern('key*');
    expect(mocks.mockRedis.keys).toHaveBeenCalledWith('key*');
    expect(mocks.mockRedis.del).toHaveBeenCalledWith(['key1', 'key2']);
  });

  it('does nothing when no keys match', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.keys.mockResolvedValue([]);

    await cache.clearPattern('nonexistent*');
    expect(mocks.mockRedis.del).not.toHaveBeenCalled();
  });

  it('falls back to memory pattern matching', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    await cache.set('product:1', { id: 1 });
    await cache.set('product:2', { id: 2 });
    await cache.set('user:1', { id: 1 });

    await cache.clearPattern('product:*');
    const p1 = await cache.get('product:1');
    const p2 = await cache.get('product:2');
    const u1 = await cache.get('user:1');

    expect(p1).toBeNull();
    expect(p2).toBeNull();
    expect(u1).toEqual({ id: 1 });
  });

  it('does not throw when Redis errors', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(mocks.mockRedis);
    mocks.mockRedis.keys.mockRejectedValue(new Error('Redis error'));
    await expect(cache.clearPattern('error*')).resolves.toBeUndefined();
  });

  it('does not throw when getRedisClient errors', async () => {
    mocks.mockGetRedisClient.mockRejectedValue(new Error('Connection failed'));
    await expect(cache.clearPattern('fail*')).resolves.toBeUndefined();
  });

  it('handles wildcard at start', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    await cache.set(':key1', 'val1');
    await cache.set('prefix:key2', 'val2');

    await cache.clearPattern('*:key*');
    const k1 = await cache.get(':key1');
    const k2 = await cache.get('prefix:key2');

    expect(k1).toBeNull();
    expect(k2).toBeNull();
  });

  it('handles exact pattern', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    await cache.set('exact', 'val');
    await cache.set('exact2', 'val2');

    await cache.clearPattern('exact');
    const e1 = await cache.get('exact');
    const e2 = await cache.get('exact2');

    expect(e1).toBeNull();
    expect(e2).toEqual('val2');
  });

  it('handles multiple wildcards', async () => {
    mocks.mockGetRedisClient.mockResolvedValue(null);
    await cache.set('a:b:c', 'val1');
    await cache.set('a:x:c', 'val2');
    await cache.set('b:a:c', 'val3');

    await cache.clearPattern('a:*:c');
    const abc = await cache.get('a:b:c');
    const axc = await cache.get('a:x:c');
    const bac = await cache.get('b:a:c');

    expect(abc).toBeNull();
    expect(axc).toBeNull();
    expect(bac).toEqual('val3');
  });
});
