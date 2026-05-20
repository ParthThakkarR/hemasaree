// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

const mocks = vi.hoisted(() => ({
  mockRateLimit: vi.fn(),
}));

vi.mock('@/lib/rate-limit-redis', () => ({ rateLimit: mocks.mockRateLimit }));

const { withRateLimit } = await import('@/lib/rateLimitWrapper');

describe('withRateLimit', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns a function', () => {
    const wrapped = withRateLimit(vi.fn(), { limit: 10, windowInSeconds: 60 });
    expect(typeof wrapped).toBe('function');
  });

  it('calls handler when rate limit allows', async () => {
    mocks.mockRateLimit.mockResolvedValue({ success: true, remaining: 9, limit: 10 });
    const handler = vi.fn().mockResolvedValue(new NextResponse('OK'));
    const wrapped = withRateLimit(handler, { limit: 10, windowInSeconds: 60 });

    const req = new Request('http://test.com/api', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    await wrapped(req);

    expect(handler).toHaveBeenCalled();
  });

  it('returns 429 when rate limit exceeded', async () => {
    mocks.mockRateLimit.mockResolvedValue({ success: false, remaining: 0, limit: 10 });
    const handler = vi.fn();
    const wrapped = withRateLimit(handler, { limit: 10, windowInSeconds: 60 });

    const req = new Request('http://test.com/api', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    const response = await wrapped(req);

    expect(response.status).toBe(429);
  });

  it('returns error message when rate limited', async () => {
    mocks.mockRateLimit.mockResolvedValue({ success: false, remaining: 0, limit: 10 });
    const handler = vi.fn();
    const wrapped = withRateLimit(handler, { limit: 10, windowInSeconds: 60 });

    const req = new Request('http://test.com/api', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    const response = await wrapped(req);
    const body = await response.json();

    expect(body.error).toBe('Too many requests. Please try again later.');
  });

  it('uses x-forwarded-for header for IP', async () => {
    mocks.mockRateLimit.mockResolvedValue({ success: true, remaining: 9, limit: 10 });
    const handler = vi.fn().mockResolvedValue(new NextResponse('OK'));
    const wrapped = withRateLimit(handler, { limit: 10, windowInSeconds: 60 });

    const req = new Request('http://test.com/api', {
      headers: { 'x-forwarded-for': '5.6.7.8' },
    });
    await wrapped(req);

    expect(mocks.mockRateLimit).toHaveBeenCalledWith(
      'ratelimit:5.6.7.8:/api',
      10,
      60
    );
  });

  it('uses anonymous when no x-forwarded-for', async () => {
    mocks.mockRateLimit.mockResolvedValue({ success: true, remaining: 9, limit: 10 });
    const handler = vi.fn().mockResolvedValue(new NextResponse('OK'));
    const wrapped = withRateLimit(handler, { limit: 10, windowInSeconds: 60 });

    const req = new Request('http://test.com/api');
    await wrapped(req);

    expect(mocks.mockRateLimit).toHaveBeenCalledWith(
      'ratelimit:anonymous:/api',
      10,
      60
    );
  });

  it('includes path in rate limit key', async () => {
    mocks.mockRateLimit.mockResolvedValue({ success: true, remaining: 9, limit: 10 });
    const handler = vi.fn().mockResolvedValue(new NextResponse('OK'));
    const wrapped = withRateLimit(handler, { limit: 10, windowInSeconds: 60 });

    const req = new Request('http://test.com/api/products', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    await wrapped(req);

    expect(mocks.mockRateLimit).toHaveBeenCalledWith(
      'ratelimit:1.2.3.4:/api/products',
      10,
      60
    );
  });

  it('adds rate limit headers to response', async () => {
    mocks.mockRateLimit.mockResolvedValue({ success: true, remaining: 5, limit: 10 });
    const handler = vi.fn().mockResolvedValue(new NextResponse('OK'));
    const wrapped = withRateLimit(handler, { limit: 10, windowInSeconds: 60 });

    const req = new Request('http://test.com/api', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    const response = await wrapped(req);

    expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('5');
  });

  it('adds rate limit headers to 429 response', async () => {
    mocks.mockRateLimit.mockResolvedValue({ success: false, remaining: 0, limit: 10 });
    const handler = vi.fn();
    const wrapped = withRateLimit(handler, { limit: 10, windowInSeconds: 60 });

    const req = new Request('http://test.com/api', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    const response = await wrapped(req);

    expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
  });

  it('passes request to handler', async () => {
    mocks.mockRateLimit.mockResolvedValue({ success: true, remaining: 9, limit: 10 });
    const handler = vi.fn().mockResolvedValue(new NextResponse('OK'));
    const wrapped = withRateLimit(handler, { limit: 10, windowInSeconds: 60 });

    const req = new Request('http://test.com/api', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    await wrapped(req);

    expect(handler).toHaveBeenCalledWith(req);
  });

  it('passes additional args to handler', async () => {
    mocks.mockRateLimit.mockResolvedValue({ success: true, remaining: 9, limit: 10 });
    const handler = vi.fn().mockResolvedValue(new NextResponse('OK'));
    const wrapped = withRateLimit(handler, { limit: 10, windowInSeconds: 60 });

    const req = new Request('http://test.com/api', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    await wrapped(req, 'arg1', 'arg2');

    expect(handler).toHaveBeenCalledWith(req, 'arg1', 'arg2');
  });

  it('uses custom limit value', async () => {
    mocks.mockRateLimit.mockResolvedValue({ success: true, remaining: 49, limit: 50 });
    const handler = vi.fn().mockResolvedValue(new NextResponse('OK'));
    const wrapped = withRateLimit(handler, { limit: 50, windowInSeconds: 60 });

    const req = new Request('http://test.com/api', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    await wrapped(req);

    expect(mocks.mockRateLimit).toHaveBeenCalledWith(
      expect.any(String),
      50,
      60
    );
  });

  it('uses custom window value', async () => {
    mocks.mockRateLimit.mockResolvedValue({ success: true, remaining: 9, limit: 10 });
    const handler = vi.fn().mockResolvedValue(new NextResponse('OK'));
    const wrapped = withRateLimit(handler, { limit: 10, windowInSeconds: 3600 });

    const req = new Request('http://test.com/api', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    await wrapped(req);

    expect(mocks.mockRateLimit).toHaveBeenCalledWith(
      expect.any(String),
      10,
      3600
    );
  });

  it('returns handler response', async () => {
    mocks.mockRateLimit.mockResolvedValue({ success: true, remaining: 9, limit: 10 });
    const handler = vi.fn().mockResolvedValue(new NextResponse('Custom'));
    const wrapped = withRateLimit(handler, { limit: 10, windowInSeconds: 60 });

    const req = new Request('http://test.com/api', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    const response = await wrapped(req);

    expect(response).toBeInstanceOf(NextResponse);
  });

  it('handles remaining 1', async () => {
    mocks.mockRateLimit.mockResolvedValue({ success: true, remaining: 1, limit: 10 });
    const handler = vi.fn().mockResolvedValue(new NextResponse('OK'));
    const wrapped = withRateLimit(handler, { limit: 10, windowInSeconds: 60 });

    const req = new Request('http://test.com/api', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    const response = await wrapped(req);

    expect(response.headers.get('X-RateLimit-Remaining')).toBe('1');
  });

  it('handles remaining 0 but success true', async () => {
    mocks.mockRateLimit.mockResolvedValue({ success: true, remaining: 0, limit: 10 });
    const handler = vi.fn().mockResolvedValue(new NextResponse('OK'));
    const wrapped = withRateLimit(handler, { limit: 10, windowInSeconds: 60 });

    const req = new Request('http://test.com/api', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    const response = await wrapped(req);

    expect(response.status).toBe(200);
  });

  it('handles different paths separately', async () => {
    mocks.mockRateLimit.mockResolvedValue({ success: true, remaining: 9, limit: 10 });
    const handler = vi.fn().mockResolvedValue(new NextResponse('OK'));
    const wrapped = withRateLimit(handler, { limit: 10, windowInSeconds: 60 });

    const req1 = new Request('http://test.com/api/a', { headers: { 'x-forwarded-for': '1.2.3.4' } });
    const req2 = new Request('http://test.com/api/b', { headers: { 'x-forwarded-for': '1.2.3.4' } });

    await wrapped(req1);
    await wrapped(req2);

    expect(mocks.mockRateLimit).toHaveBeenCalledWith('ratelimit:1.2.3.4:/api/a', 10, 60);
    expect(mocks.mockRateLimit).toHaveBeenCalledWith('ratelimit:1.2.3.4:/api/b', 10, 60);
  });

  it('handles different IPs separately', async () => {
    mocks.mockRateLimit.mockResolvedValue({ success: true, remaining: 9, limit: 10 });
    const handler = vi.fn().mockResolvedValue(new NextResponse('OK'));
    const wrapped = withRateLimit(handler, { limit: 10, windowInSeconds: 60 });

    const req1 = new Request('http://test.com/api', { headers: { 'x-forwarded-for': '1.1.1.1' } });
    const req2 = new Request('http://test.com/api', { headers: { 'x-forwarded-for': '2.2.2.2' } });

    await wrapped(req1);
    await wrapped(req2);

    expect(mocks.mockRateLimit).toHaveBeenCalledWith('ratelimit:1.1.1.1:/api', 10, 60);
    expect(mocks.mockRateLimit).toHaveBeenCalledWith('ratelimit:2.2.2.2:/api', 10, 60);
  });

  it('calls rateLimit with correct key format', async () => {
    mocks.mockRateLimit.mockResolvedValue({ success: true, remaining: 9, limit: 10 });
    const handler = vi.fn().mockResolvedValue(new NextResponse('OK'));
    const wrapped = withRateLimit(handler, { limit: 10, windowInSeconds: 60 });

    const req = new Request('http://test.com/api/test', {
      headers: { 'x-forwarded-for': '10.0.0.1' },
    });
    await wrapped(req);

    expect(mocks.mockRateLimit).toHaveBeenCalledWith(
      'ratelimit:10.0.0.1:/api/test',
      10,
      60
    );
  });

  it('handles handler throwing error', async () => {
    mocks.mockRateLimit.mockResolvedValue({ success: true, remaining: 9, limit: 10 });
    const handler = vi.fn().mockRejectedValue(new Error('Handler error'));
    const wrapped = withRateLimit(handler, { limit: 10, windowInSeconds: 60 });

    const req = new Request('http://test.com/api', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    await expect(wrapped(req)).rejects.toThrow('Handler error');
  });

  it('handles limit of 1', async () => {
    mocks.mockRateLimit.mockResolvedValue({ success: true, remaining: 0, limit: 1 });
    const handler = vi.fn().mockResolvedValue(new NextResponse('OK'));
    const wrapped = withRateLimit(handler, { limit: 1, windowInSeconds: 60 });

    const req = new Request('http://test.com/api', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    const response = await wrapped(req);

    expect(response.headers.get('X-RateLimit-Limit')).toBe('1');
  });

  it('handles limit of 100', async () => {
    mocks.mockRateLimit.mockResolvedValue({ success: true, remaining: 99, limit: 100 });
    const handler = vi.fn().mockResolvedValue(new NextResponse('OK'));
    const wrapped = withRateLimit(handler, { limit: 100, windowInSeconds: 60 });

    const req = new Request('http://test.com/api', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    const response = await wrapped(req);

    expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
  });

  it('handles window of 1 second', async () => {
    mocks.mockRateLimit.mockResolvedValue({ success: true, remaining: 9, limit: 10 });
    const handler = vi.fn().mockResolvedValue(new NextResponse('OK'));
    const wrapped = withRateLimit(handler, { limit: 10, windowInSeconds: 1 });

    const req = new Request('http://test.com/api', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    await wrapped(req);

    expect(mocks.mockRateLimit).toHaveBeenCalledWith(
      expect.any(String),
      10,
      1
    );
  });

  it('handles window of 86400 seconds', async () => {
    mocks.mockRateLimit.mockResolvedValue({ success: true, remaining: 99, limit: 100 });
    const handler = vi.fn().mockResolvedValue(new NextResponse('OK'));
    const wrapped = withRateLimit(handler, { limit: 100, windowInSeconds: 86400 });

    const req = new Request('http://test.com/api', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    await wrapped(req);

    expect(mocks.mockRateLimit).toHaveBeenCalledWith(
      expect.any(String),
      100,
      86400
    );
  });

  it('does not add headers when handler returns non-NextResponse', async () => {
    mocks.mockRateLimit.mockResolvedValue({ success: true, remaining: 9, limit: 10 });
    const handler = vi.fn().mockResolvedValue({ body: 'plain' });
    const wrapped = withRateLimit(handler, { limit: 10, windowInSeconds: 60 });

    const req = new Request('http://test.com/api', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    const response = await wrapped(req);

    expect(response.headers?.get?.('X-RateLimit-Limit')).toBeFalsy();
  });
});
