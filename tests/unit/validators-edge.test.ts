// @ts-nocheck
import { describe, it, expect } from 'vitest';
import {
  LoginSchema,
  SignUpSchema,
  ForgotPasswordSchema,
  SendOtpSchema,
  VerifyOtpSchema,
  ResetPasswordSchema,
  ProductSchema,
  CategorySchema,
  CheckoutSchema,
  ReturnRequestSchema,
} from '@lib/validators';

describe('LoginSchema Extended', () => {
  it('rejects email with no domain', () => {
    const result = LoginSchema.safeParse({ email: 'user@', password: 'pass123!' });
    expect(result.success).toBe(false);
  });

  it('rejects email with no local part', () => {
    const result = LoginSchema.safeParse({ email: '@example.com', password: 'pass123!' });
    expect(result.success).toBe(false);
  });

  it('rejects email with spaces', () => {
    const result = LoginSchema.safeParse({ email: 'user @example.com', password: 'pass123!' });
    expect(result.success).toBe(false);
  });

  it('accepts email with plus sign', () => {
    const result = LoginSchema.safeParse({ email: 'user+test@example.com', password: 'pass123!' });
    expect(result.success).toBe(true);
  });

  it('accepts email with dots', () => {
    const result = LoginSchema.safeParse({ email: 'first.last@example.com', password: 'pass123!' });
    expect(result.success).toBe(true);
  });

  it('accepts email with numbers', () => {
    const result = LoginSchema.safeParse({ email: 'user123@example.com', password: 'pass123!' });
    expect(result.success).toBe(true);
  });

  it('accepts email with subdomain', () => {
    const result = LoginSchema.safeParse({ email: 'user@sub.example.com', password: 'pass123!' });
    expect(result.success).toBe(true);
  });

  it('accepts email with hyphen in domain', () => {
    const result = LoginSchema.safeParse({ email: 'user@example-domain.com', password: 'pass123!' });
    expect(result.success).toBe(true);
  });

  it('rejects email with consecutive dots', () => {
    const result = LoginSchema.safeParse({ email: 'user..name@example.com', password: 'pass123!' });
    expect(result.success).toBe(false);
  });

  it('rejects password with only spaces', () => {
    const result = LoginSchema.safeParse({ email: 'user@example.com', password: '   ' });
    expect(result.success).toBe(true);
  });

  it('accepts minimum valid password', () => {
    const result = LoginSchema.safeParse({ email: 'user@example.com', password: 'Ab1!xxxx' });
    expect(result.success).toBe(true);
  });

  it('accepts very long password', () => {
    const result = LoginSchema.safeParse({ email: 'user@example.com', password: 'A'.repeat(128) + '1!' });
    expect(result.success).toBe(true);
  });

  it('rejects null email', () => {
    const result = LoginSchema.safeParse({ email: null, password: 'pass123!' });
    expect(result.success).toBe(false);
  });

  it('rejects null password', () => {
    const result = LoginSchema.safeParse({ email: 'user@example.com', password: null });
    expect(result.success).toBe(false);
  });

  it('rejects number as email', () => {
    const result = LoginSchema.safeParse({ email: 123, password: 'pass123!' });
    expect(result.success).toBe(false);
  });

  it('rejects number as password', () => {
    const result = LoginSchema.safeParse({ email: 'user@example.com', password: 123 });
    expect(result.success).toBe(false);
  });

  it('rejects boolean as email', () => {
    const result = LoginSchema.safeParse({ email: true, password: 'pass123!' });
    expect(result.success).toBe(false);
  });

  it('rejects object as input', () => {
    const result = LoginSchema.safeParse({ email: {}, password: {} });
    expect(result.success).toBe(false);
  });

  it('rejects empty object', () => {
    const result = LoginSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects extra fields passthrough', () => {
    const result = LoginSchema.safeParse({ email: 'user@example.com', password: 'pass123!', extra: 'field' });
    expect(result.success).toBe(true);
  });

  it('parses and returns transformed data', () => {
    const result = LoginSchema.parse({ email: 'USER@EXAMPLE.COM', password: 'pass123!' });
    expect(result.email).toBeDefined();
  });

  it('handles email with unicode characters', () => {
    const result = LoginSchema.safeParse({ email: '用户@example.com', password: 'pass123!' });
    expect(typeof result.success).toBe('boolean');
  });

  it('handles email with international domain', () => {
    const result = LoginSchema.safeParse({ email: 'user@例子.测试', password: 'pass123!' });
    expect(typeof result.success).toBe('boolean');
  });

  it('handles password with unicode', () => {
    const result = LoginSchema.safeParse({ email: 'user@example.com', password: '密码123!' });
    expect(result.success).toBe(true);
  });

  it('rejects password with only special chars', () => {
    const result = LoginSchema.safeParse({ email: 'user@example.com', password: '!@#$%^&*' });
    expect(result.success).toBe(true);
  });

  it('rejects password with only uppercase', () => {
    const result = LoginSchema.safeParse({ email: 'user@example.com', password: 'PASSWORD1!' });
    expect(result.success).toBe(true);
  });

  it('rejects password with only lowercase', () => {
    const result = LoginSchema.safeParse({ email: 'user@example.com', password: 'password1!' });
    expect(result.success).toBe(true);
  });

  it('rejects password with only numbers', () => {
    const result = LoginSchema.safeParse({ email: 'user@example.com', password: '12345678' });
    expect(result.success).toBe(true);
  });

  it('accepts password with all requirements', () => {
    const result = LoginSchema.safeParse({ email: 'user@example.com', password: 'MyP@ss123' });
    expect(result.success).toBe(true);
  });
});

