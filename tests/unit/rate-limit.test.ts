import { describe, it, expect } from 'vitest';
import { rateLimiter } from '@lib/rate-limit';

describe('In-Memory Rate Limiter', () => {
  it('should allow requests under the limit', async () => {
    const limiter = rateLimiter({ interval: 1000, maxRequests: 5 });
    // Should resolve without throwing
    await expect(limiter.check(5, 'test-token-1')).resolves.toBeUndefined();
  });

  it('should allow exactly the limit number of requests', async () => {
    const limiter = rateLimiter({ interval: 5000, maxRequests: 3 });
    const token = 'exact-limit-' + Date.now();

    await expect(limiter.check(3, token)).resolves.toBeUndefined(); // 1
    await expect(limiter.check(3, token)).resolves.toBeUndefined(); // 2
    await expect(limiter.check(3, token)).resolves.toBeUndefined(); // 3
  });

  it('should reject requests over the limit', async () => {
    const limiter = rateLimiter({ interval: 5000, maxRequests: 2 });
    const token = 'over-limit-' + Date.now();

    await limiter.check(2, token); // 1
    await limiter.check(2, token); // 2
    await expect(limiter.check(2, token)).rejects.toBe('Rate limit exceeded'); // 3
  });

  it('should track separate tokens independently', async () => {
    const limiter = rateLimiter({ interval: 5000, maxRequests: 1 });
    const tokenA = 'user-a-' + Date.now();
    const tokenB = 'user-b-' + Date.now();

    await expect(limiter.check(1, tokenA)).resolves.toBeUndefined();
    await expect(limiter.check(1, tokenB)).resolves.toBeUndefined();
    // tokenA is now rate limited, but tokenB is separate
    await expect(limiter.check(1, tokenA)).rejects.toBe('Rate limit exceeded');
  });

  it('should reset after the interval', async () => {
    const limiter = rateLimiter({ interval: 100, maxRequests: 1 }); // 100ms interval
    const token = 'reset-' + Date.now();

    await limiter.check(1, token); // 1 — allowed
    await expect(limiter.check(1, token)).rejects.toBe('Rate limit exceeded'); // 2 — blocked

    // Wait for rate limit to reset
    await new Promise((r) => setTimeout(r, 150));

    // Should be allowed again
    await expect(limiter.check(1, token)).resolves.toBeUndefined();
  });
});
