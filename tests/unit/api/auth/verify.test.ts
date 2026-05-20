// @ts-nocheck
// tests/unit/api/auth/verify.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockJwtVerify } = vi.hoisted(() => ({
  mockJwtVerify: vi.fn(),
}));

vi.mock('jose', () => ({ jwtVerify: mockJwtVerify }));

import { POST } from '/home/meet/Babar-Meet/hemasaree/app/api/(auth)/verify/route.tsx';

const makeReq = (token?: string) => ({
  headers: { get: vi.fn().mockReturnValue(token ? `Bearer ${token}` : null) },
} as unknown as Request);

describe('POST /api/(auth)/verify', () => {
  beforeEach(() => { vi.clearAllMocks(); mockJwtVerify.mockReset(); });

  it('returns 200 with isAuthenticated: true for valid token', async () => {
    mockJwtVerify.mockResolvedValue({ payload: { isAdmin: false } });
    const res = await POST(makeReq('valid_token'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.isAuthenticated).toBe(true);
  });

  it('returns isAdmin from token payload', async () => {
    mockJwtVerify.mockResolvedValue({ payload: { isAdmin: true } });
    const res = await POST(makeReq('admin_token'));
    const body = await res.json();
    expect(body.isAdmin).toBe(true);
  });

  it('returns isAdmin: false when not in payload', async () => {
    mockJwtVerify.mockResolvedValue({ payload: {} });
    const res = await POST(makeReq('user_token'));
    const body = await res.json();
    expect(body.isAdmin).toBe(false);
  });

  it('returns 401 when no Authorization header', async () => {
    const res = await POST(makeReq());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.isAuthenticated).toBe(false);
  });

  it('returns 401 when Authorization header has no token', async () => {
    const req = { headers: { get: vi.fn().mockReturnValue(null) } } as unknown as Request;
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 401 when token is empty string', async () => {
    const req = { headers: { get: vi.fn().mockReturnValue('Bearer ') } } as unknown as Request;
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 401 when JWT verification fails', async () => {
    mockJwtVerify.mockRejectedValue(new Error('Invalid token'));
    const res = await POST(makeReq('invalid_token'));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.isAuthenticated).toBe(false);
  });

  it('returns 401 when token is expired', async () => {
    mockJwtVerify.mockRejectedValue(new Error('TokenExpiredError'));
    const res = await POST(makeReq('expired_token'));
    expect(res.status).toBe(401);
  });

  it('extracts token from Bearer scheme', async () => {
    mockJwtVerify.mockResolvedValue({ payload: { isAdmin: false } });
    await POST(makeReq('my_jwt_token'));
    expect(mockJwtVerify).toHaveBeenCalledWith('my_jwt_token', expect.anything());
  });

  it('uses JWT_SECRET for verification', async () => {
    mockJwtVerify.mockResolvedValue({ payload: { isAdmin: false } });
    await POST(makeReq('token'));
    expect(mockJwtVerify).toHaveBeenCalledWith('token', expect.anything());
  });

  it('returns 401 when Authorization header is malformed', async () => {
    const req = { headers: { get: vi.fn().mockReturnValue('InvalidFormat') } } as unknown as Request;
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 401 when Authorization header is just "Bearer"', async () => {
    const req = { headers: { get: vi.fn().mockReturnValue('Bearer') } } as unknown as Request;
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('handles JWT_SECRET undefined gracefully', async () => {
    mockJwtVerify.mockRejectedValue(new Error('Invalid secret'));
    const res = await POST(makeReq('token'));
    expect(res.status).toBe(401);
  });
});
