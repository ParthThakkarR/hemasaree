import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Redis to be unavailable — tests the in-memory fallback
vi.mock('../../lib/redis', () => ({
  getRedisClient: vi.fn().mockResolvedValue(null),
}));

// Import AFTER mocking
const { cache } = await import('../../lib/cache');

describe('Cache Service (In-Memory Fallback)', () => {
  beforeEach(async () => {
    // Clear any existing cache entries between tests
    await cache.clearPattern('*');
  });

  it('should return null for non-existent key', async () => {
    const result = await cache.get('nonexistent');
    expect(result).toBeNull();
  });

  it('should set and get a value', async () => {
    await cache.set('test-key', { name: 'Silk Saree', price: 999 });
    const result = await cache.get<{ name: string; price: number }>('test-key');
    expect(result).toEqual({ name: 'Silk Saree', price: 999 });
  });

  it('should set and get a string value', async () => {
    await cache.set('str-key', 'hello');
    const result = await cache.get<string>('str-key');
    expect(result).toBe('hello');
  });

  it('should set and get an array value', async () => {
    const arr = [1, 2, 3, 4, 5];
    await cache.set('arr-key', arr);
    const result = await cache.get<number[]>('arr-key');
    expect(result).toEqual(arr);
  });

  it('should delete a value', async () => {
    await cache.set('del-key', 'to-delete');
    await cache.delete('del-key');
    const result = await cache.get('del-key');
    expect(result).toBeNull();
  });

  it('should clear values by pattern', async () => {
    await cache.set('products:1', 'p1');
    await cache.set('products:2', 'p2');
    await cache.set('categories:1', 'c1');

    await cache.clearPattern('products:*');

    expect(await cache.get('products:1')).toBeNull();
    expect(await cache.get('products:2')).toBeNull();
    expect(await cache.get('categories:1')).toBe('c1');
  });

  it('should handle expired TTL', async () => {
    // Set with 0 second TTL (already expired)
    await cache.set('expired-key', 'value', 0);

    // Wait a tiny bit for expiry to kick in
    await new Promise((r) => setTimeout(r, 10));

    const result = await cache.get('expired-key');
    expect(result).toBeNull();
  });

  it('should overwrite existing key', async () => {
    await cache.set('overwrite-key', 'old-value');
    await cache.set('overwrite-key', 'new-value');
    const result = await cache.get<string>('overwrite-key');
    expect(result).toBe('new-value');
  });

  it('should handle complex nested objects', async () => {
    const complex = {
      user: { name: 'Priya', addresses: [{ city: 'Surat' }] },
      items: [{ id: '1', price: 499.99 }],
      total: 499.99,
    };
    await cache.set('complex', complex);
    const result = await cache.get('complex');
    expect(result).toEqual(complex);
  });
});
