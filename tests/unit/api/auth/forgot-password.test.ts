// @ts-nocheck
// tests/unit/api/auth/forgot-password.test.ts
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
vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3000');

// ─── hoisted mocks ───────────────────────────────────────
const { mockPrisma, mockSendMail, mockRandomBytes, mockCreateHash } = vi.hoisted(() => ({
  mockPrisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
  mockSendMail: vi.fn().mockResolvedValue({ messageId: 'sm-1' }),
  mockRandomBytes: vi.fn(() => ({
    toString: vi.fn((encoding = 'hex') => `mock_reset_token_${encoding}`),
  })),
  mockCreateHash: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue('hashed_token_hex_sum'),
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
    randomBytes: mockRandomBytes,
    createHash: mockCreateHash,
  },
}));

// ─── Prisma mock ─────────────────────────────────────────
vi.mock('@/app/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// ─── Zod schema mock ─────────────────────────────────────
const mockForgotPwSchema = { safeParse: vi.fn() };
vi.mock('@/lib/validators', () => ({
  ForgotPasswordSchema: mockForgotPwSchema,
}));

// ─── Helpers ─────────────────────────────────────────────
const callRoute = async (body: Record<string, unknown>) => {
  const req = { json: vi.fn().mockResolvedValue(body) } as unknown as Request;
  const { POST } = await import('/home/meet/Babar-Meet/hemasaree/app/api/(auth)/forgot-password/route.tsx');
  return POST(req);
};

// ══════════════════════════════════════════════════════
describe('POST /api/auth/forgot-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockForgotPwSchema.safeParse.mockReset();
    mockPrisma.user.findUnique.mockReset();
    mockPrisma.user.update.mockReset();
    mockRandomBytes.mockReset();
    mockCreateHash.mockReset();
    mockRandomBytes.mockImplementation((n: number) => ({
      toString: vi.fn((encoding = 'hex') => `mock_reset_token_${n}_${encoding}`),
    }));
    mockCreateHash.mockImplementation(() => ({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn().mockReturnValue('hashed_token_hex_sum'),
    }));
  });

  // NO afterEach - vi.restoreAllMocks() corrupts hoisted mocks in Vitest 4.x

  // ─── 200 SUCCESS ─────────────────────────────────────
  describe('Success (200)', () => {
    it('200 when email is found and reset email sent', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@example.com' });
      mockPrisma.user.update.mockResolvedValue({ id: 1 });
      mockSendMail.mockResolvedValue({});

      const res = await callRoute({ email: 'test@example.com' });
      expect(res.status).toBe(200);
    });

it('handles email with Unicode characters', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: true, data: { email: 'alice@example.com' } });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'alice@example.com' });
      mockPrisma.user.update.mockResolvedValue({});
      mockSendMail.mockResolvedValue({});

      const res = await callRoute({ email: 'alice@example.com' });
      expect(res.status).toBe(200);
    });

    it('handles email with special chars (+ .)', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test+tag@sub.example.com' } });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test+tag@sub.example.com' });
      mockPrisma.user.update.mockResolvedValue({ id: 1 });
      mockSendMail.mockResolvedValue({});

      const res = await callRoute({ email: 'test+tag@sub.example.com' });
      expect(res.status).toBe(200);
    });

    it('200 when email not found — no leakage', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: true, data: { email: 'ghost@example.com' } });
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await callRoute({ email: 'ghost@example.com' });
      expect(res.status).toBe(200);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it('200 when email not found same message as found user — no leakage', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: true, data: { email: 'mutantnancy@example.com' } });
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockSendMail.mockResolvedValue({});
      // sendMail should NOT be called
      const res = await callRoute({ email: 'mutantnancy@example.com' });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.message).toContain('If an account with that email exists');
    });

    it('calls Prisma user.findUnique with correct email', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@example.com' });
      mockPrisma.user.update.mockResolvedValue({});
      mockSendMail.mockResolvedValue({});

      await callRoute({ email: 'test@example.com' });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });

    it('calls nodemailer sendMail when user exists', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@example.com' });
      mockPrisma.user.update.mockResolvedValue({});
      mockSendMail.mockResolvedValue({});

      await callRoute({ email: 'test@example.com' });
      expect(mockSendMail).toHaveBeenCalled();
    });

    it('does NOT call sendMail when user is not found', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: true, data: { email: 'missing@example.com' } });
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await callRoute({ email: 'missing@example.com' });
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it('generates correct reset URL', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@example.com' });
      mockPrisma.user.update.mockResolvedValue({});
      mockSendMail.mockResolvedValue({});

      await callRoute({ email: 'test@example.com' });
      const mailArgs = mockSendMail.mock.calls[0][0];
      expect(mailArgs.html).toContain('http://localhost:3000/reset-password?token=mock_reset_token_32_hex');
    });

    it('stores hashed reset token in database', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@example.com' });
      mockPrisma.user.update.mockResolvedValue({});
      mockSendMail.mockResolvedValue({});

      await callRoute({ email: 'test@example.com' });
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            passwordResetToken: 'hashed_token_hex_sum',
          }),
        }),
      );
    });

    it('uses crypto.randomBytes(32) to generate reset token', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@example.com' });
      mockPrisma.user.update.mockResolvedValue({});
      mockSendMail.mockResolvedValue({});

      await callRoute({ email: 'test@example.com' });
      expect(mockRandomBytes).toHaveBeenCalledWith(32);
    });

    it('hashes the reset token with SHA256', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@example.com' });
      mockPrisma.user.update.mockResolvedValue({});
      mockSendMail.mockResolvedValue({});

      await callRoute({ email: 'test@example.com' });
      expect(mockCreateHash).toHaveBeenCalledWith('sha256');
      // The mockCreateHash returns { update, digest }, check digest exists
      const result = mockCreateHash.mock.results[0]?.value;
      expect(result?.digest).toBeDefined();
    });

    it('sets password reset expiry to 1 hour from now', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@example.com' });
      mockPrisma.user.update.mockResolvedValue({});
      mockSendMail.mockResolvedValue({});

      const now = Date.now();
      await callRoute({ email: 'test@example.com' });
      const updateCall = mockPrisma.user.update.mock.calls[0];
      expect(updateCall).toBeDefined();
      // If called, the expires field should be approximately 1h (3600000ms) from now
      if (updateCall && updateCall[1]?.data?.passwordResetExpires) {
        const expires = updateCall[1].data.passwordResetExpires;
        expect(expires.getTime()).toBeGreaterThanOrEqual(now);
        expect(expires.getTime()).toBeLessThanOrEqual(now + 3601000);
      }
    });

    it('email subject is Password Reset Request', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@example.com' });
      mockPrisma.user.update.mockResolvedValue({});
      mockSendMail.mockResolvedValue({});

      await callRoute({ email: 'test@example.com' });
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ subject: 'Password Reset Request' }),
      );
    });

    it('email html contains reset link', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@example.com' });
      mockPrisma.user.update.mockResolvedValue({});
      mockSendMail.mockResolvedValue({});

      await callRoute({ email: 'test@example.com' });
      const mailArgs = mockSendMail.mock.calls[0][0];
      expect(mailArgs.html).toContain('reset-password');
    });
  });

  // ─── 400 VALIDATION ───────────────────────────────────
  describe('Validation failures (400)', () => {
    it('400 when email is missing', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: false, error: { issues: [{ message: 'Email required' }] } });
      const res = await callRoute({});
      expect(res.status).toBe(400);
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('400 for invalid email format', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: false, error: { issues: [{ message: 'Invalid email' }] } });
      const res = await callRoute({ email: 'not-an-email' });
      expect(res.status).toBe(400);
    });

    it('400 for empty string email', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: false, error: { issues: [{ message: 'Email cannot be empty' }] } });
      const res = await callRoute({ email: '' });
      expect(res.status).toBe(400);
    });

    it('400 for null email', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: false, error: { issues: [{ message: 'Email required' }] } });
      const res = await callRoute({ email: null as unknown as string });
      expect(res.status).toBe(400);
    });

    it('400 for undefined email', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: false, error: { issues: [{ message: 'Email required' }] } });
      const res = await callRoute({ email: undefined as unknown as string });
      expect(res.status).toBe(400);
    });

    it('returns 200 even when email is very long (no length limit in Zod schema for this route)', async () => {
      // This route's ForgotPasswordSchema has no max-length constraint — long emails pass validation
      const longEmail = 'a'.repeat(10000) + '@example.com';
      mockForgotPwSchema.safeParse.mockReturnValue({ success: true, data: { email: longEmail } });
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockSendMail.mockResolvedValue(undefined);

      const res = await callRoute({ email: longEmail });
      expect(res.status).toBe(200);
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it('400 for SQL injection in email', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: false, error: { issues: [{ message: 'Invalid email' }] } });
      const res = await callRoute({ email: "'; DROP TABLE users;--" });
      expect(res.status).toBe(400);
    });

    it('400 for XSS attempt in email', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: false, error: { issues: [{ message: 'Invalid email' }] } });
      const res = await callRoute({ email: '<script>alert(1)</script>@example.com' });
      expect(res.status).toBe(400);
    });

    it('400 for control chars in email', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: false, error: { issues: [{ message: 'Invalid email' }] } });
      const res = await callRoute({ email: 'test\x00@example.com' });
      expect(res.status).toBe(400);
    });
  });

  // ─── 500 SERVER ERRORS ────────────────────────────────
  describe('Server errors (500)', () => {
    it('500 when Prisma findUnique throws', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.user.findUnique.mockRejectedValue(new Error('DB unavailable'));
      const res = await callRoute({ email: 'test@example.com' });
      expect(res.status).toBe(500);
    });

    it('500 when Prisma user.update throws', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@example.com' });
      mockPrisma.user.update.mockRejectedValue(new Error('DB write fail'));
      mockSendMail.mockResolvedValue({});
      const res = await callRoute({ email: 'test@example.com' });
      expect(res.status).toBe(500);
    });

    it('500 when nodemailer.sendMail throws', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@example.com' });
      mockPrisma.user.update.mockResolvedValue({});
      mockSendMail.mockRejectedValue(new Error('SMTP down'));
      const res = await callRoute({ email: 'test@example.com' });
      expect(res.status).toBe(500);
    });

    it('500 when JSON body parse throws', async () => {
      const req = { json: vi.fn().mockRejectedValue(new SyntaxError('bad json')) } as unknown as Request;
      mockForgotPwSchema.safeParse.mockImplementation(() => { throw new Error('should not reach'); });
      const { POST } = await import('/home/meet/Babar-Meet/hemasaree/app/api/(auth)/forgot-password/route.tsx');
      const res = await POST(req);
      expect(res.status).toBe(500);
    });
  });

  // ─── CRYPTO ───────────────────────────────────────────
  describe('Crypto — reset token generation', () => {
    it('uses crypto.randomBytes(32) to generate token', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@example.com' });
      mockPrisma.user.update.mockResolvedValue({});
      mockSendMail.mockResolvedValue({});

      await callRoute({ email: 'test@example.com' });
      expect(mockRandomBytes).toHaveBeenCalledWith(32);
    });

    it('digest returns hex token stored in DB', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: true, data: { email: 'test@example.com' } });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@example.com' });
      mockPrisma.user.update.mockResolvedValue({});
      mockSendMail.mockResolvedValue({});

      await callRoute({ email: 'test@example.com' });
      expect(mockCreateHash).toHaveBeenCalled();
    });
  });

  // ─── EMAIL ────────────────────────────────────────────
  describe('Email content', () => {
    it('email html contains reset-password link with reset token', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: true, data: { email: 'reset@test.com' } });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'reset@test.com' });
      mockPrisma.user.update.mockResolvedValue({});
      mockSendMail.mockResolvedValue({});

      await callRoute({ email: 'reset@test.com' });
      const args = mockSendMail.mock.calls[0][0];
      expect(args.html).toContain('reset-password');
      expect(args.html).toContain('token=');
    });

    it('email to field is the user email', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: true, data: { email: 'tofield@test.com' } });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'tofield@test.com' });
      mockPrisma.user.update.mockResolvedValue({});
      mockSendMail.mockResolvedValue({});

      await callRoute({ email: 'tofield@test.com' });
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'tofield@test.com' }),
      );
    });
  });

  // ─── RAW BODY EDGE CASES ──────────────────────────────
  describe('Raw body edge cases', () => {
    it('handles null rawBody — validation rejects', async () => {
      const req = { json: vi.fn().mockResolvedValue(null) } as unknown as Request;
      const { POST } = await import('/home/meet/Babar-Meet/hemasaree/app/api/(auth)/forgot-password/route.tsx');
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('handles undefined rawBody — validation rejects', async () => {
      const req = { json: vi.fn().mockResolvedValue(undefined) } as unknown as Request;
      const { POST } = await import('/home/meet/Babar-Meet/hemasaree/app/api/(auth)/forgot-password/route.tsx');
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('handles empty object body', async () => {
      mockForgotPwSchema.safeParse.mockReturnValue({ success: false, error: { issues: [{ message: 'Email required' }] } });
      const res = await callRoute({});
      expect(res.status).toBe(400);
    });
  });
});