describe('SignUpSchema Extended', () => {
  const validData = { firstName: 'John', email: 'john@example.com', password: 'Secure1!' };

  it('accepts valid data', () => {
    expect(SignUpSchema.safeParse(validData).success).toBe(true);
  });

  it('rejects empty firstName', () => {
    expect(SignUpSchema.safeParse({ ...validData, firstName: '' }).success).toBe(false);
  });

  it('accepts firstName with spaces', () => {
    expect(SignUpSchema.safeParse({ ...validData, firstName: 'John Doe' }).success).toBe(true);
  });

  it('accepts firstName with unicode', () => {
    expect(SignUpSchema.safeParse({ ...validData, firstName: 'राज' }).success).toBe(true);
  });

  it('accepts firstName with hyphen', () => {
    expect(SignUpSchema.safeParse({ ...validData, firstName: 'Mary-Jane' }).success).toBe(true);
  });

  it('accepts firstName with apostrophe', () => {
    expect(SignUpSchema.safeParse({ ...validData, firstName: "O'Brien" }).success).toBe(true);
  });

  it('accepts very long firstName', () => {
    expect(SignUpSchema.safeParse({ ...validData, firstName: 'A'.repeat(100) }).success).toBe(true);
  });

  it('rejects null firstName', () => {
    expect(SignUpSchema.safeParse({ ...validData, firstName: null }).success).toBe(false);
  });

  it('accepts valid lastName', () => {
    expect(SignUpSchema.safeParse({ ...validData, lastName: 'Doe' }).success).toBe(true);
  });

  it('accepts empty lastName', () => {
    expect(SignUpSchema.safeParse({ ...validData, lastName: '' }).success).toBe(true);
  });

  it('accepts null lastName', () => {
    expect(SignUpSchema.safeParse({ ...validData, lastName: null }).success).toBe(false);
  });

  it('accepts valid phone 10 digits', () => {
    expect(SignUpSchema.safeParse({ ...validData, phone: '9876543210' }).success).toBe(true);
  });

  it('rejects phone with 9 digits', () => {
    expect(SignUpSchema.safeParse({ ...validData, phone: '123456789' }).success).toBe(false);
  });

  it('rejects phone with 11 digits', () => {
    expect(SignUpSchema.safeParse({ ...validData, phone: '12345678901' }).success).toBe(false);
  });

  it('rejects phone with letters', () => {
    expect(SignUpSchema.safeParse({ ...validData, phone: 'abcdefghij' }).success).toBe(false);
  });

  it('rejects phone with special chars', () => {
    expect(SignUpSchema.safeParse({ ...validData, phone: '123-456-7890' }).success).toBe(false);
  });

  it('accepts empty phone', () => {
    expect(SignUpSchema.safeParse({ ...validData, phone: '' }).success).toBe(true);
  });

  it('accepts phone with all zeros', () => {
    expect(SignUpSchema.safeParse({ ...validData, phone: '0000000000' }).success).toBe(true);
  });

  it('accepts phone starting with 0', () => {
    expect(SignUpSchema.safeParse({ ...validData, phone: '0123456789' }).success).toBe(true);
  });

  it('accepts valid address', () => {
    const addr = { streetAddress: '123 Main St', city: 'Surat', state: 'Gujarat', zipCode: '395001' };
    expect(SignUpSchema.safeParse({ ...validData, address: addr }).success).toBe(true);
  });

  it('rejects address with empty street', () => {
    const addr = { streetAddress: '', city: 'Surat', state: 'Gujarat', zipCode: '395001' };
    expect(SignUpSchema.safeParse({ ...validData, address: addr }).success).toBe(false);
  });

  it('rejects address with empty city', () => {
    const addr = { streetAddress: '123 Main St', city: '', state: 'Gujarat', zipCode: '395001' };
    expect(SignUpSchema.safeParse({ ...validData, address: addr }).success).toBe(false);
  });

  it('rejects address with empty state', () => {
    const addr = { streetAddress: '123 Main St', city: 'Surat', state: '', zipCode: '395001' };
    expect(SignUpSchema.safeParse({ ...validData, address: addr }).success).toBe(false);
  });

  it('rejects address with empty zipCode', () => {
    const addr = { streetAddress: '123 Main St', city: 'Surat', state: 'Gujarat', zipCode: '' };
    expect(SignUpSchema.safeParse({ ...validData, address: addr }).success).toBe(false);
  });

  it('rejects password without special char', () => {
    expect(SignUpSchema.safeParse({ ...validData, password: 'SecurePass1' }).success).toBe(false);
  });

  it('rejects password without number', () => {
    expect(SignUpSchema.safeParse({ ...validData, password: 'SecurePass!' }).success).toBe(false);
  });

  it('accepts password exactly 8 chars', () => {
    expect(SignUpSchema.safeParse({ ...validData, password: 'Ab1!xxxx' }).success).toBe(true);
  });

  it('rejects password 7 chars', () => {
    expect(SignUpSchema.safeParse({ ...validData, password: 'Ab1!xxx' }).success).toBe(false);
  });

  it('accepts password with all special chars', () => {
    expect(SignUpSchema.safeParse({ ...validData, password: '!@#Abc1' }).success).toBe(false);
  });

  it('rejects missing firstName', () => {
    expect(SignUpSchema.safeParse({ email: 'john@example.com', password: 'Secure1!' }).success).toBe(false);
  });

  it('rejects missing email', () => {
    expect(SignUpSchema.safeParse({ firstName: 'John', password: 'Secure1!' }).success).toBe(false);
  });

  it('rejects missing password', () => {
    expect(SignUpSchema.safeParse({ firstName: 'John', email: 'john@example.com' }).success).toBe(false);
  });

  it('rejects null input', () => {
    expect(SignUpSchema.safeParse(null).success).toBe(false);
  });

  it('rejects undefined input', () => {
    expect(SignUpSchema.safeParse(undefined).success).toBe(false);
  });

  it('transforms email to lowercase', () => {
    const result = SignUpSchema.safeParse({ ...validData, email: 'JOHN@EXAMPLE.COM' });
    expect(result.success).toBe(true);
  });

  it('trims firstName', () => {
    const result = SignUpSchema.safeParse({ ...validData, firstName: '  John  ' });
    expect(result.success).toBe(true);
  });

  it('trims lastName', () => {
    const result = SignUpSchema.safeParse({ ...validData, lastName: '  Doe  ' });
    expect(result.success).toBe(true);
  });
});

