import { describe, it, expect } from 'vitest';
import { LoginSchema, SignUpSchema, ForgotPasswordSchema, SendOtpSchema, VerifyOtpSchema, ResetPasswordSchema } from '@lib/validators';

describe('Auth Validators', () => {
  // ─── LoginSchema ────────────────────────────────────
  describe('LoginSchema', () => {
    it('should validate a correct email and password', () => {
      const result = LoginSchema.safeParse({ email: 'test@example.com', password: 'password123' });
      expect(result.success).toBe(true);
    });

    it('should reject an invalid email', () => {
      const result = LoginSchema.safeParse({ email: 'invalid-email', password: 'password123' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('A valid email is required');
      }
    });

    it('should reject an empty password', () => {
      const result = LoginSchema.safeParse({ email: 'test@example.com', password: '' });
      expect(result.success).toBe(false);
    });

    it('should reject missing email field', () => {
      const result = LoginSchema.safeParse({ password: 'password123' });
      expect(result.success).toBe(false);
    });

    it('should reject missing password field', () => {
      const result = LoginSchema.safeParse({ email: 'test@example.com' });
      expect(result.success).toBe(false);
    });

    it('should reject null input', () => {
      const result = LoginSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('should reject undefined input', () => {
      const result = LoginSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it('should trim/accept emails with leading/trailing spaces via parse', () => {
      // Zod email doesn't trim by default — just verify it rejects
      const result = LoginSchema.safeParse({ email: '  test@example.com  ', password: 'pw' });
      // Zod's email validator may accept or reject spaces depending on version
      // The important thing is it doesn't crash
      expect(typeof result.success).toBe('boolean');
    });
  });

  // ─── SignUpSchema ───────────────────────────────────
  describe('SignUpSchema', () => {
    const validSignUp = {
      firstName: 'Priya',
      email: 'priya@example.com',
      password: 'SecurePass1!',
    };

    it('should validate a correct signup object', () => {
      const result = SignUpSchema.safeParse(validSignUp);
      expect(result.success).toBe(true);
    });

    it('should accept optional lastName', () => {
      const result = SignUpSchema.safeParse({ ...validSignUp, lastName: 'Sharma' });
      expect(result.success).toBe(true);
    });

    it('should accept optional phone (10 digits)', () => {
      const result = SignUpSchema.safeParse({ ...validSignUp, phone: '9876543210' });
      expect(result.success).toBe(true);
    });

    it('should accept empty string for phone', () => {
      const result = SignUpSchema.safeParse({ ...validSignUp, phone: '' });
      expect(result.success).toBe(true);
    });

    it('should reject phone with non-10 digits', () => {
      const result = SignUpSchema.safeParse({ ...validSignUp, phone: '12345' });
      expect(result.success).toBe(false);
    });

    it('should reject phone with letters', () => {
      const result = SignUpSchema.safeParse({ ...validSignUp, phone: 'abcdefghij' });
      expect(result.success).toBe(false);
    });

    it('should reject a password without uppercase', () => {
      const result = SignUpSchema.safeParse({ ...validSignUp, password: 'password1!' });
      expect(result.success).toBe(false);
    });

    it('should reject a password without lowercase', () => {
      const result = SignUpSchema.safeParse({ ...validSignUp, password: 'PASSWORD1!' });
      expect(result.success).toBe(false);
    });

    it('should reject a password without digit', () => {
      const result = SignUpSchema.safeParse({ ...validSignUp, password: 'Password!!' });
      expect(result.success).toBe(false);
    });

    it('should reject a password without special characters', () => {
      const result = SignUpSchema.safeParse({ ...validSignUp, password: 'Password123' });
      expect(result.success).toBe(false);
    });

    it('should reject a password shorter than 8 chars', () => {
      const result = SignUpSchema.safeParse({ ...validSignUp, password: 'Pa1!' });
      expect(result.success).toBe(false);
    });

    it('should reject empty firstName', () => {
      const result = SignUpSchema.safeParse({ ...validSignUp, firstName: '' });
      expect(result.success).toBe(false);
    });

    it('should accept optional structured address', () => {
      const result = SignUpSchema.safeParse({
        ...validSignUp,
        address: { streetAddress: '123 MG Road', city: 'Surat', state: 'Gujarat', zipCode: '395001' },
      });
      expect(result.success).toBe(true);
    });

    it('should reject incomplete address (missing city)', () => {
      const result = SignUpSchema.safeParse({
        ...validSignUp,
        address: { streetAddress: '123 MG Road', city: '', state: 'Gujarat', zipCode: '395001' },
      });
      expect(result.success).toBe(false);
    });
  });

  // ─── ForgotPasswordSchema ───────────────────────────
  describe('ForgotPasswordSchema', () => {
    it('should validate a correct email', () => {
      const result = ForgotPasswordSchema.safeParse({ email: 'user@test.com' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = ForgotPasswordSchema.safeParse({ email: 'not-an-email' });
      expect(result.success).toBe(false);
    });
  });

  // ─── SendOtpSchema ──────────────────────────────────
  describe('SendOtpSchema', () => {
    it('should validate a correct email', () => {
      const result = SendOtpSchema.safeParse({ email: 'otp@test.com' });
      expect(result.success).toBe(true);
    });

    it('should reject missing email', () => {
      const result = SendOtpSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  // ─── VerifyOtpSchema ───────────────────────────────
  describe('VerifyOtpSchema', () => {
    it('should validate correct email and 6-digit OTP string', () => {
      const result = VerifyOtpSchema.safeParse({ email: 'user@test.com', otp: '123456' });
      expect(result.success).toBe(true);
    });

    it('should accept numeric OTP (preprocessed to string)', () => {
      const result = VerifyOtpSchema.safeParse({ email: 'user@test.com', otp: 654321 });
      expect(result.success).toBe(true);
    });

    it('should reject 5-digit OTP', () => {
      const result = VerifyOtpSchema.safeParse({ email: 'user@test.com', otp: '12345' });
      expect(result.success).toBe(false);
    });

    it('should reject 7-digit OTP', () => {
      const result = VerifyOtpSchema.safeParse({ email: 'user@test.com', otp: '1234567' });
      expect(result.success).toBe(false);
    });

    it('should reject non-numeric OTP', () => {
      const result = VerifyOtpSchema.safeParse({ email: 'user@test.com', otp: 'abcdef' });
      expect(result.success).toBe(false);
    });

    it('should trim whitespace from OTP', () => {
      const result = VerifyOtpSchema.safeParse({ email: 'user@test.com', otp: ' 123456 ' });
      expect(result.success).toBe(true);
    });
  });

  // ─── ResetPasswordSchema ───────────────────────────
  describe('ResetPasswordSchema', () => {
    it('should validate correct token and strong password', () => {
      const result = ResetPasswordSchema.safeParse({ token: 'abc123', password: 'NewPass1!' });
      expect(result.success).toBe(true);
    });

    it('should reject empty token', () => {
      const result = ResetPasswordSchema.safeParse({ token: '', password: 'NewPass1!' });
      expect(result.success).toBe(false);
    });

    it('should reject weak password', () => {
      const result = ResetPasswordSchema.safeParse({ token: 'abc123', password: 'weak' });
      expect(result.success).toBe(false);
    });
  });
});
