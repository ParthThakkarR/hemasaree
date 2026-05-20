// @ts-nocheck
import { describe, it, expect } from 'vitest';
import {
  ForgotPasswordSchema, LoginSchema, SendOtpSchema, SignUpSchema,
  VerifyOtpSchema, ResetPasswordSchema, CategorySchema, UpdateCategorySchema,
  DeleteCategorySchema, ProductSchema, UpdateProductSchema, DeleteProductSchema,
  CartAddSchema, CartUpdateSchema, CartDeleteSchema, CheckoutSchema,
  IdParamSchema, ProductQuerySchema, PaginationSchema,
} from '@lib/validators';

describe('Schema exports', () => {
  it('exports ForgotPasswordSchema', () => {
    expect(ForgotPasswordSchema).toBeDefined();
    expect(typeof ForgotPasswordSchema.safeParse).toBe('function');
  });

  it('exports LoginSchema', () => {
    expect(LoginSchema).toBeDefined();
    expect(typeof LoginSchema.safeParse).toBe('function');
  });

  it('exports SendOtpSchema', () => {
    expect(SendOtpSchema).toBeDefined();
    expect(typeof SendOtpSchema.safeParse).toBe('function');
  });

  it('exports SignUpSchema', () => {
    expect(SignUpSchema).toBeDefined();
    expect(typeof SignUpSchema.safeParse).toBe('function');
  });

  it('exports VerifyOtpSchema', () => {
    expect(VerifyOtpSchema).toBeDefined();
    expect(typeof VerifyOtpSchema.safeParse).toBe('function');
  });

  it('exports ResetPasswordSchema', () => {
    expect(ResetPasswordSchema).toBeDefined();
    expect(typeof ResetPasswordSchema.safeParse).toBe('function');
  });

  it('exports CategorySchema', () => {
    expect(CategorySchema).toBeDefined();
    expect(typeof CategorySchema.safeParse).toBe('function');
  });

  it('exports UpdateCategorySchema', () => {
    expect(UpdateCategorySchema).toBeDefined();
    expect(typeof UpdateCategorySchema.safeParse).toBe('function');
  });

  it('exports DeleteCategorySchema', () => {
    expect(DeleteCategorySchema).toBeDefined();
    expect(typeof DeleteCategorySchema.safeParse).toBe('function');
  });

  it('exports ProductSchema', () => {
    expect(ProductSchema).toBeDefined();
    expect(typeof ProductSchema.safeParse).toBe('function');
  });

  it('exports UpdateProductSchema', () => {
    expect(UpdateProductSchema).toBeDefined();
    expect(typeof UpdateProductSchema.safeParse).toBe('function');
  });

  it('exports DeleteProductSchema', () => {
    expect(DeleteProductSchema).toBeDefined();
    expect(typeof DeleteProductSchema.safeParse).toBe('function');
  });

  it('exports CartAddSchema', () => {
    expect(CartAddSchema).toBeDefined();
    expect(typeof CartAddSchema.safeParse).toBe('function');
  });

  it('exports CartUpdateSchema', () => {
    expect(CartUpdateSchema).toBeDefined();
    expect(typeof CartUpdateSchema.safeParse).toBe('function');
  });

  it('exports CartDeleteSchema', () => {
    expect(CartDeleteSchema).toBeDefined();
    expect(typeof CartDeleteSchema.safeParse).toBe('function');
  });

  it('exports CheckoutSchema', () => {
    expect(CheckoutSchema).toBeDefined();
    expect(typeof CheckoutSchema.safeParse).toBe('function');
  });

  it('exports IdParamSchema', () => {
    expect(IdParamSchema).toBeDefined();
    expect(typeof IdParamSchema.safeParse).toBe('function');
  });

  it('exports ProductQuerySchema', () => {
    expect(ProductQuerySchema).toBeDefined();
    expect(typeof ProductQuerySchema.safeParse).toBe('function');
  });

  it('exports PaginationSchema', () => {
    expect(PaginationSchema).toBeDefined();
    expect(typeof PaginationSchema.safeParse).toBe('function');
  });
});