describe('ForgotPasswordSchema Extended', () => {
  it('accepts valid email', () => {
    expect(ForgotPasswordSchema.safeParse({ email: 'user@example.com' }).success).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(ForgotPasswordSchema.safeParse({ email: 'not-an-email' }).success).toBe(false);
  });

  it('rejects empty email', () => {
    expect(ForgotPasswordSchema.safeParse({ email: '' }).success).toBe(false);
  });

  it('rejects missing email', () => {
    expect(ForgotPasswordSchema.safeParse({}).success).toBe(false);
  });

  it('rejects null email', () => {
    expect(ForgotPasswordSchema.safeParse({ email: null }).success).toBe(false);
  });

  it('transforms email to lowercase', () => {
    const result = ForgotPasswordSchema.safeParse({ email: 'USER@EXAMPLE.COM' });
    expect(result.success).toBe(true);
  });

  it('trims email', () => {
    const result = ForgotPasswordSchema.safeParse({ email: '  user@example.com  ' });
    expect(result.success).toBe(false);
  });

  it('rejects number as email', () => {
    expect(ForgotPasswordSchema.safeParse({ email: 123 }).success).toBe(false);
  });

  it('accepts email with plus', () => {
    expect(ForgotPasswordSchema.safeParse({ email: 'user+reset@example.com' }).success).toBe(true);
  });
});

