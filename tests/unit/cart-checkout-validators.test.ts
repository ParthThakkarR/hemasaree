import { describe, it, expect } from 'vitest';
import {
  CartAddSchema,
  CartUpdateSchema,
  CartDeleteSchema,
  CheckoutSchema,
  IdParamSchema,
  ProductQuerySchema,
  PaginationSchema,
} from '@lib/validators';

describe('Cart Validators', () => {
  describe('CartAddSchema', () => {
    const validCartItem = {
      productId: '507f1f77bcf86cd799439011',
      quantity: 2,
      productName: 'Red Silk Saree',
      price: 1499,
    };

    it('should validate a correct cart item', () => {
      const result = CartAddSchema.safeParse(validCartItem);
      expect(result.success).toBe(true);
    });

    it('should accept optional productImage', () => {
      const result = CartAddSchema.safeParse({ ...validCartItem, productImage: 'img.jpg' });
      expect(result.success).toBe(true);
    });

    it('should default withPolish to false', () => {
      const result = CartAddSchema.safeParse(validCartItem);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.withPolish).toBe(false);
      }
    });

    it('should accept withPolish = true', () => {
      const result = CartAddSchema.safeParse({ ...validCartItem, withPolish: true });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.withPolish).toBe(true);
      }
    });

    it('should reject zero quantity', () => {
      const result = CartAddSchema.safeParse({ ...validCartItem, quantity: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject negative quantity', () => {
      const result = CartAddSchema.safeParse({ ...validCartItem, quantity: -1 });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer quantity', () => {
      const result = CartAddSchema.safeParse({ ...validCartItem, quantity: 1.5 });
      expect(result.success).toBe(false);
    });

    it('should reject zero price', () => {
      const result = CartAddSchema.safeParse({ ...validCartItem, price: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject negative price', () => {
      const result = CartAddSchema.safeParse({ ...validCartItem, price: -500 });
      expect(result.success).toBe(false);
    });

    it('should reject missing productId', () => {
      const { productId, ...noId } = validCartItem;
      const result = CartAddSchema.safeParse(noId);
      expect(result.success).toBe(false);
    });

    it('should reject empty productName', () => {
      const result = CartAddSchema.safeParse({ ...validCartItem, productName: '' });
      expect(result.success).toBe(false);
    });

    it('should coerce string quantity to number', () => {
      const result = CartAddSchema.safeParse({ ...validCartItem, quantity: '3' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.quantity).toBe(3);
      }
    });
  });

  describe('CartUpdateSchema', () => {
    it('should validate correct update', () => {
      const result = CartUpdateSchema.safeParse({ cartItemId: 'item1', quantity: 5 });
      expect(result.success).toBe(true);
    });

    it('should reject zero quantity', () => {
      const result = CartUpdateSchema.safeParse({ cartItemId: 'item1', quantity: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject missing cartItemId', () => {
      const result = CartUpdateSchema.safeParse({ quantity: 2 });
      expect(result.success).toBe(false);
    });

    it('should reject empty cartItemId', () => {
      const result = CartUpdateSchema.safeParse({ cartItemId: '', quantity: 2 });
      expect(result.success).toBe(false);
    });
  });

  describe('CartDeleteSchema', () => {
    it('should validate correct delete', () => {
      const result = CartDeleteSchema.safeParse({ cartItemId: 'item1' });
      expect(result.success).toBe(true);
    });

    it('should reject empty cartItemId', () => {
      const result = CartDeleteSchema.safeParse({ cartItemId: '' });
      expect(result.success).toBe(false);
    });
  });
});

describe('CheckoutSchema', () => {
  const validAddress = {
    streetAddress: '42 MG Road, Ring Road',
    city: 'Surat',
    state: 'Gujarat',
    zipCode: '395001',
  };

  it('should validate correct checkout with full address', () => {
    const result = CheckoutSchema.safeParse({ address: validAddress });
    expect(result.success).toBe(true);
  });

  it('should accept optional country', () => {
    const result = CheckoutSchema.safeParse({
      address: { ...validAddress, country: 'India' },
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing streetAddress', () => {
    const result = CheckoutSchema.safeParse({
      address: { ...validAddress, streetAddress: '' },
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing city', () => {
    const result = CheckoutSchema.safeParse({
      address: { ...validAddress, city: '' },
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing state', () => {
    const result = CheckoutSchema.safeParse({
      address: { ...validAddress, state: '' },
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing zipCode', () => {
    const result = CheckoutSchema.safeParse({
      address: { ...validAddress, zipCode: '' },
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing address entirely', () => {
    const result = CheckoutSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('IdParamSchema', () => {
  it('should validate a non-empty id', () => {
    const result = IdParamSchema.safeParse({ id: '507f1f77bcf86cd799439011' });
    expect(result.success).toBe(true);
  });

  it('should reject empty id', () => {
    const result = IdParamSchema.safeParse({ id: '' });
    expect(result.success).toBe(false);
  });

  it('should reject missing id', () => {
    const result = IdParamSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('Pagination & Query Schemas', () => {
  describe('ProductQuerySchema', () => {
    it('should apply defaults when no params provided', () => {
      const result = ProductQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(12);
      }
    });

    it('should accept valid page and limit', () => {
      const result = ProductQuerySchema.safeParse({ page: '3', limit: '24' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(24);
      }
    });

    it('should default page to 1 for invalid string', () => {
      const result = ProductQuerySchema.safeParse({ page: 'abc' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
      }
    });

    it('should default page to 1 for zero', () => {
      const result = ProductQuerySchema.safeParse({ page: '0' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
      }
    });

    it('should default page to 1 for negative', () => {
      const result = ProductQuerySchema.safeParse({ page: '-5' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
      }
    });

    it('should default limit to 12 for empty string', () => {
      const result = ProductQuerySchema.safeParse({ limit: '' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(12);
      }
    });

    it('should default limit to 12 for null', () => {
      const result = ProductQuerySchema.safeParse({ limit: null });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(12);
      }
    });

    it('should reject limit greater than max (1000)', () => {
      const result = ProductQuerySchema.safeParse({ limit: '1001' });
      expect(result.success).toBe(false);
    });
  });

  describe('PaginationSchema', () => {
    it('should apply default page=1, limit=20', () => {
      const result = PaginationSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should accept valid values', () => {
      const result = PaginationSchema.safeParse({ page: '5', limit: '50' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(5);
        expect(result.data.limit).toBe(50);
      }
    });
  });
});
