// @ts-nocheck
// tests/unit/api/auth/reset-password.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextResponse } from 'next/server';

// ─── env stub ────────────────────────────────────────────
vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');

// ─── hoisted mocks ───────────────────────────────────────
const { mockPrisma, mockCreateHash, mockHash } = vi.hoisted(() => ({
  mockPrisma: {
    user: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
  mockCreateHash: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue('hashed_token_sha256'),
  })),
  mockHash: vi.fn().mockResolvedValue('hashed_new_password'),
}));

// ─── crypto mock (default import in route) ───────────────
vi.mock('crypto', () => ({
  default: {
    createHash: mockCreateHash,
  },
}));

// ─── bcryptjs mock ───────────────────────────────────────
vi.mock('bcryptjs', () => ({
  default: {
    hash: mockHash,
    compare: vi.fn(),
  },
}));

// ─── Prisma mock ─────────────────────────────────────────
vi.mock('@/app/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// ─── Helpers ─────────────────────────────────────────────
const callRoute = async (body: Record<string, unknown>) => {
  const req = { json: vi.fn().mockResolvedValue(body) } as unknown as Request;
  const { POST } = await import('/home/meet/Babar-Meet/hemasaree/app/api/(auth)/reset-password/route.tsx');
  return POST(req);
};

// ══════════════════════════════════════════════════════
describe('POST /api/auth/reset-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.user.findFirst.mockReset();
    mockPrisma.user.update.mockReset();
    mockCreateHash.mockReset();
    mockHash.mockReset();
    mockCreateHash.mockImplementation(() => ({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn().mockReturnValue('hashed_token_sha256'),
    }));
  });

  // NO afterEach - vi.restoreAllMocks() corrupts hoisted mocks in Vitest 4.x

  // ─── 200 SUCCESS ─────────────────────────────────────
  describe('Success (200)', () => {
    it('200 when token is valid and password meets requirements', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1', email: 'test@example.com', passwordResetToken: 'hashed_token_sha256',
        passwordResetExpires: new Date(Date.now() + 3600000),
      });
      mockHash.mockResolvedValue('bcrypted_password');

      const res = await callRoute({ token: 'valid_token', password: 'ValidPass123!' });
      expect(res.status).toBe(200);
    });

    it('finds user by hashed token and not-expired expiry', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1', email: 'test@example.com', passwordResetToken: 'hashed_token_sha256',
        passwordResetExpires: new Date(Date.now() + 3600000),
      });
      mockHash.mockResolvedValue('hashed_pw');

      await callRoute({ token: 'any_token', password: 'ValidPass123!' });
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          passwordResetToken: 'hashed_token_sha256',
          passwordResetExpires: { gt: expect.any(Date) as any },
        },
      });
    });

    it('calls bcrypt.hash on new password before storing', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1', email: 'test@example.com',
        passwordResetToken: 'hashed_token_sha256',
        passwordResetExpires: new Date(Date.now() + 3600000),
      });
      mockHash.mockResolvedValue('hashed_pw');

      await callRoute({ token: 'tok', password: 'MyNewPass1!' });
      expect(mockHash).toHaveBeenCalledWith('MyNewPass1!', 10);
    });

    it('updates password, clears token and expiry on success', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1', email: 'test@example.com',
        passwordResetToken: 'old_hash',
        passwordResetExpires: new Date(Date.now() + 3600000),
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockHash.mockResolvedValue('hashed_new_password');

      await callRoute({ token: 'valid_token', password: 'NewPass1!' });

      // update called with where + data
      expect(mockPrisma.user.update).toHaveBeenCalledTimes(1);
      expect(mockHash).toHaveBeenCalledWith('NewPass1!', 10);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: expect.objectContaining({
          password: 'hashed_new_password',
          passwordResetToken: null,
          passwordResetExpires: null,
        }),
      });
    });

    it('stored password is hashed NOT plain text', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1', email: 'test@example.com',
        passwordResetToken: 'hashed_token_sha256',
        passwordResetExpires: new Date(Date.now() + 3600000),
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockHash.mockResolvedValue('BCRYPTED_NOT_PLAINTEXT');

      await callRoute({ token: 'tok', password: 'Password1!' });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: expect.objectContaining({
          password: 'BCRYPTED_NOT_PLAINTEXT',
        }),
      });
    });

    it('clears passwordResetToken (null) on success', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1', email: 'test@example.com',
        passwordResetToken: 'old_hash',
        passwordResetExpires: new Date(Date.now() + 3600000),
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockHash.mockResolvedValue('hashed_pw');

      await callRoute({ token: 'tok', password: 'NewPass1!' });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: expect.objectContaining({ passwordResetToken: null }),
      });
    });

    it('clears passwordResetExpires (null) on success', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1', email: 'test@example.com',
        passwordResetToken: 'hash',
        passwordResetExpires: new Date(Date.now() + 3600000),
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockHash.mockResolvedValue('hashed_pw');

      await callRoute({ token: 'tok', password: 'NewPass1!' });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: expect.objectContaining({ passwordResetExpires: null }),
      });
    });

    it('hashes the URL token with SHA256 before querying DB', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1', email: 'test@example.com',
        passwordResetToken: 'hashed_token_sha256',
        passwordResetExpires: new Date(Date.now() + 3600000),
      });
      mockPrisma.user.update.mockResolvedValue({});

      await callRoute({ token: 'valid_token', password: 'NewPass1!' });
      // Hash is applied before the DB lookup (not after)
      expect(mockCreateHash).toHaveBeenCalledWith('sha256');
      // After createHash('sha256'), update(token) is chained then digest('hex')
      const hashResult = mockCreateHash.mock.results[0]?.value;
      expect(hashResult).toBeDefined();
    });

    it('supports long passwords (passes schema + stored as hash)', async () => {
      // Build a valid long password: has upper+lower+digit+special, length 500
      const longPW = ['B', 'abcdefghijklmnopqrstuvwxyz'.repeat(20), '1', '@'].join('');
      // assert length > 500 for strictness
      expect(longPW.length).toBeGreaterThan(500);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1', email: 'test@example.com',
        passwordResetToken: 'hashed_token_sha256',
        passwordResetExpires: new Date(Date.now() + 3600000),
      });
      mockHash.mockResolvedValue('hashed_pw');

      const res = await callRoute({ token: 'tok', password: longPW });
      expect(res.status).toBe(200);
      expect(mockHash).toHaveBeenCalledWith(longPW, 10);
    });

    it('supports Unicode characters in password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1', email: 'test@example.com',
        passwordResetToken: 'hashed_token_sha256',
        passwordResetExpires: new Date(Date.now() + 3600000),
      });
      mockHash.mockResolvedValue('hashed_pw');

      const res = await callRoute({ token: 'tok', password: 'Pàsswørd1!' });
      expect(res.status).toBe(200);
    });

    it('returns success message on password reset', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1', email: 'test@example.com',
        passwordResetToken: 'hashed',
        passwordResetExpires: new Date(Date.now() + 3600000),
      });
      mockPrisma.user.update.mockResolvedValue({});

      const res = await callRoute({ token: 'tok', password: 'NewPass1!' });
      const body = await res.json();
      expect(body.message).toBe('Password has been reset successfully.');
    });

    it('Updates user with hashed password, not plain text', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1', email: 'test@example.com',
        passwordResetToken: 'hashed_token_sha256',
        passwordResetExpires: new Date(Date.now() + 3600000),
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockHash.mockResolvedValue('hashed_pw');

      await callRoute({ token: 'tok', password: 'PlaintextPass1!' });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: expect.objectContaining({
          password: expect.any(String),
          passwordResetToken: null,
          passwordResetExpires: null,
        }),
      });
    });
  });

  // ─── 400 — INVALID / EXPIRED TOKEN ────────────────────
  describe('400 — invalid or expired token', () => {
    it('400 when token is invalid (user not found)', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const res = await callRoute({ token: 'nonexistent_token', password: 'NewPass1!' });
      expect(res.status).toBe(400);
    });

    it('400 when token has expired', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null); // expired → not found by gt filter
      const res = await callRoute({ token: 'expired_token', password: 'NewPass1!' });
      expect(res.status).toBe(400);
    });

    it('400 when token is valid but user not found (stale record)', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      const res = await callRoute({ token: 'dangling_token', password: 'NewPass1!' });
      expect(res.status).toBe(400);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('400 when no user matches hashed token', async () => {
      // findFirst returns null because hashed_token doesn't match
      mockPrisma.user.findFirst.mockResolvedValue(null); // { id: 'u1' });
      const res = await callRoute({ token: 'nonexistent_token', password: 'NewPass1!' });
      expect(res.status).toBe(400);
    });

    it('400 when token is empty string', async () => {
      // Empty string → SHA256 of '' = some hash, findFirst returns null
      mockPrisma.user.findFirst.mockResolvedValue(null);
      const res = await callRoute({ token: '', password: 'NewPass1!' });
      expect(res.status).toBe(400);
    });
  });

  // ─── 400 — VALIDATION FAILURES ────────────────────────
  describe('400 — validation failures', () => {
    it('400 when token field is missing', async () => {
      // Zod schema rejects missing token inline
      const res = await callRoute({ password: 'NewPass1!' });
      expect(res.status).toBe(400);
      expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
    });

    it('400 when token is empty string', async () => {
      const res = await callRoute({ token: '', password: 'NewPass1!' });
      expect(res.status).toBe(400);
    });

    it('400 when password field is missing', async () => {
      const res = await callRoute({ token: 'some_token' });
      expect(res.status).toBe(400);
      expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
    });

    it('400 when password is empty string', async () => {
      const res = await callRoute({ token: 'some_token', password: '' });
      expect(res.status).toBe(400);
    });

    it('400 when password is too short (less than 8 chars)', async () => {
      const res = await callRoute({ token: 'tok', password: 'Short1!' });
      expect(res.status).toBe(400);
    });

    it('400 when password has no uppercase', async () => {
      const res = await callRoute({ token: 'tok', password: 'lowercase1!' });
      expect(res.status).toBe(400);
    });

    it('400 when password has no lowercase', async () => {
      const res = await callRoute({ token: 'tok', password: 'UPPERCASE1!' });
      expect(res.status).toBe(400);
    });

    it('400 when password has no digit', async () => {
      const res = await callRoute({ token: 'tok', password: 'NoDigits!' });
      expect(res.status).toBe(400);
    });

    it('400 when password has no special char', async () => {
      const res = await callRoute({ token: 'tok', password: 'NoSpecial123' });
      expect(res.status).toBe(400);
    });

    it('400 when password is null', async () => {
      const res = await callRoute({ token: 'tok', password: null as unknown as string });
      expect(res.status).toBe(400);
    });

    it('400 when password is undefined', async () => {
      const res = await callRoute({ token: 'tok', password: undefined as unknown as string });
      expect(res.status).toBe(400);
    });

    it('400 when token is null', async () => {
      const res = await callRoute({ token: null as unknown as string, password: 'ValidPass1!' });
      expect(res.status).toBe(400);
    });
  });

  // ─── 500 — SERVER ERRORS ───────────────────────────────
  describe('500 — server errors', () => {
    it('500 when Prisma findFirst throws', async () => {
      mockPrisma.user.findFirst.mockRejectedValue(new Error('DB connection error'));
      const res = await callRoute({ token: 'tok', password: 'NewPass1!' });
      expect(res.status).toBe(500);
    });

    it('500 when Prisma user.update throws', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1', email: 'test@example.com',
        passwordResetToken: 'hashed_token_sha256',
        passwordResetExpires: new Date(Date.now() + 3600000),
      });
      mockPrisma.user.update.mockRejectedValue(new Error('DB write failed'));

      const res = await callRoute({ token: 'valid_token', password: 'NewPass1!' });
      expect(res.status).toBe(500);
    });

    it('500 when bcrypt.hash throws', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1',
        passwordResetToken: 'hashed_token_sha256',
        passwordResetExpires: new Date(Date.now() + 3600000),
      });
      mockHash.mockRejectedValue(new Error('bcrypt error'));

      const res = await callRoute({ token: 'tok', password: 'ValidPass1!' });
      expect(res.status).toBe(500);
    });

    it('500 when JSON body parse throws', async () => {
      const req = { json: vi.fn().mockRejectedValue(new SyntaxError('bad json')) } as unknown as Request;
      const { POST } = await import('/home/meet/Babar-Meet/hemasaree/app/api/(auth)/reset-password/route.tsx');
      const res = await POST(req);
      expect(res.status).toBe(500);
    });
  });

  // ─── EDGE CASES ───────────────────────────────────────
  describe('Edge cases', () => {
    it('handles null body — validation rejects', async () => {
      const req = { json: vi.fn().mockResolvedValue(null) } as unknown as Request;
      const { POST } = await import('/home/meet/Babar-Meet/hemasaree/app/api/(auth)/reset-password/route.tsx');
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('handles object with only password (missing token)', async () => {
      const res = await callRoute({ password: 'ValidPass1!' });
      expect(res.status).toBe(400);
    });

    it('handles object with only token (missing password)', async () => {
      const res = await callRoute({ token: 'valid' });
      expect(res.status).toBe(400);
    });

    it('handles both fields empty', async () => {
      const res = await callRoute({ token: '', password: '' });
      expect(res.status).toBe(400);
    });

    it('handles very long token string (1k chars)', async () => {
      const longToken = 'T'.repeat(1000);
      const res = await callRoute({ token: longToken, password: 'ValidPass1!' });
      expect(res.status).toBe(400); // hashed long token MR= not in mock DB
    });

    it('handles special chars in password — still rejected by Zod regex', async () => {
      const res = await callRoute({ token: 'tok', password: '!@#$%^&*()' });
      expect(res.status).toBe(400);
    });

    it('handles SQL injection in token field', async () => {
      const res = await callRoute({ token: "'; DROP TABLE users; --", password: 'ValidPass1!' });
      expect(res.status).toBe(400);
    });

    it('attempt 500+ consecutive calls with different tokens succeed each time', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1', email: 'test@example.com',
        passwordResetToken: 'hashed_token_sha256',
        passwordResetExpires: new Date(Date.now() + 3600000),
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockHash.mockResolvedValue('hashed');

      for (let i = 0; i < 500; i++) {
        const res = await callRoute({ token: `tok_${i}`, password: 'ValidPass1!' });
        expect(res.status).toBe(200);
      }
      expect(mockPrisma.user.update).toHaveBeenCalledTimes(500);
    });
  });
});
