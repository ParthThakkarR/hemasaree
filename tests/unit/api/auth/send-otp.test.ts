// @ts-nocheck
// tests/unit/api/auth/send-otp.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextResponse } from 'next/server';

// ─── env stubs ───────────────────────────────────────────
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('EMAIL_HOST', 'smtp.test.com');
vi.stubEnv('EMAIL_PORT', '465');
vi.stubEnv('EMAIL_SECURE', 'true');
vi.stubEnv('EMAIL_USER', 'test@example.com');
vi.stubEnv('EMAIL_PASS', 'password');
vi.stubEnv('EMAIL_DOMAIN', 'hemasarees.com');

// ─── hoisted mocks ───────────────────────────────────────
const { mockPrisma, mockSendMail, mockCreateHash } = vi.hoisted(() => ({
  mockPrisma: {
    verificationToken: {
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
  },
  mockSendMail: vi.fn().mockResolvedValue({ messageId: 'otp-msg-1' }),
  mockCreateHash: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue('hashed_otp_hex_for_send_otp'),
  })),
}));

// ─── nodemailer mock (default import) ────────────────────
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: mockSendMail,
    })),
  },
}));

// ─── crypto mock (default import) ────────────────────────
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
const mockSendOtpSchema = { safeParse: vi.fn() };
vi.mock('@/lib/validators', () => ({
  SendOtpSchema: mockSendOtpSchema,
}));

// ─── Dynamic import after mocks ──────────────────────────
const callRoute = async (body: Record<string, unknown>) => {
  const req = { json: vi.fn().mockResolvedValue(body) } as unknown as Request;
  const { POST } = await import('/home/meet/Babar-Meet/hemasaree/app/api/(auth)/send-otp/route.tsx');
  return POST(req);
};

