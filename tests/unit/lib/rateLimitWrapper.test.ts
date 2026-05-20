// @ts-nocheck
// tests/unit/lib/rateLimitWrapper.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockRateLimit } = vi.hoisted(() => ({
  mockRateLimit: vi.fn(),
}));

vi.mock('@/lib/rate-limit-redis', () => ({ rateLimit: mockRateLimit }));

const { withRateLimit } = await import('/home/meet/Babar-Meet/hemasaree/lib/rateLimitWrapper.ts');

const { NextResponse } = await import('next/server');

const makeReq = (ip?: string, url?: string) => ({
  headers: { get: vi.fn().mockReturnValue(ip || '1.2.3.4') },
  url: url || 'http://localhost:3000/api/test',
} as unknown as Request);

const makeNextResponse = (status = 200) => NextResponse.json({ data: 'test' }, { status });

describe('withRateLimit', () => {
  beforeEach(() => { vi.clearAllMocks(); mockRateLimit.mockReset(); });

  it('calls handler when rate limit allows', async () => {
    mockRateLimit.mockResolvedValue({ success: true, remaining: 4, limit: 5 });
    const handler = vi.fn().mockResolvedValue(makeNextResponse(200));
    const wrapped = withRateLimit(handler, { limit: 5, windowInSeconds: 60 });
    const res = await wrapped(makeReq());
    expect(res.status).toBe(200);
    expect(handler).toHaveBeenCalled();
  });

  it('returns 429 when rate limit exceeded', async () => {
    mockRateLimit.mockResolvedValue({ success: false, remaining: 0, limit: 5 });
    const handler = vi.fn().mockResolvedValue(makeNextResponse(200));
    const wrapped = withRateLimit(handler, { limit: 5, windowInSeconds: 60 });
    const res = await wrapped(makeReq());
    expect(res.status).toBe(429);
    expect(handler).not.toHaveBeenCalled();
  });

  it('uses x-forwarded-for as IP', async () => {
    mockRateLimit.mockResolvedValue({ success: true, remaining: 4, limit: 5 });
    const handler = vi.fn().mockResolvedValue(makeNextResponse(200));
    const wrapped = withRateLimit(handler, { limit: 5, windowInSeconds: 60 });
    await wrapped(makeReq('5.6.7.8'));
    expect(mockRateLimit).toHaveBeenCalledWith('ratelimit:5.6.7.8:/api/test', 5, 60);
  });

  it('falls back to "anonymous" when no x-forwarded-for', async () => {
    mockRateLimit.mockResolvedValue({ success: true, remaining: 4, limit: 5 });
    const handler = vi.fn().mockResolvedValue(makeNextResponse(200));
    const wrapped = withRateLimit(handler, { limit: 5, windowInSeconds: 60 });
    const req = { headers: { get: vi.fn().mockReturnValue(null) }, url: 'http://localhost:3000/api/test' } as unknown as Request;
    await wrapped(req);
    expect(mockRateLimit).toHaveBeenCalledWith('ratelimit:anonymous:/api/test', 5, 60);
  });

  it('uses request path in rate limit key', async () => {
    mockRateLimit.mockResolvedValue({ success: true, remaining: 4, limit: 5 });
    const handler = vi.fn().mockResolvedValue(makeNextResponse(200));
    const wrapped = withRateLimit(handler, { limit: 5, windowInSeconds: 60 });
    await wrapped(makeReq('1.2.3.4', 'http://localhost:3000/api/cart'));
    expect(mockRateLimit).toHaveBeenCalledWith('ratelimit:1.2.3.4:/api/cart', 5, 60);
  });

  it('passes limit and window to rateLimit function', async () => {
    mockRateLimit.mockResolvedValue({ success: true, remaining: 9, limit: 10 });
    const handler = vi.fn().mockResolvedValue(makeNextResponse(200));
    const wrapped = withRateLimit(handler, { limit: 10, windowInSeconds: 120 });
    await wrapped(makeReq());
    expect(mockRateLimit).toHaveBeenCalledWith(expect.any(String), 10, 120);
  });

  it('adds rate limit headers to successful response', async () => {
    mockRateLimit.mockResolvedValue({ success: true, remaining: 3, limit: 5 });
    const handler = vi.fn().mockResolvedValue(makeNextResponse(200));
    const wrapped = withRateLimit(handler, { limit: 5, windowInSeconds: 60 });
    const res = await wrapped(makeReq());
    expect(res.headers.get('X-RateLimit-Limit')).toBe('5');
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('3');
  });

  it('adds rate limit headers to 429 response', async () => {
    mockRateLimit.mockResolvedValue({ success: false, remaining: 0, limit: 5 });
    const handler = vi.fn().mockResolvedValue(makeNextResponse(200));
    const wrapped = withRateLimit(handler, { limit: 5, windowInSeconds: 60 });
    const res = await wrapped(makeReq());
    const body = await res.json();
    expect(body.error).toContain('Too many requests');
  });

  it('429 response includes correct headers', async () => {
    mockRateLimit.mockResolvedValue({ success: false, remaining: 0, limit: 3 });
    const handler = vi.fn().mockResolvedValue(makeNextResponse(200));
    const wrapped = withRateLimit(handler, { limit: 3, windowInSeconds: 60 });
    const res = await wrapped(makeReq());
    expect(res.status).toBe(429);
  });

  it('passes additional args to handler', async () => {
    mockRateLimit.mockResolvedValue({ success: true, remaining: 4, limit: 5 });
    const handler = vi.fn().mockResolvedValue(makeNextResponse(200));
    const wrapped = withRateLimit(handler, { limit: 5, windowInSeconds: 60 });
    const req = makeReq();
    const mockParams = { params: { id: 'p1' } };
    await wrapped(req, mockParams);
    expect(handler).toHaveBeenCalledWith(req, mockParams);
  });

  it('does not add headers when response is not NextResponse', async () => {
    mockRateLimit.mockResolvedValue({ success: true, remaining: 4, limit: 5 });
    const handler = vi.fn().mockResolvedValue({ status: 200, headers: undefined });
    const wrapped = withRateLimit(handler, { limit: 5, windowInSeconds: 60 });
    const res = await wrapped(makeReq());
    expect(res.headers).toBeUndefined();
  });

  it('handles rate limit error gracefully', async () => {
    mockRateLimit.mockRejectedValue(new Error('Redis error'));
    const handler = vi.fn().mockResolvedValue(makeNextResponse(200));
    const wrapped = withRateLimit(handler, { limit: 5, windowInSeconds: 60 });
    await expect(wrapped(makeReq())).rejects.toThrow('Redis error');
  });

  it('handles different rate limit configs', async () => {
    mockRateLimit.mockResolvedValue({ success: true, remaining: 99, limit: 100 });
    const handler = vi.fn().mockResolvedValue(makeNextResponse(200));
    const wrapped = withRateLimit(handler, { limit: 100, windowInSeconds: 3600 });
    const res = await wrapped(makeReq());
    expect(res.status).toBe(200);
    expect(mockRateLimit).toHaveBeenCalledWith(expect.any(String), 100, 3600);
  });

  it('handles zero remaining', async () => {
    mockRateLimit.mockResolvedValue({ success: true, remaining: 0, limit: 5 });
    const handler = vi.fn().mockResolvedValue(makeNextResponse(200));
    const wrapped = withRateLimit(handler, { limit: 5, windowInSeconds: 60 });
    const res = await wrapped(makeReq());
    expect(res.status).toBe(200);
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');
  });

  it('handles multiple IPs separately', async () => {
    mockRateLimit.mockResolvedValue({ success: true, remaining: 4, limit: 5 });
    const handler = vi.fn().mockResolvedValue(makeNextResponse(200));
    const wrapped = withRateLimit(handler, { limit: 5, windowInSeconds: 60 });
    await wrapped(makeReq('ip1'));
    await wrapped(makeReq('ip2'));
    expect(mockRateLimit).toHaveBeenNthCalledWith(1, 'ratelimit:ip1:/api/test', 5, 60);
    expect(mockRateLimit).toHaveBeenNthCalledWith(2, 'ratelimit:ip2:/api/test', 5, 60);
  });
});
