import { describe, it, expect } from 'vitest';
import {
  ProductSchema,
  UpdateProductSchema,
  DeleteProductSchema,
  CategorySchema,
  UpdateCategorySchema,
  DeleteCategorySchema,
} from '@lib/validators';

describe('Product Validators', () => {
  const validProduct = {
    name: 'Banarasi Silk Saree',
    color: 'Maroon',
    ocassion: 'Bridal',
    price: 4999,
    stock: 10,
    categoryId: '507f1f77bcf86cd799439011',
    images: ['https://example.com/image1.jpg'],
  };

  describe('ProductSchema', () => {
    it('should validate a correct product', () => {
      const result = ProductSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
    });

    it('should accept multiple images', () => {
      const result = ProductSchema.safeParse({
        ...validProduct,
        images: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty product name', () => {
      const result = ProductSchema.safeParse({ ...validProduct, name: '' });
      expect(result.success).toBe(false);
    });

    it('should reject negative price', () => {
      const result = ProductSchema.safeParse({ ...validProduct, price: -100 });
      expect(result.success).toBe(false);
    });

    it('should reject zero price', () => {
      const result = ProductSchema.safeParse({ ...validProduct, price: 0 });
      expect(result.success).toBe(false);
    });

    it('should accept zero stock', () => {
      const result = ProductSchema.safeParse({ ...validProduct, stock: 0 });
      expect(result.success).toBe(true);
    });

    it('should reject negative stock', () => {
      const result = ProductSchema.safeParse({ ...validProduct, stock: -1 });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer stock', () => {
      const result = ProductSchema.safeParse({ ...validProduct, stock: 2.5 });
      expect(result.success).toBe(false);
    });

    it('should reject empty images array', () => {
      const result = ProductSchema.safeParse({ ...validProduct, images: [] });
      expect(result.success).toBe(false);
    });

    it('should reject missing categoryId', () => {
      const { categoryId, ...noCategory } = validProduct;
      const result = ProductSchema.safeParse(noCategory);
      expect(result.success).toBe(false);
    });

    it('should coerce string price to number', () => {
      const result = ProductSchema.safeParse({ ...validProduct, price: '2999' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.price).toBe(2999);
      }
    });

    it('should coerce string stock to number', () => {
      const result = ProductSchema.safeParse({ ...validProduct, stock: '5' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.stock).toBe(5);
      }
    });

    it('should reject missing color', () => {
      const result = ProductSchema.safeParse({ ...validProduct, color: '' });
      expect(result.success).toBe(false);
    });

    it('should reject missing ocassion', () => {
      const result = ProductSchema.safeParse({ ...validProduct, ocassion: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateProductSchema', () => {
    it('should validate with only id and name', () => {
      const result = UpdateProductSchema.safeParse({ id: 'abc123', name: 'Updated Name' });
      expect(result.success).toBe(true);
    });

    it('should validate with all fields', () => {
      const result = UpdateProductSchema.safeParse({ id: 'abc123', ...validProduct });
      expect(result.success).toBe(true);
    });

    it('should reject missing id', () => {
      const result = UpdateProductSchema.safeParse({ name: 'Updated Name' });
      expect(result.success).toBe(false);
    });

    it('should reject empty id', () => {
      const result = UpdateProductSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('DeleteProductSchema', () => {
    it('should validate with valid id', () => {
      const result = DeleteProductSchema.safeParse({ id: 'abc123' });
      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const result = DeleteProductSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
    });

    it('should reject missing id', () => {
      const result = DeleteProductSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});

describe('Category Validators', () => {
  describe('CategorySchema', () => {
    it('should validate correct category', () => {
      const result = CategorySchema.safeParse({ name: 'Silk', image: 'https://example.com/silk.jpg' });
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const result = CategorySchema.safeParse({ name: '', image: 'https://example.com/silk.jpg' });
      expect(result.success).toBe(false);
    });

    it('should reject empty image', () => {
      const result = CategorySchema.safeParse({ name: 'Cotton', image: '' });
      expect(result.success).toBe(false);
    });

    it('should reject missing fields', () => {
      const result = CategorySchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateCategorySchema', () => {
    it('should validate id with optional name', () => {
      const result = UpdateCategorySchema.safeParse({ id: 'cat1', name: 'Updated Silk' });
      expect(result.success).toBe(true);
    });

    it('should validate id with optional image', () => {
      const result = UpdateCategorySchema.safeParse({ id: 'cat1', image: 'new-img.jpg' });
      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const result = UpdateCategorySchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('DeleteCategorySchema', () => {
    it('should validate with valid id', () => {
      const result = DeleteCategorySchema.safeParse({ id: 'cat1' });
      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const result = DeleteCategorySchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
    });
  });
});
