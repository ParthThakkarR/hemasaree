import { describe, it, expect } from 'vitest';

describe('Direct import test', () => {
  it('should import signup handler', async () => {
    // Try importing without any mocks first
    const { POST: signupHandler } = await import('@/app/api/(auth)/signup/route');
    expect(typeof signupHandler).toBe('function');
  });
});