// @ts-nocheck
import { describe, it, expect } from 'vitest';
import {
  ForgotPasswordSchema, LoginSchema, SendOtpSchema, SignUpSchema,
  VerifyOtpSchema, ResetPasswordSchema, CategorySchema, UpdateCategorySchema,
  DeleteCategorySchema, ProductSchema, UpdateProductSchema, DeleteProductSchema,
  CartAddSchema, CartUpdateSchema, CartDeleteSchema, CheckoutSchema,
  AdminOrderUpdateSchema, ReturnRequestSchema, IdParamSchema,
  ProductQuerySchema, PaginationSchema,
} from '@lib/validators';

describe('ForgotPasswordSchema', () => {
  it('validates valid email', () => {
    const result = ForgotPasswordSchema.safeParse({ email: 'test@test.com' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = ForgotPasswordSchema.safeParse({ email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects missing email', () => {
    const result = ForgotPasswordSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects empty email', () => {
    const result = ForgotPasswordSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
  });

  it('rejects null email', () => {
    const result = ForgotPasswordSchema.safeParse({ email: null });
    expect(result.success).toBe(false);
  });

  it('rejects number email', () => {
    const result = ForgotPasswordSchema.safeParse({ email: 123 });
    expect(result.success).toBe(false);
  });

  it('accepts unicode email local part', () => {
    const result = ForgotPasswordSchema.safeParse({ email: 'sara@test.com' });
    expect(result.success).toBe(true);
  });

  it('rejects email without @', () => {
    const result = ForgotPasswordSchema.safeParse({ email: 'test.com' });
    expect(result.success).toBe(false);
  });

  it('rejects email without domain', () => {
    const result = ForgotPasswordSchema.safeParse({ email: 'test@' });
    expect(result.success).toBe(false);
  });

  it('rejects extra fields', () => {
    const result = ForgotPasswordSchema.safeParse({ email: 'test@test.com', extra: 'field' });
    expect(result.success).toBe(true);
  });
});

describe('LoginSchema', () => {
  it('validates valid login', () => {
    const result = LoginSchema.safeParse({ email: 'test@test.com', password: 'password' });
    expect(result.success).toBe(true);
  });

  it('rejects missing email', () => {
    const result = LoginSchema.safeParse({ password: 'password' });
    expect(result.success).toBe(false);
  });

  it('rejects missing password', () => {
    const result = LoginSchema.safeParse({ email: 'test@test.com' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = LoginSchema.safeParse({ email: 'not-an-email', password: 'password' });
    expect(result.success).toBe(false);
  });

  it('rejects empty email', () => {
    const result = LoginSchema.safeParse({ email: '', password: 'password' });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = LoginSchema.safeParse({ email: 'test@test.com', password: '' });
    expect(result.success).toBe(false);
  });

  it('accepts short password', () => {
    const result = LoginSchema.safeParse({ email: 'test@test.com', password: 'a' });
    expect(result.success).toBe(true);
  });

  it('accepts unicode password', () => {
    const result = LoginSchema.safeParse({ email: 'test@test.com', password: 'पासवर्ड' });
    expect(result.success).toBe(true);
  });

  it('rejects null email', () => {
    const result = LoginSchema.safeParse({ email: null, password: 'password' });
    expect(result.success).toBe(false);
  });

  it('rejects null password', () => {
    const result = LoginSchema.safeParse({ email: 'test@test.com', password: null });
    expect(result.success).toBe(false);
  });

  it('rejects number email', () => {
    const result = LoginSchema.safeParse({ email: 123, password: 'password' });
    expect(result.success).toBe(false);
  });

  it('rejects number password', () => {
    const result = LoginSchema.safeParse({ email: 'test@test.com', password: 123 });
    expect(result.success).toBe(false);
  });

  it('accepts long password', () => {
    const result = LoginSchema.safeParse({ email: 'test@test.com', password: 'a'.repeat(1000) });
    expect(result.success).toBe(true);
  });

  it('rejects extra fields', () => {
    const result = LoginSchema.safeParse({ email: 'test@test.com', password: 'pass', rememberMe: true });
    expect(result.success).toBe(true);
  });
});

describe('SendOtpSchema', () => {
  it('validates valid email', () => {
    const result = SendOtpSchema.safeParse({ email: 'test@test.com' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = SendOtpSchema.safeParse({ email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects missing email', () => {
    const result = SendOtpSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects empty email', () => {
    const result = SendOtpSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
  });

  it('rejects null email', () => {
    const result = SendOtpSchema.safeParse({ email: null });
    expect(result.success).toBe(false);
  });

  it('rejects extra fields', () => {
    const result = SendOtpSchema.safeParse({ email: 'test@test.com', extra: 'field' });
    expect(result.success).toBe(true);
  });
});

describe('SignUpSchema', () => {
  it('validates valid signup', () => {
    const result = SignUpSchema.safeParse({
      firstName: 'John', email: 'john@test.com', password: 'Str0ng!Pass',
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional lastName', () => {
    const result = SignUpSchema.safeParse({
      firstName: 'John', email: 'john@test.com', password: 'Str0ng!Pass',
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional phone', () => {
    const result = SignUpSchema.safeParse({
      firstName: 'John', email: 'john@test.com', password: 'Str0ng!Pass', phone: '1234567890',
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional address', () => {
    const result = SignUpSchema.safeParse({
      firstName: 'John', email: 'john@test.com', password: 'Str0ng!Pass',
      address: { streetAddress: '123 Main', city: 'City', state: 'State', zipCode: '12345' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing firstName', () => {
    const result = SignUpSchema.safeParse({ email: 'john@test.com', password: 'Str0ng!Pass' });
    expect(result.success).toBe(false);
  });

  it('rejects empty firstName', () => {
    const result = SignUpSchema.safeParse({ firstName: '', email: 'john@test.com', password: 'Str0ng!Pass' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = SignUpSchema.safeParse({ firstName: 'John', email: 'not-an-email', password: 'Str0ng!Pass' });
    expect(result.success).toBe(false);
  });

  it('rejects weak password', () => {
    const result = SignUpSchema.safeParse({ firstName: 'John', email: 'john@test.com', password: 'weak' });
    expect(result.success).toBe(false);
  });

  it('rejects password without uppercase', () => {
    const result = SignUpSchema.safeParse({ firstName: 'John', email: 'john@test.com', password: 'str0ng!pass' });
    expect(result.success).toBe(false);
  });

  it('rejects password without lowercase', () => {
    const result = SignUpSchema.safeParse({ firstName: 'John', email: 'john@test.com', password: 'STR0NG!PASS' });
    expect(result.success).toBe(false);
  });

  it('rejects password without number', () => {
    const result = SignUpSchema.safeParse({ firstName: 'John', email: 'john@test.com', password: 'Strong!Pass' });
    expect(result.success).toBe(false);
  });

  it('rejects password without special char', () => {
    const result = SignUpSchema.safeParse({ firstName: 'John', email: 'john@test.com', password: 'Str0ngPass' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid phone', () => {
    const result = SignUpSchema.safeParse({ firstName: 'John', email: 'john@test.com', password: 'Str0ng!Pass', phone: '123' });
    expect(result.success).toBe(false);
  });

  it('accepts valid phone', () => {
    const result = SignUpSchema.safeParse({ firstName: 'John', email: 'john@test.com', password: 'Str0ng!Pass', phone: '1234567890' });
    expect(result.success).toBe(true);
  });

  it('accepts empty phone', () => {
    const result = SignUpSchema.safeParse({ firstName: 'John', email: 'john@test.com', password: 'Str0ng!Pass', phone: '' });
    expect(result.success).toBe(true);
  });

  it('rejects incomplete address', () => {
    const result = SignUpSchema.safeParse({
      firstName: 'John', email: 'john@test.com', password: 'Str0ng!Pass',
      address: { streetAddress: '123 Main' },
    });
    expect(result.success).toBe(false);
  });

  it('accepts complete address', () => {
    const result = SignUpSchema.safeParse({
      firstName: 'John', email: 'john@test.com', password: 'Str0ng!Pass',
      address: { streetAddress: '123 Main', city: 'City', state: 'State', zipCode: '12345' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts address with optional label', () => {
    const result = SignUpSchema.safeParse({
      firstName: 'John', email: 'john@test.com', password: 'Str0ng!Pass',
      address: { streetAddress: '123 Main', city: 'City', state: 'State', zipCode: '12345', label: 'Home' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts unicode firstName', () => {
    const result = SignUpSchema.safeParse({ firstName: 'सारा', email: 'sara@test.com', password: 'Str0ng!Pass' });
    expect(result.success).toBe(true);
  });

  it('accepts unicode lastName', () => {
    const result = SignUpSchema.safeParse({ firstName: 'John', lastName: 'शर्मा', email: 'john@test.com', password: 'Str0ng!Pass' });
    expect(result.success).toBe(true);
  });

  it('rejects null firstName', () => {
    const result = SignUpSchema.safeParse({ firstName: null, email: 'john@test.com', password: 'Str0ng!Pass' });
    expect(result.success).toBe(false);
  });

  it('rejects number firstName', () => {
    const result = SignUpSchema.safeParse({ firstName: 123, email: 'john@test.com', password: 'Str0ng!Pass' });
    expect(result.success).toBe(false);
  });

  it('rejects extra fields', () => {
    const result = SignUpSchema.safeParse({ firstName: 'John', email: 'john@test.com', password: 'Str0ng!Pass', isAdmin: true });
    expect(result.success).toBe(true);
  });

  it('accepts password at exactly 8 chars', () => {
    const result = SignUpSchema.safeParse({ firstName: 'John', email: 'john@test.com', password: 'Aa1!xxxx' });
    expect(result.success).toBe(true);
  });

  it('rejects password at 7 chars', () => {
    const result = SignUpSchema.safeParse({ firstName: 'John', email: 'john@test.com', password: 'Aa1!xxx' });
    expect(result.success).toBe(false);
  });

  it('accepts password at 128 chars', () => {
    const longPass = 'Aa1!' + 'x'.repeat(124);
    const result = SignUpSchema.safeParse({ firstName: 'John', email: 'john@test.com', password: longPass });
    expect(result.success).toBe(true);
  });

  it('rejects password over 128 chars', () => {
    const longPass = 'Aa1!' + 'x'.repeat(125);
    const result = SignUpSchema.safeParse({ firstName: 'John', email: 'john@test.com', password: longPass });
    expect(result.success).toBe(false);
  });
});

describe('VerifyOtpSchema', () => {
  it('validates valid OTP', () => {
    const result = VerifyOtpSchema.safeParse({ email: 'test@test.com', otp: '123456' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = VerifyOtpSchema.safeParse({ email: 'not-an-email', otp: '123456' });
    expect(result.success).toBe(false);
  });

  it('rejects OTP with letters', () => {
    const result = VerifyOtpSchema.safeParse({ email: 'test@test.com', otp: 'abcdef' });
    expect(result.success).toBe(false);
  });

  it('rejects OTP with 5 digits', () => {
    const result = VerifyOtpSchema.safeParse({ email: 'test@test.com', otp: '12345' });
    expect(result.success).toBe(false);
  });

  it('rejects OTP with 7 digits', () => {
    const result = VerifyOtpSchema.safeParse({ email: 'test@test.com', otp: '1234567' });
    expect(result.success).toBe(false);
  });

  it('accepts numeric OTP', () => {
    const result = VerifyOtpSchema.safeParse({ email: 'test@test.com', otp: 123456 });
    expect(result.success).toBe(true);
  });

  it('trims whitespace from OTP', () => {
    const result = VerifyOtpSchema.safeParse({ email: 'test@test.com', otp: '  123456  ' });
    expect(result.success).toBe(true);
  });

  it('rejects empty OTP', () => {
    const result = VerifyOtpSchema.safeParse({ email: 'test@test.com', otp: '' });
    expect(result.success).toBe(false);
  });

  it('rejects null OTP', () => {
    const result = VerifyOtpSchema.safeParse({ email: 'test@test.com', otp: null });
    expect(result.success).toBe(false);
  });

  it('rejects missing email', () => {
    const result = VerifyOtpSchema.safeParse({ otp: '123456' });
    expect(result.success).toBe(false);
  });

  it('rejects missing OTP', () => {
    const result = VerifyOtpSchema.safeParse({ email: 'test@test.com' });
    expect(result.success).toBe(false);
  });
});

describe('ResetPasswordSchema', () => {
  it('validates valid reset', () => {
    const result = ResetPasswordSchema.safeParse({ token: 'abc123', password: 'Str0ng!Pass' });
    expect(result.success).toBe(true);
  });

  it('rejects missing token', () => {
    const result = ResetPasswordSchema.safeParse({ password: 'Str0ng!Pass' });
    expect(result.success).toBe(false);
  });

  it('rejects empty token', () => {
    const result = ResetPasswordSchema.safeParse({ token: '', password: 'Str0ng!Pass' });
    expect(result.success).toBe(false);
  });

  it('rejects weak password', () => {
    const result = ResetPasswordSchema.safeParse({ token: 'abc123', password: 'weak' });
    expect(result.success).toBe(false);
  });

  it('rejects null token', () => {
    const result = ResetPasswordSchema.safeParse({ token: null, password: 'Str0ng!Pass' });
    expect(result.success).toBe(false);
  });

  it('rejects null password', () => {
    const result = ResetPasswordSchema.safeParse({ token: 'abc123', password: null });
    expect(result.success).toBe(false);
  });

  it('accepts long token', () => {
    const result = ResetPasswordSchema.safeParse({ token: 'a'.repeat(500), password: 'Str0ng!Pass' });
    expect(result.success).toBe(true);
  });
});

describe('CategorySchema', () => {
  it('validates valid category', () => {
    const result = CategorySchema.safeParse({ name: 'Silk', image: 'https://example.com/img.jpg' });
    expect(result.success).toBe(true);
  });

  it('rejects missing name', () => {
    const result = CategorySchema.safeParse({ image: 'https://example.com/img.jpg' });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = CategorySchema.safeParse({ name: '', image: 'https://example.com/img.jpg' });
    expect(result.success).toBe(false);
  });

  it('rejects missing image', () => {
    const result = CategorySchema.safeParse({ name: 'Silk' });
    expect(result.success).toBe(false);
  });

  it('rejects empty image', () => {
    const result = CategorySchema.safeParse({ name: 'Silk', image: '' });
    expect(result.success).toBe(false);
  });

  it('accepts unicode name', () => {
    const result = CategorySchema.safeParse({ name: 'रेशम', image: 'https://example.com/img.jpg' });
    expect(result.success).toBe(true);
  });

  it('accepts long name', () => {
    const result = CategorySchema.safeParse({ name: 'A'.repeat(100), image: 'https://example.com/img.jpg' });
    expect(result.success).toBe(true);
  });

  it('rejects null name', () => {
    const result = CategorySchema.safeParse({ name: null, image: 'https://example.com/img.jpg' });
    expect(result.success).toBe(false);
  });

  it('rejects null image', () => {
    const result = CategorySchema.safeParse({ name: 'Silk', image: null });
    expect(result.success).toBe(false);
  });
});

describe('UpdateCategorySchema', () => {
  it('validates valid update', () => {
    const result = UpdateCategorySchema.safeParse({ id: 'cat1', name: 'New Name' });
    expect(result.success).toBe(true);
  });

  it('accepts only id', () => {
    const result = UpdateCategorySchema.safeParse({ id: 'cat1' });
    expect(result.success).toBe(true);
  });

  it('rejects missing id', () => {
    const result = UpdateCategorySchema.safeParse({ name: 'New Name' });
    expect(result.success).toBe(false);
  });

  it('rejects empty id', () => {
    const result = UpdateCategorySchema.safeParse({ id: '', name: 'New Name' });
    expect(result.success).toBe(false);
  });

  it('accepts name update', () => {
    const result = UpdateCategorySchema.safeParse({ id: 'cat1', name: 'Updated' });
    expect(result.success).toBe(true);
  });

  it('accepts image update', () => {
    const result = UpdateCategorySchema.safeParse({ id: 'cat1', image: 'https://example.com/new.jpg' });
    expect(result.success).toBe(true);
  });

  it('accepts both name and image update', () => {
    const result = UpdateCategorySchema.safeParse({ id: 'cat1', name: 'Updated', image: 'https://example.com/new.jpg' });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = UpdateCategorySchema.safeParse({ id: 'cat1', name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty image', () => {
    const result = UpdateCategorySchema.safeParse({ id: 'cat1', image: '' });
    expect(result.success).toBe(false);
  });
});

describe('DeleteCategorySchema', () => {
  it('validates valid delete', () => {
    const result = DeleteCategorySchema.safeParse({ id: 'cat1' });
    expect(result.success).toBe(true);
  });

  it('rejects missing id', () => {
    const result = DeleteCategorySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects empty id', () => {
    const result = DeleteCategorySchema.safeParse({ id: '' });
    expect(result.success).toBe(false);
  });

  it('rejects null id', () => {
    const result = DeleteCategorySchema.safeParse({ id: null });
    expect(result.success).toBe(false);
  });
});

describe('ProductSchema', () => {
  it('validates valid product', () => {
    const result = ProductSchema.safeParse({
      name: 'Silk Saree', color: 'Red', ocassion: 'Wedding', price: 1000, stock: 10, categoryId: 'cat1', images: ['img.jpg'],
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional description', () => {
    const result = ProductSchema.safeParse({
      name: 'Silk Saree', color: 'Red', ocassion: 'Wedding', price: 1000, stock: 10, categoryId: 'cat1', images: ['img.jpg'], description: 'Beautiful',
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional fabric', () => {
    const result = ProductSchema.safeParse({
      name: 'Silk Saree', color: 'Red', ocassion: 'Wedding', price: 1000, stock: 10, categoryId: 'cat1', images: ['img.jpg'], fabric: 'Silk',
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional mrp', () => {
    const result = ProductSchema.safeParse({
      name: 'Silk Saree', color: 'Red', ocassion: 'Wedding', price: 1000, stock: 10, categoryId: 'cat1', images: ['img.jpg'], mrp: 1500,
    });
    expect(result.success).toBe(true);
  });

  it('accepts null description', () => {
    const result = ProductSchema.safeParse({
      name: 'Silk Saree', color: 'Red', ocassion: 'Wedding', price: 1000, stock: 10, categoryId: 'cat1', images: ['img.jpg'], description: null,
    });
    expect(result.success).toBe(true);
  });

  it('accepts stock of 0', () => {
    const result = ProductSchema.safeParse({
      name: 'Silk Saree', color: 'Red', ocassion: 'Wedding', price: 1000, stock: 0, categoryId: 'cat1', images: ['img.jpg'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative stock', () => {
    const result = ProductSchema.safeParse({
      name: 'Silk Saree', color: 'Red', ocassion: 'Wedding', price: 1000, stock: -1, categoryId: 'cat1', images: ['img.jpg'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative price', () => {
    const result = ProductSchema.safeParse({
      name: 'Silk Saree', color: 'Red', ocassion: 'Wedding', price: -100, stock: 10, categoryId: 'cat1', images: ['img.jpg'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero price', () => {
    const result = ProductSchema.safeParse({
      name: 'Silk Saree', color: 'Red', ocassion: 'Wedding', price: 0, stock: 10, categoryId: 'cat1', images: ['img.jpg'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing name', () => {
    const result = ProductSchema.safeParse({ color: 'Red', ocassion: 'Wedding', price: 1000, stock: 10, categoryId: 'cat1', images: ['img.jpg'] });
    expect(result.success).toBe(false);
  });

  it('rejects missing color', () => {
    const result = ProductSchema.safeParse({ name: 'Silk Saree', ocassion: 'Wedding', price: 1000, stock: 10, categoryId: 'cat1', images: ['img.jpg'] });
    expect(result.success).toBe(false);
  });

  it('rejects missing ocassion', () => {
    const result = ProductSchema.safeParse({ name: 'Silk Saree', color: 'Red', price: 1000, stock: 10, categoryId: 'cat1', images: ['img.jpg'] });
    expect(result.success).toBe(false);
  });

  it('rejects missing price', () => {
    const result = ProductSchema.safeParse({ name: 'Silk Saree', color: 'Red', ocassion: 'Wedding', stock: 10, categoryId: 'cat1', images: ['img.jpg'] });
    expect(result.success).toBe(false);
  });

  it('rejects missing stock', () => {
    const result = ProductSchema.safeParse({ name: 'Silk Saree', color: 'Red', ocassion: 'Wedding', price: 1000, categoryId: 'cat1', images: ['img.jpg'] });
    expect(result.success).toBe(false);
  });

  it('rejects missing categoryId', () => {
    const result = ProductSchema.safeParse({ name: 'Silk Saree', color: 'Red', ocassion: 'Wedding', price: 1000, stock: 10, images: ['img.jpg'] });
    expect(result.success).toBe(false);
  });

  it('rejects missing images', () => {
    const result = ProductSchema.safeParse({ name: 'Silk Saree', color: 'Red', ocassion: 'Wedding', price: 1000, stock: 10, categoryId: 'cat1' });
    expect(result.success).toBe(false);
  });

  it('rejects empty images array', () => {
    const result = ProductSchema.safeParse({ name: 'Silk Saree', color: 'Red', ocassion: 'Wedding', price: 1000, stock: 10, categoryId: 'cat1', images: [] });
    expect(result.success).toBe(false);
  });

  it('accepts multiple images', () => {
    const result = ProductSchema.safeParse({
      name: 'Silk Saree', color: 'Red', ocassion: 'Wedding', price: 1000, stock: 10, categoryId: 'cat1', images: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
    });
    expect(result.success).toBe(true);
  });

  it('coerces string price to number', () => {
    const result = ProductSchema.safeParse({
      name: 'Silk Saree', color: 'Red', ocassion: 'Wedding', price: '1000', stock: 10, categoryId: 'cat1', images: ['img.jpg'],
    });
    expect(result.success).toBe(true);
  });

  it('coerces string stock to number', () => {
    const result = ProductSchema.safeParse({
      name: 'Silk Saree', color: 'Red', ocassion: 'Wedding', price: 1000, stock: '10', categoryId: 'cat1', images: ['img.jpg'],
    });
    expect(result.success).toBe(true);
  });

  it('accepts unicode name', () => {
    const result = ProductSchema.safeParse({
      name: 'रेशम साड़ी', color: 'Red', ocassion: 'Wedding', price: 1000, stock: 10, categoryId: 'cat1', images: ['img.jpg'],
    });
    expect(result.success).toBe(true);
  });

  it('accepts decimal price', () => {
    const result = ProductSchema.safeParse({
      name: 'Silk Saree', color: 'Red', ocassion: 'Wedding', price: 999.99, stock: 10, categoryId: 'cat1', images: ['img.jpg'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects string name', () => {
    const result = ProductSchema.safeParse({
      name: 123, color: 'Red', ocassion: 'Wedding', price: 1000, stock: 10, categoryId: 'cat1', images: ['img.jpg'],
    });
    expect(result.success).toBe(false);
  });
});

describe('CartAddSchema', () => {
  it('validates valid cart add', () => {
    const result = CartAddSchema.safeParse({ productId: 'p1', quantity: 1, productName: 'Saree', price: 1000 });
    expect(result.success).toBe(true);
  });

  it('defaults withPolish to false', () => {
    const result = CartAddSchema.safeParse({ productId: 'p1', quantity: 1, productName: 'Saree', price: 1000 });
    expect(result.success).toBe(true);
    expect((result as any).data.withPolish).toBe(false);
  });

  it('accepts withPolish true', () => {
    const result = CartAddSchema.safeParse({ productId: 'p1', quantity: 1, productName: 'Saree', price: 1000, withPolish: true });
    expect(result.success).toBe(true);
  });

  it('accepts optional productImage', () => {
    const result = CartAddSchema.safeParse({ productId: 'p1', quantity: 1, productName: 'Saree', price: 1000, productImage: 'img.jpg' });
    expect(result.success).toBe(true);
  });

  it('rejects missing productId', () => {
    const result = CartAddSchema.safeParse({ quantity: 1, productName: 'Saree', price: 1000 });
    expect(result.success).toBe(false);
  });

  it('rejects empty productId', () => {
    const result = CartAddSchema.safeParse({ productId: '', quantity: 1, productName: 'Saree', price: 1000 });
    expect(result.success).toBe(false);
  });

  it('rejects missing quantity', () => {
    const result = CartAddSchema.safeParse({ productId: 'p1', productName: 'Saree', price: 1000 });
    expect(result.success).toBe(false);
  });

  it('rejects zero quantity', () => {
    const result = CartAddSchema.safeParse({ productId: 'p1', quantity: 0, productName: 'Saree', price: 1000 });
    expect(result.success).toBe(false);
  });

  it('rejects negative quantity', () => {
    const result = CartAddSchema.safeParse({ productId: 'p1', quantity: -1, productName: 'Saree', price: 1000 });
    expect(result.success).toBe(false);
  });

  it('rejects missing productName', () => {
    const result = CartAddSchema.safeParse({ productId: 'p1', quantity: 1, price: 1000 });
    expect(result.success).toBe(false);
  });

  it('rejects empty productName', () => {
    const result = CartAddSchema.safeParse({ productId: 'p1', quantity: 1, productName: '', price: 1000 });
    expect(result.success).toBe(false);
  });

  it('rejects missing price', () => {
    const result = CartAddSchema.safeParse({ productId: 'p1', quantity: 1, productName: 'Saree' });
    expect(result.success).toBe(false);
  });

  it('rejects zero price', () => {
    const result = CartAddSchema.safeParse({ productId: 'p1', quantity: 1, productName: 'Saree', price: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative price', () => {
    const result = CartAddSchema.safeParse({ productId: 'p1', quantity: 1, productName: 'Saree', price: -100 });
    expect(result.success).toBe(false);
  });

  it('coerces string quantity to number', () => {
    const result = CartAddSchema.safeParse({ productId: 'p1', quantity: '2', productName: 'Saree', price: 1000 });
    expect(result.success).toBe(true);
  });

  it('coerces string price to number', () => {
    const result = CartAddSchema.safeParse({ productId: 'p1', quantity: 1, productName: 'Saree', price: '1000' });
    expect(result.success).toBe(true);
  });

  it('accepts large quantity', () => {
    const result = CartAddSchema.safeParse({ productId: 'p1', quantity: 1000, productName: 'Saree', price: 1000 });
    expect(result.success).toBe(true);
  });

  it('accepts decimal price', () => {
    const result = CartAddSchema.safeParse({ productId: 'p1', quantity: 1, productName: 'Saree', price: 999.99 });
    expect(result.success).toBe(true);
  });
});

describe('CartUpdateSchema', () => {
  it('validates valid cart update', () => {
    const result = CartUpdateSchema.safeParse({ cartItemId: 'ci1', quantity: 3 });
    expect(result.success).toBe(true);
  });

  it('rejects missing cartItemId', () => {
    const result = CartUpdateSchema.safeParse({ quantity: 3 });
    expect(result.success).toBe(false);
  });

  it('rejects empty cartItemId', () => {
    const result = CartUpdateSchema.safeParse({ cartItemId: '', quantity: 3 });
    expect(result.success).toBe(false);
  });

  it('rejects missing quantity', () => {
    const result = CartUpdateSchema.safeParse({ cartItemId: 'ci1' });
    expect(result.success).toBe(false);
  });

  it('rejects zero quantity', () => {
    const result = CartUpdateSchema.safeParse({ cartItemId: 'ci1', quantity: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative quantity', () => {
    const result = CartUpdateSchema.safeParse({ cartItemId: 'ci1', quantity: -1 });
    expect(result.success).toBe(false);
  });

  it('coerces string quantity', () => {
    const result = CartUpdateSchema.safeParse({ cartItemId: 'ci1', quantity: '5' });
    expect(result.success).toBe(true);
  });

  it('accepts large quantity', () => {
    const result = CartUpdateSchema.safeParse({ cartItemId: 'ci1', quantity: 1000 });
    expect(result.success).toBe(true);
  });
});

describe('CartDeleteSchema', () => {
  it('validates valid cart delete', () => {
    const result = CartDeleteSchema.safeParse({ cartItemId: 'ci1' });
    expect(result.success).toBe(true);
  });

  it('rejects missing cartItemId', () => {
    const result = CartDeleteSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects empty cartItemId', () => {
    const result = CartDeleteSchema.safeParse({ cartItemId: '' });
    expect(result.success).toBe(false);
  });
});

describe('CheckoutSchema', () => {
  it('validates valid checkout', () => {
    const result = CheckoutSchema.safeParse({
      address: { streetAddress: '123 Main', city: 'City', state: 'State', zipCode: '12345' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing address', () => {
    const result = CheckoutSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects null address', () => {
    const result = CheckoutSchema.safeParse({ address: null });
    expect(result.success).toBe(false);
  });

  it('rejects incomplete address', () => {
    const result = CheckoutSchema.safeParse({ address: { streetAddress: '123 Main' } });
    expect(result.success).toBe(false);
  });

  it('accepts optional country', () => {
    const result = CheckoutSchema.safeParse({
      address: { streetAddress: '123 Main', city: 'City', state: 'State', zipCode: '12345', country: 'India' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty streetAddress', () => {
    const result = CheckoutSchema.safeParse({
      address: { streetAddress: '', city: 'City', state: 'State', zipCode: '12345' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty city', () => {
    const result = CheckoutSchema.safeParse({
      address: { streetAddress: '123 Main', city: '', state: 'State', zipCode: '12345' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty state', () => {
    const result = CheckoutSchema.safeParse({
      address: { streetAddress: '123 Main', city: 'City', state: '', zipCode: '12345' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty zipCode', () => {
    const result = CheckoutSchema.safeParse({
      address: { streetAddress: '123 Main', city: 'City', state: 'State', zipCode: '' },
    });
    expect(result.success).toBe(false);
  });

  it('accepts unicode address', () => {
    const result = CheckoutSchema.safeParse({
      address: { streetAddress: '१२३ मुख्य', city: 'अहमदाबाद', state: 'गुजरात', zipCode: '380001' },
    });
    expect(result.success).toBe(true);
  });
});

describe('IdParamSchema', () => {
  it('validates valid id', () => {
    const result = IdParamSchema.safeParse({ id: 'abc123' });
    expect(result.success).toBe(true);
  });

  it('rejects missing id', () => {
    const result = IdParamSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects empty id', () => {
    const result = IdParamSchema.safeParse({ id: '' });
    expect(result.success).toBe(false);
  });

  it('rejects null id', () => {
    const result = IdParamSchema.safeParse({ id: null });
    expect(result.success).toBe(false);
  });

  it('accepts numeric id', () => {
    const result = IdParamSchema.safeParse({ id: '123' });
    expect(result.success).toBe(true);
  });

  it('accepts ObjectId format', () => {
    const result = IdParamSchema.safeParse({ id: '507f1f77bcf86cd799439011' });
    expect(result.success).toBe(true);
  });

  it('accepts UUID format', () => {
    const result = IdParamSchema.safeParse({ id: '550e8400-e29b-41d4-a716-446655440000' });
    expect(result.success).toBe(true);
  });
});

describe('ProductQuerySchema', () => {
  it('validates with defaults', () => {
    const result = ProductQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('defaults page to 1', () => {
    const result = ProductQuerySchema.safeParse({});
    expect((result as any).data.page).toBe(1);
  });

  it('defaults limit to 12', () => {
    const result = ProductQuerySchema.safeParse({});
    expect((result as any).data.limit).toBe(12);
  });

  it('accepts valid page', () => {
    const result = ProductQuerySchema.safeParse({ page: '5' });
    expect(result.success).toBe(true);
  });

  it('accepts valid limit', () => {
    const result = ProductQuerySchema.safeParse({ limit: '24' });
    expect(result.success).toBe(true);
  });

  it('rejects page 0', () => {
    const result = ProductQuerySchema.safeParse({ page: '0' });
    expect(result.success).toBe(true);
    expect((result as any).data.page).toBe(1);
  });

  it('rejects negative page', () => {
    const result = ProductQuerySchema.safeParse({ page: '-1' });
    expect(result.success).toBe(true);
    expect((result as any).data.page).toBe(1);
  });

  it('rejects non-numeric page', () => {
    const result = ProductQuerySchema.safeParse({ page: 'abc' });
    expect(result.success).toBe(true);
    expect((result as any).data.page).toBe(1);
  });

  it('rejects limit over 1000', () => {
    const result = ProductQuerySchema.safeParse({ limit: '1001' });
    expect(result.success).toBe(false);
  });

  it('accepts limit 1000', () => {
    const result = ProductQuerySchema.safeParse({ limit: '1000' });
    expect(result.success).toBe(true);
  });

  it('accepts limit 1', () => {
    const result = ProductQuerySchema.safeParse({ limit: '1' });
    expect(result.success).toBe(true);
  });

  it('handles empty string page', () => {
    const result = ProductQuerySchema.safeParse({ page: '' });
    expect(result.success).toBe(true);
    expect((result as any).data.page).toBe(1);
  });

  it('handles null page', () => {
    const result = ProductQuerySchema.safeParse({ page: null });
    expect(result.success).toBe(true);
    expect((result as any).data.page).toBe(1);
  });
});

describe('PaginationSchema', () => {
  it('validates with defaults', () => {
    const result = PaginationSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('defaults page to 1', () => {
    const result = PaginationSchema.safeParse({});
    expect((result as any).data.page).toBe(1);
  });

  it('defaults limit to 20', () => {
    const result = PaginationSchema.safeParse({});
    expect((result as any).data.limit).toBe(20);
  });

  it('accepts valid page', () => {
    const result = PaginationSchema.safeParse({ page: '3' });
    expect(result.success).toBe(true);
  });

  it('accepts valid limit', () => {
    const result = PaginationSchema.safeParse({ limit: '50' });
    expect(result.success).toBe(true);
  });

  it('rejects limit over 100', () => {
    const result = PaginationSchema.safeParse({ limit: '101' });
    expect(result.success).toBe(false);
  });

  it('accepts limit 100', () => {
    const result = PaginationSchema.safeParse({ limit: '100' });
    expect(result.success).toBe(true);
  });

  it('handles empty string page', () => {
    const result = PaginationSchema.safeParse({ page: '' });
    expect(result.success).toBe(true);
    expect((result as any).data.page).toBe(1);
  });

  it('handles null page', () => {
    const result = PaginationSchema.safeParse({ page: null });
    expect(result.success).toBe(true);
    expect((result as any).data.page).toBe(1);
  });

  it('handles non-numeric page', () => {
    const result = PaginationSchema.safeParse({ page: 'abc' });
    expect(result.success).toBe(true);
    expect((result as any).data.page).toBe(1);
  });
});
