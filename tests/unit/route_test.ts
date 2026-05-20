import { describe, it, expect } from 'vitest';

describe('route import test', () => {
  it('should import POST route handler', async () => {
    const { POST } = await import('@/app/api/(auth)/signup/route');
    expect(typeof POST).toBe('function');
  });
});