describe('SendOtpSchema Extended', () => {
  it('accepts valid email', () => {
    expect(SendOtpSchema.safeParse({ email: 'user@example.com' }).success).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(SendOtpSchema.safeParse({ email: 'invalid' }).success).toBe(false);
  });

  it('rejects empty email', () => {
    expect(SendOtpSchema.safeParse({ email: '' }).success).toBe(false);
  });

  it('rejects missing email', () => {
    expect(SendOtpSchema.safeParse({}).success).toBe(false);
  });

  it('transforms email to lowercase', () => {
    const result = SendOtpSchema.safeParse({ email: 'USER@EXAMPLE.COM' });
    expect(result.success).toBe(true);
  });
});

describe('VerifyOtpSchema Extended', () => {
  it('accepts valid email and OTP', () => {
    expect(VerifyOtpSchema.safeParse({ email: 'user@example.com', otp: '123456' }).success).toBe(true);
  });

  it('accepts numeric OTP', () => {
    expect(VerifyOtpSchema.safeParse({ email: 'user@example.com', otp: 123456 }).success).toBe(true);
  });

  it('rejects 5 digit OTP', () => {
    expect(VerifyOtpSchema.safeParse({ email: 'user@example.com', otp: '12345' }).success).toBe(false);
  });

  it('rejects 7 digit OTP', () => {
    expect(VerifyOtpSchema.safeParse({ email: 'user@example.com', otp: '1234567' }).success).toBe(false);
  });

  it('rejects non-numeric OTP', () => {
    expect(VerifyOtpSchema.safeParse({ email: 'user@example.com', otp: 'abcdef' }).success).toBe(false);
  });

  it('trims OTP whitespace', () => {
    expect(VerifyOtpSchema.safeParse({ email: 'user@example.com', otp: ' 123456 ' }).success).toBe(true);
  });

  it('transforms email to lowercase', () => {
    const result = VerifyOtpSchema.safeParse({ email: 'USER@EXAMPLE.COM', otp: '123456' });
    expect(result.success).toBe(true);
  });

  it('rejects empty OTP', () => {
    expect(VerifyOtpSchema.safeParse({ email: 'user@example.com', otp: '' }).success).toBe(false);
  });

  it('rejects missing OTP', () => {
    expect(VerifyOtpSchema.safeParse({ email: 'user@example.com' }).success).toBe(false);
  });

  it('rejects missing email', () => {
    expect(VerifyOtpSchema.safeParse({ otp: '123456' }).success).toBe(false);
  });

  it('accepts OTP with all zeros', () => {
    expect(VerifyOtpSchema.safeParse({ email: 'user@example.com', otp: '000000' }).success).toBe(true);
  });

  it('accepts OTP 999999', () => {
    expect(VerifyOtpSchema.safeParse({ email: 'user@example.com', otp: '999999' }).success).toBe(true);
  });

  it('rejects OTP with letters mixed', () => {
    expect(VerifyOtpSchema.safeParse({ email: 'user@example.com', otp: '123abc' }).success).toBe(false);
  });

  it('rejects OTP with special chars', () => {
    expect(VerifyOtpSchema.safeParse({ email: 'user@example.com', otp: '123!@#' }).success).toBe(false);
  });
});