describe('Schema parse methods', () => {
  it('ForgotPasswordSchema.parse works', () => {
    const result = ForgotPasswordSchema.parse({ email: 'test@test.com' });
    expect(result.email).toBe('test@test.com');
  });

  it('LoginSchema.parse works', () => {
    const result = LoginSchema.parse({ email: 'test@test.com', password: 'pass' });
    expect(result.email).toBe('test@test.com');
    expect(result.password).toBe('pass');
  });

  it('SendOtpSchema.parse works', () => {
    const result = SendOtpSchema.parse({ email: 'test@test.com' });
    expect(result.email).toBe('test@test.com');
  });

  it('SignUpSchema.parse works', () => {
    const result = SignUpSchema.parse({ firstName: 'John', email: 'john@test.com', password: 'Str0ng!Pass' });
    expect(result.firstName).toBe('John');
    expect(result.email).toBe('john@test.com');
  });

  it('VerifyOtpSchema.parse works', () => {
    const result = VerifyOtpSchema.parse({ email: 'test@test.com', otp: '123456' });
    expect(result.email).toBe('test@test.com');
    expect(result.otp).toBe('123456');
  });

  it('ResetPasswordSchema.parse works', () => {
    const result = ResetPasswordSchema.parse({ token: 'abc', password: 'Str0ng!Pass' });
    expect(result.token).toBe('abc');
    expect(result.password).toBe('Str0ng!Pass');
  });

  it('CategorySchema.parse works', () => {
    const result = CategorySchema.parse({ name: 'Silk', image: 'img.jpg' });
    expect(result.name).toBe('Silk');
    expect(result.image).toBe('img.jpg');
  });

  it('UpdateCategorySchema.parse works', () => {
    const result = UpdateCategorySchema.parse({ id: 'cat1', name: 'New' });
    expect(result.id).toBe('cat1');
    expect(result.name).toBe('New');
  });

  it('DeleteCategorySchema.parse works', () => {
    const result = DeleteCategorySchema.parse({ id: 'cat1' });
    expect(result.id).toBe('cat1');
  });

  it('ProductSchema.parse works', () => {
    const result = ProductSchema.parse({
      name: 'Saree', color: 'Red', ocassion: 'Wedding', price: 1000, stock: 10, categoryId: 'cat1', images: ['img.jpg'],
    });
    expect(result.name).toBe('Saree');
    expect(result.price).toBe(1000);
  });

  it('UpdateProductSchema.parse works', () => {
    const result = UpdateProductSchema.parse({ id: 'p1', name: 'New' });
    expect(result.id).toBe('p1');
    expect(result.name).toBe('New');
  });

  it('DeleteProductSchema.parse works', () => {
    const result = DeleteProductSchema.parse({ id: 'p1' });
    expect(result.id).toBe('p1');
  });

  it('CartAddSchema.parse works', () => {
    const result = CartAddSchema.parse({ productId: 'p1', quantity: 1, productName: 'Saree', price: 1000 });
    expect(result.productId).toBe('p1');
    expect(result.quantity).toBe(1);
  });

  it('CartUpdateSchema.parse works', () => {
    const result = CartUpdateSchema.parse({ cartItemId: 'ci1', quantity: 3 });
    expect(result.cartItemId).toBe('ci1');
    expect(result.quantity).toBe(3);
  });

  it('CartDeleteSchema.parse works', () => {
    const result = CartDeleteSchema.parse({ cartItemId: 'ci1' });
    expect(result.cartItemId).toBe('ci1');
  });

  it('CheckoutSchema.parse works', () => {
    const result = CheckoutSchema.parse({
      address: { streetAddress: '123 Main', city: 'City', state: 'State', zipCode: '12345' },
    });
    expect(result.address.streetAddress).toBe('123 Main');
  });

  it('IdParamSchema.parse works', () => {
    const result = IdParamSchema.parse({ id: 'abc123' });
    expect(result.id).toBe('abc123');
  });

  it('ProductQuerySchema.parse works', () => {
    const result = ProductQuerySchema.parse({ page: '2', limit: '24' });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(24);
  });

  it('PaginationSchema.parse works', () => {
    const result = PaginationSchema.parse({ page: '3', limit: '50' });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(50);
  });
});

