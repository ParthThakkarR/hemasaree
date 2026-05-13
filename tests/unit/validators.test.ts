import { describe, it, expect } from 'vitest';
import { LoginSchema, SignUpSchema } from '@app/lib/validators';

describe('Validators', () => {
  describe('LoginSchema', () => {
    it('should validate a correct email and password', () => {
      const data = { email: 'test@example.com', password: 'password123' };
      const result = LoginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject an invalid email', () => {
      const data = { email: 'invalid-email', password: 'password123' };
      const result = LoginSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('A valid email is required');
      }
    });

    it('should reject an empty password', () => {
      const data = { email: 'test@example.com', password: '' };
      const result = LoginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('SignUpSchema', () => {
    it('should validate a correct signup object', () => {
      const data = {
        firstName: 'John',
        email: 'john@example.com',
        password: 'Password123!',
      };
      const result = SignUpSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject a password without special characters', () => {
      const data = {
        firstName: 'John',
        email: 'john@example.com',
        password: 'Password123',
      };
      const result = SignUpSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