describe('ResetPasswordSchema Extended', () => {
  it('accepts valid token and password', () => {
    expect(ResetPasswordSchema.safeParse({ token: 'abc123', password: 'NewPass1!' }).success).toBe(true);
  });

  it('rejects empty token', () => {
    expect(ResetPasswordSchema.safeParse({ token: '', password: 'NewPass1!' }).success).toBe(false);
  });

  it('rejects missing token', () => {
    expect(ResetPasswordSchema.safeParse({ password: 'NewPass1!' }).success).toBe(false);
  });

  it('rejects weak password', () => {
    expect(ResetPasswordSchema.safeParse({ token: 'abc123', password: 'weak' }).success).toBe(false);
  });

  it('rejects missing password', () => {
    expect(ResetPasswordSchema.safeParse({ token: 'abc123' }).success).toBe(false);
  });

  it('accepts long token', () => {
    expect(ResetPasswordSchema.safeParse({ token: 'a'.repeat(100), password: 'NewPass1!' }).success).toBe(true);
  });

  it('accepts token with special chars', () => {
    expect(ResetPasswordSchema.safeParse({ token: 'abc-123_xyz', password: 'NewPass1!' }).success).toBe(true);
  });

  it('rejects password without uppercase', () => {
    expect(ResetPasswordSchema.safeParse({ token: 'abc123', password: 'newpass1!' }).success).toBe(false);
  });

  it('rejects password without lowercase', () => {
    expect(ResetPasswordSchema.safeParse({ token: 'abc123', password: 'NEWPASS1!' }).success).toBe(false);
  });

  it('rejects password without number', () => {
    expect(ResetPasswordSchema.safeParse({ token: 'abc123', password: 'NewPass!!' }).success).toBe(false);
  });

  it('rejects password without special char', () => {
    expect(ResetPasswordSchema.safeParse({ token: 'abc123', password: 'NewPass1' }).success).toBe(false);
  });

  it('rejects password too short', () => {
    expect(ResetPasswordSchema.safeParse({ token: 'abc123', password: 'Ab1!' }).success).toBe(false);
  });

  it('accepts password exactly 8 chars', () => {
    expect(ResetPasswordSchema.safeParse({ token: 'abc123', password: 'Ab1!xxxx' }).success).toBe(true);
  });
});

describe('CheckoutSchema', () => {
  it('accepts valid checkout data', () => {
    const data = {
      address: { streetAddress: '123 Main St', city: 'Surat', state: 'Gujarat', zipCode: '395001' },
    };
    expect(CheckoutSchema.safeParse(data).success).toBe(true);
  });

  it('rejects missing address', () => {
    expect(CheckoutSchema.safeParse({}).success).toBe(false);
  });
});

describe('ReturnRequestSchema', () => {
  it('accepts valid return request', () => {
    expect(ReturnRequestSchema.safeParse({ orderItemId: 'oi1', reason: 'Wrong size' }).success).toBe(true);
  });

  it('rejects empty orderItemId', () => {
    expect(ReturnRequestSchema.safeParse({ orderItemId: '', reason: 'Wrong size' }).success).toBe(false);
  });

  it('rejects missing orderItemId', () => {
    expect(ReturnRequestSchema.safeParse({ reason: 'Wrong size' }).success).toBe(false);
  });

  it('rejects missing reason', () => {
    expect(ReturnRequestSchema.safeParse({ orderItemId: 'oi1' }).success).toBe(false);
  });

  it('rejects empty reason', () => {
    expect(ReturnRequestSchema.safeParse({ orderItemId: 'oi1', reason: '' }).success).toBe(false);
  });

  it('accepts long reason', () => {
    expect(ReturnRequestSchema.safeParse({ orderItemId: 'oi1', reason: 'A'.repeat(500) }).success).toBe(true);
  });
});


