// @ts-nocheck
// tests/unit/api/auth/verify-otp.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextResponse } from 'next/server';

// ─── Hoisted mocks ───────────────────────────────────────
const { mockPrisma, mockCreateHash } = vi.hoisted(() => ({
  mockPrisma: {
    verificationToken: {
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
  mockCreateHash: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue('hashed_otp_for_verify'),
  })),
}));

// ─── crypto (default import) mock ────────────────────────
vi.mock('crypto', () => ({
  default: {
    createHash: mockCreateHash,
  },
}));

// ─── Prisma mock ─────────────────────────────────────────
vi.mock('@/app/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// ─── Zod schema mock ─────────────────────────────────────
const mockVerifySchema = { safeParse: vi.fn() };
vi.mock('@/lib/validators', () => ({
  VerifyOtpSchema: mockVerifySchema,
}));

// ─── Helper ──────────────────────────────────────────────
const callRoute = async (rawBody: Record<string, unknown>) => {
  const req = { json: vi.fn().mockResolvedValue(rawBody) } as unknown as Request;
  const { POST } = await import('/home/meet/Babar-Meet/hemasaree/app/api/(auth)/verify-otp/route.tsx');
  return POST(req);
};

// ══════════════════════════════════════════════════════
describe('POST /api/auth/verify-otp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifySchema.safeParse.mockReset();
    mockPrisma.verificationToken.findFirst.mockReset();
    mockPrisma.verificationToken.deleteMany.mockReset();
    mockCreateHash.mockReset();
    mockCreateHash.mockImplementation(() => ({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn().mockReturnValue('hashed_otp_for_verify'),
    }));
  });

  // NO afterEach - vi.restoreAllMocks() corrupts hoisted mocks in Vitest 4.x

  // ─── 200 SUCCESS ────────────────────────────────────
  describe('200 — OTP verified', () => {
    it('returns 200 when OTP is valid and email is correct', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: true, data: { email: 'Test@Example.com', otp: '123456' }, });
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        identifier: 'test@example.com', token: 'hashed_otp_for_verify',
        expires: new Date(Date.now() + 10 * 60 * 1000), });
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);

      const res = await callRoute({ email: 'Test@Example.com', otp: '123456' });
      expect(res.status).toBe(200);
    });

    it('deletes OTP from DB after successful verification', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: true, data: { email: 'test@example.com', otp: '123456' }, });
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        identifier: 'test@example.com', token: 'hashed_otp_for_verify',
        expires: new Date(Date.now() + 10 * 60 * 1000), });
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);

      await callRoute({ email: 'test@example.com', otp: '123456' });
      expect(mockPrisma.verificationToken.deleteMany).toHaveBeenCalledWith({
        where: { identifier: 'test@example.com' }, });
    });

    it('only first verification attempt to succeed (OTP deleted after use)', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: true, data: { email: 'test@example.com', otp: '123456' }, });
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        identifier: 'test@example.com', token: 'hashed_otp_for_verify',
        expires: new Date(Date.now() + 10 * 60 * 1000), });
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);

      let res = await callRoute({ email: 'test@example.com', otp: '123456' });
      expect(res.status).toBe(200);

      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      res = await callRoute({ email: 'test@example.com', otp: '123456' });
      expect(res.status).toBe(400);
    });

    it('normalizes email (trim and lowercase) before findFirst', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: true, data: { email: '  TEST@EXAMPLE.COM  ', otp: '123456' }, });
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        identifier: 'test@example.com', token: 'hashed_otp_for_verify',
        expires: new Date(Date.now() + 10 * 60 * 1000), });
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);

      await callRoute({ email: '  TEST@EXAMPLE.COM  ', otp: '123456' });
      expect(mockPrisma.verificationToken.findFirst).toHaveBeenCalledWith({
        where: { identifier: 'test@example.com' },
        orderBy: { expires: 'desc' },
      });
    });

    it('normalizes OTP (trim) before hash comparison', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: true, data: { email: 'test@example.com', otp: ' 123456 ' }, });
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        identifier: 'test@example.com', token: 'hashed_123456',
        expires: new Date(Date.now() + 10 * 60 * 1000), });
      mockCreateHash.mockImplementation(() => ({
        update: vi.fn().mockReturnThis(),
        digest: vi.fn().mockReturnValue('hashed_123456'),
      }));
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);

      const res = await callRoute({ email: 'test@example.com', otp: ' 123456 ' });
      expect(res.status).toBe(200);
    });

    it('hashes OTP correctly for comparison', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: true, data: { email: 'test@example.com', otp: '654321' }, });
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        identifier: 'test@example.com', token: 'hashed_654321',
        expires: new Date(Date.now() + 10 * 60 * 1000), });
      mockCreateHash.mockImplementation(() => ({
        update: vi.fn().mockReturnThis(),
        digest: vi.fn().mockReturnValue('hashed_654321'),
      }));
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);

      const res = await callRoute({ email: 'test@example.com', otp: '654321' });
      expect(res.status).toBe(200);
    });

    it('handles Unicode email address', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: true, data: { email: 'alice@example.com', otp: '123456' }, });
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        identifier: 'alice@example.com', token: 'hashed_otp_for_verify',
        expires: new Date(Date.now() + 10 * 60 * 1000), });
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);

      const res = await callRoute({ email: 'alice@example.com', otp: '123456' });
      expect(res.status).toBe(200);
    });

    it('calls Prisma findFirst with orderBy expires desc', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: true, data: { email: 'test@example.com', otp: '123456' }, });
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        identifier: 'test@example.com', token: 'hashed_otp_for_verify',
        expires: new Date(Date.now() + 10 * 60 * 1000), });
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);

      await callRoute({ email: 'test@example.com', otp: '123456' });
      expect(mockPrisma.verificationToken.findFirst).toHaveBeenCalledWith({
        where: { identifier: 'test@example.com' },
        orderBy: { expires: 'desc' },
      });
    });

    it('calls Prisma deleteMany with identifier only', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: true, data: { email: 'test@example.com', otp: '123456' }, });
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        identifier: 'test@example.com', token: 'hashed_otp_for_verify',
        expires: new Date(Date.now() + 10 * 60 * 1000), });
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);

      await callRoute({ email: 'test@example.com', otp: '123456' });
      expect(mockPrisma.verificationToken.deleteMany).toHaveBeenCalledWith({
        where: { identifier: 'test@example.com' },
      });
    });

    it('response body has message Email verified successfully', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: true, data: { email: 'test@example.com', otp: '123456' }, });
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        identifier: 'test@example.com', token: 'hashed_otp_for_verify',
        expires: new Date(Date.now() + 10 * 60 * 1000), });
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);

      const res = await callRoute({ email: 'test@example.com', otp: '123456' });
      const body = await res.json();
      expect(body.message).toBe('Email verified successfully!');
    });
  });

  // ─── 400 — OTP NOT FOUND / INVALID / EXPIRED ────────
  describe('400 — OTP failures', () => {
    it('400 when OTP record not found in DB', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: true, data: { email: 'test@example.com', otp: '123456' }, });
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);

      const res = await callRoute({ email: 'test@example.com', otp: '123456' });
      expect(res.status).toBe(400);
      expect(mockPrisma.verificationToken.deleteMany).not.toHaveBeenCalled();
    });

    it('400 when OTP hash does not match', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: true, data: { email: 'test@example.com', otp: 'wrongotp' }, });
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        identifier: 'test@example.com', token: 'correct_hash',
        expires: new Date(Date.now() + 10 * 60 * 1000), });

      const res = await callRoute({ email: 'test@example.com', otp: 'wrongotp' });
      expect(res.status).toBe(400);
      expect(mockPrisma.verificationToken.deleteMany).not.toHaveBeenCalled();
    });

    it('400 when OTP has expired (expires in the past)', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: true, data: { email: 'test@example.com', otp: '123456' }, });
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        identifier: 'test@example.com', token: 'hashed_otp_for_verify',
        expires: new Date(Date.now() - 60000), }); // 1 min ago

      const res = await callRoute({ email: 'test@example.com', otp: '123456' });
      expect(res.status).toBe(400);
      expect(mockPrisma.verificationToken.deleteMany).not.toHaveBeenCalled();
    });

    it('400 when OTP expires exactly now (boundary)', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: true, data: { email: 'test@example.com', otp: '123456' }, });
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        identifier: 'test@example.com', token: 'hashed_otp_for_verify',
        expires: new Date(Date.now() - 1), }); // 1ms in the past

      const res = await callRoute({ email: 'test@example.com', otp: '123456' });
      expect(res.status).toBe(400);
    });
  });

  // ─── 400 — VALIDATION FAILURES ──────────────────────
  describe('400 — validation failures', () => {
    it('400 when email is missing from body', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: false, error: { issues: [{ message: 'Email is required' }] }, });

      const res = await callRoute({ otp: '123456' });
      expect(res.status).toBe(400);
      expect(mockPrisma.verificationToken.findFirst).not.toHaveBeenCalled();
    });

    it('400 when OTP is missing from body', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: false, error: { issues: [{ message: 'OTP is required' }] }, });

      const res = await callRoute({ email: 'test@example.com' });
      expect(res.status).toBe(400);
      expect(mockPrisma.verificationToken.findFirst).not.toHaveBeenCalled();
    });

    it('400 when email format is invalid', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: false, error: { issues: [{ message: 'Invalid email' }] }, });

      const res = await callRoute({ email: 'not-an-email', otp: '123456' });
      expect(res.status).toBe(400);
    });

    it('400 when OTP is empty string', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: false, error: { issues: [{ message: 'OTP cannot be empty' }] }, });

      const res = await callRoute({ email: 'test@example.com', otp: '' });
      expect(res.status).toBe(400);
    });

    it('400 for SQL injection in OTP', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: false, error: { issues: [{ message: 'Invalid OTP' }] }, });

      const res = await callRoute({ email: 'test@example.com', otp: "'; DROP TABLE tokens;--" });
      expect(res.status).toBe(400);
    });

    it('400 for XSS in email body', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: false, error: { issues: [{ message: 'Invalid email' }] }, });

      const res = await callRoute({ email: '<script>xss</script>@example.com', otp: '123' });
      expect(res.status).toBe(400);
    });

    it('400 when email is null', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: false, error: { issues: [{ message: 'Email required' }] }, });

      const res = await callRoute({ email: null as unknown as string, otp: '123' });
      expect(res.status).toBe(400);
    });

    it('400 when email is undefined', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: false, error: { issues: [{ message: 'Email required' }] }, });

      const res = await callRoute({ email: undefined as unknown as string, otp: '123' });
      expect(res.status).toBe(400);
    });

    it('400 when OTP is null', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: false, error: { issues: [{ message: 'OTP required' }] }, });

      const res = await callRoute({ email: 'test@example.com', otp: null as unknown as string });
      expect(res.status).toBe(400);
    });

    it('400 when OTP is undefined', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: false, error: { issues: [{ message: 'OTP required' }] }, });

      const res = await callRoute({ email: 'test@example.com', otp: undefined as unknown as string });
      expect(res.status).toBe(400);
    });
  });

  // ─── 500 — SERVER ERRORS ─────────────────────────────
  describe('500 — server errors', () => {
    it('500 when Prisma findFirst throws', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: true, data: { email: 'test@example.com', otp: '123456' }, });
      mockPrisma.verificationToken.findFirst.mockRejectedValue(new Error('DB connection error'));

      const res = await callRoute({ email: 'test@example.com', otp: '123456' });
      expect(res.status).toBe(500);
    });

    it('500 when Prisma deleteMany throws', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: true, data: { email: 'test@example.com', otp: '123456' }, });
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        identifier: 'test@example.com', token: 'hashed_otp_for_verify',
        expires: new Date(Date.now() + 10 * 60 * 1000), });
      mockPrisma.verificationToken.deleteMany.mockRejectedValue(new Error('Delete failed'));

      const res = await callRoute({ email: 'test@example.com', otp: '123456' });
      expect(res.status).toBe(500);
    });

    it('500 when JSON body parse throws', async () => {
      const req = { json: vi.fn().mockRejectedValue(new SyntaxError('bad json')) } as unknown as Request;
      mockVerifySchema.safeParse.mockImplementation(() => { throw new Error('should not reach'); });

      const { POST } = await import('/home/meet/Babar-Meet/hemasaree/app/api/(auth)/verify-otp/route.tsx');
      const res = await POST(req);
      expect(res.status).toBe(500);
    });
  });

  // ─── IDEMPOTENCY / SECURITY ──────────────────────────
  describe('Security & idempotency', () => {
    it('does not call deleteMany when OTP not found', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: true, data: { email: 'test@example.com', otp: '123456' }, });
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);

      await callRoute({ email: 'test@example.com', otp: '123456' });
      expect(mockPrisma.verificationToken.deleteMany).not.toHaveBeenCalled();
    });

    it('does not call deleteMany when OTP expired', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: true, data: { email: 'test@example.com', otp: '123456' }, });
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        identifier: 'test@example.com', token: 'hash',
        expires: new Date(Date.now() - 60000), });

      await callRoute({ email: 'test@example.com', otp: '123456' });
      expect(mockPrisma.verificationToken.deleteMany).not.toHaveBeenCalled();
    });

    it('does not call deleteMany when OTP hash is wrong', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: true, data: { email: 'test@example.com', otp: 'badotp' }, });
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        identifier: 'test@example.com', token: 'correct_hash',
        expires: new Date(Date.now() + 10 * 60 * 1000), });

      await callRoute({ email: 'test@example.com', otp: 'badotp' });
      expect(mockPrisma.verificationToken.deleteMany).not.toHaveBeenCalled();
    });

    it('Second successful call is not possible (OTP already deleted)', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: true, data: { email: 'test@example.com', otp: '123456' }, });
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        identifier: 'test@example.com', token: 'hashed',
        expires: new Date(Date.now() + 10 * 60 * 1000), });
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);

      await callRoute({ email: 'test@example.com', otp: '123456' });

      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      const res2 = await callRoute({ email: 'test@example.com', otp: '123456' });
      expect(res2.status).toBe(400);
    });
  });

  // ─── EDGE CASES ──────────────────────────────────────
  describe('Edge cases', () => {
    it('handles email with uppercase override', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: true, data: { email: 'USER@TEST.COM', otp: '123456' }, });
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        identifier: 'user@test.com', token: 'hashed_otp_for_verify',
        expires: new Date(Date.now() + 10 * 60 * 1000), });
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);

      const res = await callRoute({ email: 'USER@TEST.COM', otp: '123456' });
      expect(res.status).toBe(200);
      expect(mockPrisma.verificationToken.findFirst).toHaveBeenCalledWith({
        where: { identifier: 'user@test.com' },
        orderBy: { expires: 'desc' },
      });
    });

    it('handles OTP with leading zeros trimmed', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: true, data: { email: 'test@example.com', otp: ' 001234 ' }, });
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        identifier: 'test@example.com', token: 'hashed_001234',
        expires: new Date(Date.now() + 10 * 60 * 1000), });
      mockCreateHash.mockImplementation(() => ({
        update: vi.fn().mockReturnThis(),
        digest: vi.fn().mockReturnValue('hashed_001234'),
      }));
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);

      const res = await callRoute({ email: 'test@example.com', otp: ' 001234 ' });
      expect(res.status).toBe(200);
    });

it('handles OTP with Unicode digits (returned as string)', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: false, error: { issues: [{ message: 'OTP must be 6 digits' }] }, });

      const res = await callRoute({ email: 'test@example.com', otp: '١٢٣٣٦' });
      expect(res.status).toBe(400);
    });

    it('handles very long OTP string (trimmed to whatever user sent)', async () => {
      mockVerifySchema.safeParse.mockReturnValue({
        success: false, error: { issues: [{ message: 'OTP must be 6 digits' }] }, });

      const res = await callRoute({ email: 'test@example.com', otp: 'A'.repeat(1000) });
      expect(res.status).toBe(400);
    });

    it('handles null body — validation rejects', async () => {
      const req = { json: vi.fn().mockResolvedValue(null) } as unknown as Request;
      const { POST } = await import('/home/meet/Babar-Meet/hemasaree/app/api/(auth)/verify-otp/route.tsx');
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('handles entire nullish response body', async () => {
      const req = { json: vi.fn().mockResolvedValue(undefined) } as unknown as Request;
      const { POST } = await import('/home/meet/Babar-Meet/hemasaree/app/api/(auth)/verify-otp/route.tsx');
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });
});
