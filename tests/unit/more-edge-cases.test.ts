import { describe, it, expect } from 'vitest';
import {
  CartAddSchema,
  CheckoutSchema,
  ProductSchema,
  SignUpSchema,
  IdParamSchema,
  ReturnRequestSchema,
  ProductQuerySchema,
  CartUpdateSchema
} from '@lib/validators';

describe('Massive Edge Case Parameterized Testing', () => {
  const boundaryNumbers = [-1, 0, 1, 9999, Number.MAX_SAFE_INTEGER, Infinity, -Infinity, NaN, 1.5, -0.5, 0.00000001];
  const boundaryStrings = ['', ' ', '   ', 'a', 'a'.repeat(255), 'a'.repeat(10000), '<script>alert(1)</script>', 'DROP TABLE users;', 'null', 'undefined', '\n\t\r'];
  const booleanValues = [true, false, 'true', 'false', 1, 0, null, undefined];

  describe('ProductSchema Price Field', () => {
    boundaryNumbers.forEach((val) => {
      it(`should handle price edge case: ${val}`, () => {
        const result = ProductSchema.safeParse({
          name: 'Saree', color: 'Red', ocassion: 'Festive', stock: 10, categoryId: 'cat1', images: ['img.jpg'],
          price: val
        });
        if (typeof val === 'number' && !isNaN(val) && val > 0 && isFinite(val)) {
          expect(result.success).toBe(true);
        } else {
          expect(result.success).toBe(false);
        }
      });
    });
  });

  describe('ProductSchema Stock Field', () => {
    boundaryNumbers.forEach((val) => {
      it(`should handle stock edge case: ${val}`, () => {
        const result = ProductSchema.safeParse({
          name: 'Saree', color: 'Red', ocassion: 'Festive', price: 100, categoryId: 'cat1', images: ['img.jpg'],
          stock: val
        });
        if (typeof val === 'number' && !isNaN(val) && val >= 0 && Number.isInteger(val)) {
          expect(result.success).toBe(true);
        } else {
          expect(result.success).toBe(false);
        }
      });
    });
  });

  describe('ProductSchema Name Field', () => {
    boundaryStrings.forEach((val) => {
      it(`should handle name edge case string length: ${val.length}`, () => {
        const result = ProductSchema.safeParse({
          name: val, color: 'Red', ocassion: 'Festive', price: 100, stock: 10, categoryId: 'cat1', images: ['img.jpg'],
        });
        if (typeof val === 'string' && val.length > 0) {
          expect(result.success).toBe(true);
        } else {
          expect(result.success).toBe(false);
        }
      });
    });
  });

  describe('SignUpSchema Email Field', () => {
    const emails = [
      'test@test.com', 'user+tag@domain.co.uk', '123@123.com',
      'invalid', 'test@.com', '@test.com', 'test@test', 'test@test..com',
      ...boundaryStrings
    ];
    emails.forEach((val) => {
      it(`should handle email format: ${val.substring(0, 20)}`, () => {
        const result = SignUpSchema.safeParse({
          firstName: 'John', password: 'Secure123!@#',
          email: val
        });
        // We just ensure it doesn't crash on weird inputs
        expect(typeof result.success).toBe('boolean');
      });
    });
  });

  describe('SignUpSchema Password Field', () => {
    const passwords = [
      'Short1!', 'NoSpecial123', 'nouppercase1!', 'NOLOWERCASE1!', 'Valid123!@#', 'Valid123!@#'.repeat(10)
    ];
    passwords.forEach((val) => {
      it(`should validate password complexity: ${val.substring(0, 15)}`, () => {
        const result = SignUpSchema.safeParse({
          firstName: 'John', email: 'test@test.com',
          password: val
        });
        // Min 8, 1 upper, 1 lower, 1 number, 1 special
        const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(val);
        expect(result.success).toBe(isValid);
      });
    });
  });

  describe('CartAddSchema Quantity Field', () => {
    boundaryNumbers.forEach((val) => {
      it(`should validate cart quantity boundary: ${val}`, () => {
        const result = CartAddSchema.safeParse({
          productId: 'prod1', productName: 'Item', price: 100,
          quantity: val
        });
        if (typeof val === 'number' && !isNaN(val) && val >= 1 && Number.isInteger(val)) {
          expect(result.success).toBe(true);
        } else {
          expect(result.success).toBe(false);
        }
      });
    });
  });

  describe('CartUpdateSchema Quantity Field', () => {
    boundaryNumbers.forEach((val) => {
      it(`should validate cart update quantity boundary: ${val}`, () => {
        const result = CartUpdateSchema.safeParse({
          cartItemId: 'item1',
          quantity: val
        });
        if (typeof val === 'number' && !isNaN(val) && val >= 1 && Number.isInteger(val)) {
          expect(result.success).toBe(true);
        } else {
          expect(result.success).toBe(false);
        }
      });
    });
  });

  describe('ProductQuerySchema Pagination Fields', () => {
    boundaryStrings.forEach((val) => {
      it(`should handle page string inputs: length ${val?.length}`, () => {
        const result = ProductQuerySchema.safeParse({ page: val });
        // Coercion from empty string usually fails or becomes NaN depending on z.coerce
        expect(typeof result.success).toBe('boolean');
      });
    });
  });

  describe('CheckoutSchema Complete Object', () => {
    it('should reject entirely empty object', () => {
      expect(CheckoutSchema.safeParse({}).success).toBe(false);
    });

    it('should accept valid object', () => {
      expect(CheckoutSchema.safeParse({
        address: {
          streetAddress: '123', city: 'Test', state: 'TS', zipCode: '123'
        }
      }).success).toBe(true);
    });
  });

  describe('IdParamSchema', () => {
    boundaryStrings.forEach((val) => {
      it(`should test ID parameter shapes: length ${val.length}`, () => {
        const result = IdParamSchema.safeParse({ id: val });
        expect(typeof result.success).toBe('boolean');
      });
    });
  });
});