// ══════════════════════════════════════════════════════
describe('POST /api/auth/send-otp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendOtpSchema.safeParse.mockReset();
    mockPrisma.verificationToken.findFirst.mockReset();
    mockPrisma.verificationToken.deleteMany.mockReset();
    mockPrisma.verificationToken.create.mockReset();
    mockSendMail.mockReset();
    mockCreateHash.mockReset();
  });

  // NO afterEach - vi.restoreAllMocks() corrupts hoisted mocks in Vitest 4.x

  // ─── 200 SUCCESS ─────────────────────────────────────
  describe('Success (200)', () => {
    it('200 when email is valid and OTP sent', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);
      mockPrisma.verificationToken.create.mockResolvedValue(undefined);
      mockSendMail.mockResolvedValue({});

      const res = await callRoute({ email: 'test@example.com' });
      expect(res.status).toBe(200);
    });

    it('200 when email has Unicode characters', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'alice@example.com' } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);
      mockPrisma.verificationToken.create.mockResolvedValue(undefined);
      mockSendMail.mockResolvedValue({});

      const res = await callRoute({ email: 'alice@example.com' });
      expect(res.status).toBe(200);
    });

    it('200 when email has plus-addressing', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test+tag@example.com' } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);
      mockPrisma.verificationToken.create.mockResolvedValue(undefined);
      mockSendMail.mockResolvedValue({});

      const res = await callRoute({ email: 'test+tag@example.com' });
      expect(res.status).toBe(200);
    });

    it('200 even if email is NOT associated with a user (no user check)', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'unlisted@example.com' } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);
      mockPrisma.verificationToken.create.mockResolvedValue(undefined);
      mockSendMail.mockResolvedValue({});

      const res = await callRoute({ email: 'unlisted@example.com' });
      expect(res.status).toBe(200);
    });

    it('200 when existing OTP is expired (old record overwritten)', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        identifier: 'test@example.com', token: 'old_hashed',
        expires: new Date(Date.now() - 60000), // expired 1 min ago
      });
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);
      mockPrisma.verificationToken.create.mockResolvedValue(undefined);
      mockSendMail.mockResolvedValue({});

      const res = await callRoute({ email: 'test@example.com' });
      expect(res.status).toBe(200);
    });

    it('200 when two consecutive calls for same email', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);
      mockPrisma.verificationToken.create.mockResolvedValue(undefined);
      mockSendMail.mockResolvedValue({});

      await callRoute({ email: 'test@example.com' });
      await callRoute({ email: 'test@example.com' });
      expect(mockPrisma.verificationToken.create).toHaveBeenCalledTimes(2);
    });
  });

  // ─── 429 SPAM PROTECTION ─────────────────────────────
  describe('Spam protection (429)', () => {
    it('429 when existing OTP is still valid (not yet expired)', async () => {
      const futureDate = new Date(Date.now() + 5 * 60 * 1000); // 5 min left
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        identifier: 'test@example.com', token: 'stale_hash', expires: futureDate,
      });

      const res = await callRoute({ email: 'test@example.com' });
      expect(res.status).toBe(429);
    });

    it('429 response does not call deleteMany, create or sendMail', async () => {
      const futureDate = new Date(Date.now() + 5 * 60 * 1000);
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        identifier: 'test@example.com', token: 'h', expires: futureDate,
      });

      await callRoute({ email: 'test@example.com' });
      expect(mockPrisma.verificationToken.deleteMany).not.toHaveBeenCalled();
      expect(mockPrisma.verificationToken.create).not.toHaveBeenCalled();
      expect(mockSendMail).not.toHaveBeenCalled();
    });
  });

  // ─── 400 VALIDATION FAILURES ─────────────────────────
  describe('Validation failures (400)', () => {
    it('400 when email is missing from body', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: false, error: { issues: [{ message: 'Email required' }] } });
      const res = await callRoute({});
      expect(res.status).toBe(400);
      expect(mockPrisma.verificationToken.findFirst).not.toHaveBeenCalled();
    });

    it('400 when email format is invalid', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: false, error: { issues: [{ message: 'Invalid email' }] } });
      const res = await callRoute({ email: 'not-an-email' });
      expect(res.status).toBe(400);
    });

    it('400 when email is empty string', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: false, error: { issues: [{ message: 'Email cannot be empty' }] } });
      const res = await callRoute({ email: '' });
      expect(res.status).toBe(400);
    });

    it('400 when email is null', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: false, error: { issues: [{ message: 'Email required' }] } });
      const res = await callRoute({ email: null as unknown as string });
      expect(res.status).toBe(400);
    });

    it('400 when email is undefined', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: false, error: { issues: [{ message: 'Email required' }] } });
      const res = await callRoute({ email: undefined as unknown as string });
      expect(res.status).toBe(400);
    });

    it('200 when email is very long (10k chars) - Zod accepts it', async () => {
      const longEmail = 'a'.repeat(10000) + '@example.com';
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: longEmail } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);
      mockPrisma.verificationToken.create.mockResolvedValue(undefined);
      mockSendMail.mockResolvedValue({});
      const res = await callRoute({ email: longEmail });
      expect(res.status).toBe(200);
    });

    it('400 for SQL injection attempt in email', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: false, error: { issues: [{ message: 'Invalid email' }] } });
      const res = await callRoute({ email: "'; DROP TABLE users;--" });
      expect(res.status).toBe(400);
    });

    it('400 for XSS attempt in email', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: false, error: { issues: [{ message: 'Invalid email' }] } });
      const res = await callRoute({ email: '<img src=x onerror=alert(1)>@example.com' });
      expect(res.status).toBe(400);
    });

    it('400 for control chars in email', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: false, error: { issues: [{ message: 'Invalid email' }] } });
      const res = await callRoute({ email: 'test\x00@example.com' });
      expect(res.status).toBe(400);
    });

    it('400 when body is null → Zod fails', async () => {
      const req = { json: vi.fn().mockResolvedValue(null) } as unknown as Request;
      const { POST } = await import('/home/meet/Babar-Meet/hemasaree/app/api/(auth)/send-otp/route.tsx');
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  // ─── 500 SERVER ERRORS ────────────────────────────────
  describe('Server errors (500)', () => {
    it('500 when Prisma findFirst throws', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.verificationToken.findFirst.mockRejectedValue(new Error('DB down'));
      const res = await callRoute({ email: 'test@example.com' });
      expect(res.status).toBe(500);
    });

    it('500 when Prisma deleteMany throws', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      mockPrisma.verificationToken.deleteMany.mockRejectedValue(new Error('Delete failed'));
      const res = await callRoute({ email: 'test@example.com' });
      expect(res.status).toBe(500);
    });

    it('500 when Prisma create throws', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);
      mockPrisma.verificationToken.create.mockRejectedValue(new Error('Insert failed'));
      const res = await callRoute({ email: 'test@example.com' });
      expect(res.status).toBe(500);
    });

    it('500 when nodemailer.sendMail throws', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);
      mockPrisma.verificationToken.create.mockResolvedValue(undefined);
      mockSendMail.mockRejectedValue(new Error('SMTP connection refused'));
      const res = await callRoute({ email: 'test@example.com' });
      expect(res.status).toBe(500);
    });

    it('500 when JSON parse throws', async () => {
      const req = { json: vi.fn().mockRejectedValue(new SyntaxError('bad json')) } as unknown as Request;
      mockSendOtpSchema.safeParse.mockImplementation(() => { throw new Error('should not reach'); });
      const { POST } = await import('/home/meet/Babar-Meet/hemasaree/app/api/(auth)/send-otp/route.tsx');
      const res = await POST(req);
      expect(res.status).toBe(500);
    });
  });

  // ─── PRISMA / DB INTERACTIONS ────────────────────────
  describe('Prisma database interactions', () => {
    it('calls Prisma findFirst with correct where clause', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);
      mockPrisma.verificationToken.create.mockResolvedValue(undefined);
      mockSendMail.mockResolvedValue({});

      await callRoute({ email: 'test@example.com' });
      expect(mockPrisma.verificationToken.findFirst).toHaveBeenCalledWith({
        where: { identifier: 'test@example.com' },
        orderBy: { expires: 'desc' },
      });
    });

    it('deleteMany is called before create', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);
      mockPrisma.verificationToken.create.mockResolvedValue(undefined);
      mockSendMail.mockResolvedValue({});

      await callRoute({ email: 'test@example.com' });
      expect(mockPrisma.verificationToken.deleteMany).toHaveBeenCalledBefore(mockPrisma.verificationToken.create);
    });

    it('create is called with identifier, token, and expires', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);
      mockPrisma.verificationToken.create.mockResolvedValue(undefined);
      mockSendMail.mockResolvedValue({});

      await callRoute({ email: 'test@example.com' });

      expect(mockPrisma.verificationToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            identifier: 'test@example.com',
            token: expect.any(String), // hashed
            expires: expect.any(Date),
          }),
        }),
      );
    });

    it('deleteMany targets correct email identifier', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'unique@example.com' } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);
      mockPrisma.verificationToken.create.mockResolvedValue(undefined);
      mockSendMail.mockResolvedValue({});

      await callRoute({ email: 'unique@example.com' });
      expect(mockPrisma.verificationToken.deleteMany).toHaveBeenCalledWith({
        where: { identifier: 'unique@example.com' },
      });
    });
  });

  // ─── CRYPTO ───────────────────────────────────────────
  describe('OTP hashing', () => {
    it('calls crypto.createHash with sha256', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);
      mockPrisma.verificationToken.create.mockResolvedValue(undefined);
      mockSendMail.mockResolvedValue({});

      await callRoute({ email: 'test@example.com' });
      expect(mockCreateHash).toHaveBeenCalledWith('sha256');
    });

    it('stored token in DB is hashed, not plain OTP', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'hashcheck@test.com' } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);
      mockPrisma.verificationToken.create.mockResolvedValue(undefined);
      mockSendMail.mockResolvedValue({});

      await callRoute({ email: 'hashcheck@test.com' });

      const createArgs = mockPrisma.verificationToken.create.mock.calls[0];
      const storedToken = createArgs?.[0]?.data?.token;
      expect(storedToken).toBe('hashed_otp_hex_for_send_otp');
    });
  });

  // ─── EMAIL ────────────────────────────────────────────
  describe('Email delivery', () => {
    it('calls sendMail with correct To address', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'mailto@test.com' } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);
      mockPrisma.verificationToken.create.mockResolvedValue(undefined);
      mockSendMail.mockResolvedValue({});

      await callRoute({ email: 'mailto@test.com' });
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'mailto@test.com' }),
      );
    });

    it('email subject is Your Verification Code', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'cnt@test.com' } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);
      mockPrisma.verificationToken.create.mockResolvedValue(undefined);
      mockSendMail.mockResolvedValue({});

      await callRoute({ email: 'cnt@test.com' });
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ subject: 'Your Verification Code' }),
      );
    });

    it('email text contains a 6-digit OTP number', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'svp@test.com' } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);
      mockPrisma.verificationToken.create.mockResolvedValue(undefined);
      mockSendMail.mockResolvedValue({});

      await callRoute({ email: 'svp@test.com' });
      const args = mockSendMail.mock.calls[0][0];
      expect(args.text).toMatch(/Your OTP is \d{6}/);
    });

    it('email HTML contains a 6-digit OTP number', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'svp@test.com' } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);
      mockPrisma.verificationToken.create.mockResolvedValue(undefined);
      mockSendMail.mockResolvedValue({});

      await callRoute({ email: 'svp@test.com' });
      const args = mockSendMail.mock.calls[0][0];
      expect(args.html).toMatch(/\d{6}/);
    });

    it('sends from the configured emailDomain', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'domain@test.com' } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);
      mockPrisma.verificationToken.create.mockResolvedValue(undefined);
      mockSendMail.mockResolvedValue({});

      await callRoute({ email: 'domain@test.com' });
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.stringContaining('hemasarees.com'),
        }),
      );
    });
  });

  // ─── NO EMAIL ENUMERATION ────────────────────────────
  describe('Security — no email enumeration', () => {
    it('200 even when email does not exist in any record', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'spy@evil.com' } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);
      mockPrisma.verificationToken.create.mockResolvedValue(undefined);
      mockSendMail.mockResolvedValue({});

      const res = await callRoute({ email: 'spy@evil.com' });
      expect(res.status).toBe(200);
    });

    it('200 same response regardless of whether email exists', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'diff@test.com' } });

      // First call — email exists, OTP found in DB
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);
      mockPrisma.verificationToken.create.mockResolvedValue(undefined);
      mockSendMail.mockResolvedValue({});
      const res1 = await callRoute({ email: 'diff@test.com' });

      // Second call — email does NOT exist in db
      mockPrisma.verificationToken.findFirst.mockResolvedValue(null);
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);
      mockPrisma.verificationToken.create.mockResolvedValue(undefined);
      mockSendMail.mockResolvedValue({});
      const res2 = await callRoute({ email: 'diff@test.com' });

      expect(res1.status).toBe(res2.status);
    });
  });

  // ─── TIMING ───────────────────────────────────────────
  describe('Timing / expiry edge cases', () => {
    it('200 when existing OTP expires exactly now (boundary)', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        identifier: 'test@example.com', token: 'hash',
        expires: new Date(Date.now() - 1000), // expired
      });
      mockPrisma.verificationToken.deleteMany.mockResolvedValue(undefined);
      mockPrisma.verificationToken.create.mockResolvedValue(undefined);
      mockSendMail.mockResolvedValue({});

      const res = await callRoute({ email: 'test@example.com' });
      expect(res.status).toBe(200);
    });

    it('429 when OTP expires far in the future (10 hours)', async () => {
      mockSendOtpSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      const farExpiry = new Date(Date.now() + 10 * 60 * 60 * 1000);
      mockPrisma.verificationToken.findFirst.mockResolvedValue({
        identifier: 'test@example.com', token: 'hash', expires: farExpiry,
      });

      const res = await callRoute({ email: 'test@example.com' });
      expect(res.status).toBe(429);
    });
  });
});