describe('Schema error messages', () => {
  it('ForgotPasswordSchema has email error', () => {
    const result = ForgotPasswordSchema.safeParse({ email: 'invalid' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('email');
    }
  });

  it('LoginSchema has email error', () => {
    const result = LoginSchema.safeParse({ email: 'invalid', password: 'pass' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('email');
    }
  });

  it('LoginSchema has password error', () => {
    const result = LoginSchema.safeParse({ email: 'test@test.com', password: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Password');
    }
  });

  it('SignUpSchema has firstName error', () => {
    const result = SignUpSchema.safeParse({ firstName: '', email: 'test@test.com', password: 'Str0ng!Pass' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('First name');
    }
  });

  it('SignUpSchema has email error', () => {
    const result = SignUpSchema.safeParse({ firstName: 'John', email: 'invalid', password: 'Str0ng!Pass' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('email');
    }
  });

  it('SignUpSchema has password error', () => {
    const result = SignUpSchema.safeParse({ firstName: 'John', email: 'john@test.com', password: 'weak' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Password');
    }
  });

  it('VerifyOtpSchema has email error', () => {
    const result = VerifyOtpSchema.safeParse({ email: 'invalid', otp: '123456' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('email');
    }
  });

  it('VerifyOtpSchema has otp error', () => {
    const result = VerifyOtpSchema.safeParse({ email: 'test@test.com', otp: 'abc' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('OTP');
    }
  });

  it('ResetPasswordSchema has token error', () => {
    const result = ResetPasswordSchema.safeParse({ token: '', password: 'Str0ng!Pass' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Token');
    }
  });

  it('ResetPasswordSchema has password error', () => {
    const result = ResetPasswordSchema.safeParse({ token: 'abc', password: 'weak' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Password');
    }
  });

  it('CategorySchema has name error', () => {
    const result = CategorySchema.safeParse({ name: '', image: 'img.jpg' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('name');
    }
  });

  it('CategorySchema has image error', () => {
    const result = CategorySchema.safeParse({ name: 'Silk', image: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Image');
    }
  });

  it('ProductSchema has name error', () => {
    const result = ProductSchema.safeParse({ name: '', color: 'Red', ocassion: 'Wedding', price: 1000, stock: 10, categoryId: 'cat1', images: ['img.jpg'] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('name');
    }
  });

  it('ProductSchema has price error', () => {
    const result = ProductSchema.safeParse({ name: 'Saree', color: 'Red', ocassion: 'Wedding', price: -100, stock: 10, categoryId: 'cat1', images: ['img.jpg'] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Price');
    }
  });

  it('ProductSchema has stock error', () => {
    const result = ProductSchema.safeParse({ name: 'Saree', color: 'Red', ocassion: 'Wedding', price: 1000, stock: -1, categoryId: 'cat1', images: ['img.jpg'] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Stock');
    }
  });

  it('CartAddSchema has productId error', () => {
    const result = CartAddSchema.safeParse({ productId: '', quantity: 1, productName: 'Saree', price: 1000 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Product ID');
    }
  });

  it('CartAddSchema has quantity error', () => {
    const result = CartAddSchema.safeParse({ productId: 'p1', quantity: 0, productName: 'Saree', price: 1000 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Quantity');
    }
  });

  it('CartAddSchema has price error', () => {
    const result = CartAddSchema.safeParse({ productId: 'p1', quantity: 1, productName: 'Saree', price: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Price');
    }
  });

  it('CheckoutSchema has streetAddress error', () => {
    const result = CheckoutSchema.safeParse({ address: { streetAddress: '', city: 'City', state: 'State', zipCode: '12345' } });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Street address');
    }
  });

  it('CheckoutSchema has city error', () => {
    const result = CheckoutSchema.safeParse({ address: { streetAddress: '123 Main', city: '', state: 'State', zipCode: '12345' } });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('City');
    }
  });

  it('CheckoutSchema has state error', () => {
    const result = CheckoutSchema.safeParse({ address: { streetAddress: '123 Main', city: 'City', state: '', zipCode: '12345' } });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('State');
    }
  });

  it('CheckoutSchema has zipCode error', () => {
    const result = CheckoutSchema.safeParse({ address: { streetAddress: '123 Main', city: 'City', state: 'State', zipCode: '' } });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Zip code');
    }
  });
});

describe('Schema type checks', () => {
  it('ForgotPasswordSchema returns object with email', () => {
    const result = ForgotPasswordSchema.safeParse({ email: 'test@test.com' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.email).toBe('string');
    }
  });

  it('LoginSchema returns object with email and password', () => {
    const result = LoginSchema.safeParse({ email: 'test@test.com', password: 'pass' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.email).toBe('string');
      expect(typeof result.data.password).toBe('string');
    }
  });

  it('SignUpSchema returns object with firstName and email', () => {
    const result = SignUpSchema.safeParse({ firstName: 'John', email: 'john@test.com', password: 'Str0ng!Pass' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.firstName).toBe('string');
      expect(typeof result.data.email).toBe('string');
    }
  });

  it('SignUpSchema returns optional lastName', () => {
    const result = SignUpSchema.safeParse({ firstName: 'John', lastName: 'Doe', email: 'john@test.com', password: 'Str0ng!Pass' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lastName).toBe('Doe');
    }
  });

  it('SignUpSchema returns optional phone', () => {
    const result = SignUpSchema.safeParse({ firstName: 'John', email: 'john@test.com', password: 'Str0ng!Pass', phone: '1234567890' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe('1234567890');
    }
  });

  it('SignUpSchema returns optional address', () => {
    const result = SignUpSchema.safeParse({
      firstName: 'John', email: 'john@test.com', password: 'Str0ng!Pass',
      address: { streetAddress: '123 Main', city: 'City', state: 'State', zipCode: '12345' },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.address).toBeDefined();
    }
  });

  it('ProductSchema returns number price', () => {
    const result = ProductSchema.safeParse({ name: 'Saree', color: 'Red', ocassion: 'Wedding', price: 1000, stock: 10, categoryId: 'cat1', images: ['img.jpg'] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.price).toBe('number');
    }
  });

  it('ProductSchema returns number stock', () => {
    const result = ProductSchema.safeParse({ name: 'Saree', color: 'Red', ocassion: 'Wedding', price: 1000, stock: 10, categoryId: 'cat1', images: ['img.jpg'] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.stock).toBe('number');
    }
  });

  it('ProductSchema returns array images', () => {
    const result = ProductSchema.safeParse({ name: 'Saree', color: 'Red', ocassion: 'Wedding', price: 1000, stock: 10, categoryId: 'cat1', images: ['img1.jpg', 'img2.jpg'] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Array.isArray(result.data.images)).toBe(true);
    }
  });

  it('CartAddSchema returns number quantity', () => {
    const result = CartAddSchema.safeParse({ productId: 'p1', quantity: 2, productName: 'Saree', price: 1000 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.quantity).toBe('number');
    }
  });

  it('CartAddSchema returns boolean withPolish', () => {
    const result = CartAddSchema.safeParse({ productId: 'p1', quantity: 1, productName: 'Saree', price: 1000 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.withPolish).toBe('boolean');
    }
  });

  it('CartAddSchema defaults withPolish to false', () => {
    const result = CartAddSchema.safeParse({ productId: 'p1', quantity: 1, productName: 'Saree', price: 1000 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.withPolish).toBe(false);
    }
  });

  it('ProductQuerySchema returns number page', () => {
    const result = ProductQuerySchema.safeParse({ page: '5' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.page).toBe('number');
    }
  });

  it('ProductQuerySchema returns number limit', () => {
    const result = ProductQuerySchema.safeParse({ limit: '24' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.limit).toBe('number');
    }
  });

  it('PaginationSchema returns number page', () => {
    const result = PaginationSchema.safeParse({ page: '3' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.page).toBe('number');
    }
  });

  it('PaginationSchema returns number limit', () => {
    const result = PaginationSchema.safeParse({ limit: '50' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.limit).toBe('number');
    }
  });
});
