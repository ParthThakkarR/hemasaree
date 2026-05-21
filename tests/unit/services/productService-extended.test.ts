// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductService } from '@/lib/services/productService';
import { NotFoundError, ConflictError } from '@/lib/errors';

const mockPrisma = vi.hoisted(() => ({
  product: { count: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  category: { findUnique: vi.fn() },
  review: { groupBy: vi.fn(), aggregate: vi.fn(), count: vi.fn() },
  cartItem: { deleteMany: vi.fn() },
  orderItem: { count: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock('@/app/lib/prisma', () => ({ prisma: mockPrisma }));

describe('ProductService - Extended', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('buildWhereClause - Extended', () => {
    it('handles combined filters', () => {
      const where = ProductService.buildWhereClause({
        categoryId: 'sarees', search: 'silk', minPrice: 100, maxPrice: 1000, color: 'red', occasion: 'wedding',
      });
      expect(where.category).toBeDefined();
      expect(where.OR).toBeDefined();
      expect(where.price).toBeDefined();
      expect(where.color).toBeDefined();
      expect(where.occasion).toBeDefined();
    });

    it('handles only categoryId', () => {
      const where = ProductService.buildWhereClause({ categoryId: '507f1f77bcf86cd799439011' });
      expect(where.categoryId).toBe('507f1f77bcf86cd799439011');
      expect(where.category).toBeUndefined();
    });

    it('handles only search', () => {
      const where = ProductService.buildWhereClause({ search: 'test' });
      expect(where.OR).toHaveLength(3);
    });

    it('handles only minPrice', () => {
      const where = ProductService.buildWhereClause({ minPrice: 100 });
      expect(where.price.gte).toBe(100);
      expect(where.price.lte).toBeUndefined();
    });

    it('handles only maxPrice', () => {
      const where = ProductService.buildWhereClause({ maxPrice: 1000 });
      expect(where.price.lte).toBe(1000);
      expect(where.price.gte).toBeUndefined();
    });

    it('handles only color', () => {
      const where = ProductService.buildWhereClause({ color: 'blue' });
      expect(where.color.contains).toBe('blue');
    });

    it('handles only occasion', () => {
      const where = ProductService.buildWhereClause({ occasion: 'party' });
      expect(where.occasion.contains).toBe('party');
    });

    it('handles empty filters', () => {
      const where = ProductService.buildWhereClause({});
      expect(Object.keys(where)).toHaveLength(0);
    });

    it('handles case insensitive search', () => {
      const where = ProductService.buildWhereClause({ search: 'TEST' });
      expect(where.OR[0].name.mode).toBe('insensitive');
    });

    it('handles case insensitive color', () => {
      const where = ProductService.buildWhereClause({ color: 'RED' });
      expect(where.color.mode).toBe('insensitive');
    });

    it('handles case insensitive occasion', () => {
      const where = ProductService.buildWhereClause({ occasion: 'WEDDING' });
      expect(where.occasion.mode).toBe('insensitive');
    });

    it('handles category name with spaces', () => {
      const where = ProductService.buildWhereClause({ categoryId: 'Banarasi Silk' });
      expect(where.category.name.equals).toBe('Banarasi Silk');
    });

    it('handles category name with special chars', () => {
      const where = ProductService.buildWhereClause({ categoryId: "O'Reilly" });
      expect(where.category.name.equals).toBe("O'Reilly");
    });

    it('handles search with special chars', () => {
      const where = ProductService.buildWhereClause({ search: "O'Reilly & Sons" });
      expect(where.OR).toBeDefined();
    });

    it('handles search with unicode', () => {
      const where = ProductService.buildWhereClause({ search: 'साड़ी' });
      expect(where.OR).toBeDefined();
    });

    it('handles zero minPrice', () => {
      const where = ProductService.buildWhereClause({ minPrice: 0 });
      expect(where.price.gte).toBe(0);
    });

    it('handles zero maxPrice', () => {
      const where = ProductService.buildWhereClause({ maxPrice: 0 });
      expect(where.price.lte).toBe(0);
    });

    it('handles negative prices', () => {
      const where = ProductService.buildWhereClause({ minPrice: -100, maxPrice: -10 });
      expect(where.price.gte).toBe(-100);
      expect(where.price.lte).toBe(-10);
    });

    it('handles very large prices', () => {
      const where = ProductService.buildWhereClause({ minPrice: 1000000, maxPrice: 999999999 });
      expect(where.price.gte).toBe(1000000);
      expect(where.price.lte).toBe(999999999);
    });

    it('handles decimal prices', () => {
      const where = ProductService.buildWhereClause({ minPrice: 99.99, maxPrice: 999.99 });
      expect(where.price.gte).toBe(99.99);
      expect(where.price.lte).toBe(999.99);
    });

    it('handles long search string', () => {
      const where = ProductService.buildWhereClause({ search: 'a'.repeat(1000) });
      expect(where.OR[0].name.contains).toBe('a'.repeat(1000));
    });

    it('handles long color string', () => {
      const where = ProductService.buildWhereClause({ color: 'a'.repeat(1000) });
      expect(where.color.contains).toBe('a'.repeat(1000));
    });

    it('handles long occasion string', () => {
      const where = ProductService.buildWhereClause({ occasion: 'a'.repeat(1000) });
      expect(where.occasion.contains).toBe('a'.repeat(1000));
    });
  });

  describe('getProducts - Extended', () => {
    const mockProducts = [
      { id: 'p1', name: 'Silk Saree', price: 1000, category: { id: 'c1', name: 'Silk' }, _count: { reviews: 5 } },
    ];

    it('handles empty product list', async () => {
      mockPrisma.$transaction.mockResolvedValue([0, []]);
      mockPrisma.review.groupBy.mockResolvedValue([]);
      const result = await ProductService.getProducts({}, {});
      expect(result.products).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.pages).toBe(0);
    });

    it('handles single product', async () => {
      mockPrisma.$transaction.mockResolvedValue([1, mockProducts]);
      mockPrisma.review.groupBy.mockResolvedValue([]);
      const result = await ProductService.getProducts({}, {});
      expect(result.products).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.pages).toBe(1);
    });

    it('handles many products', async () => {
      const products = Array.from({ length: 100 }, (_, i) => ({
        id: `p${i}`, name: `Product ${i}`, price: 100 + i, category: { id: 'c1', name: 'Silk' }, _count: { reviews: 0 },
      }));
      mockPrisma.$transaction.mockResolvedValue([100, products]);
      mockPrisma.review.groupBy.mockResolvedValue([]);
      const result = await ProductService.getProducts({}, { limit: 10 });
      expect(result.products).toHaveLength(100);
      expect(result.pages).toBe(10);
    });

    it('handles page 1', async () => {
      mockPrisma.$transaction.mockResolvedValue([10, mockProducts]);
      mockPrisma.review.groupBy.mockResolvedValue([]);
      await ProductService.getProducts({}, { page: 1, limit: 5 });
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 5 })
      );
    });

    it('handles page 2', async () => {
      mockPrisma.$transaction.mockResolvedValue([10, mockProducts]);
      mockPrisma.review.groupBy.mockResolvedValue([]);
      await ProductService.getProducts({}, { page: 2, limit: 5 });
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 })
      );
    });

    it('handles page 10', async () => {
      mockPrisma.$transaction.mockResolvedValue([100, mockProducts]);
      mockPrisma.review.groupBy.mockResolvedValue([]);
      await ProductService.getProducts({}, { page: 10, limit: 10 });
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 90, take: 10 })
      );
    });

    it('handles sortBy name', async () => {
      mockPrisma.$transaction.mockResolvedValue([1, mockProducts]);
      mockPrisma.review.groupBy.mockResolvedValue([]);
      await ProductService.getProducts({}, { sortBy: 'name', sortOrder: 'asc' });
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { name: 'asc' } })
      );
    });

    it('handles sortBy price desc', async () => {
      mockPrisma.$transaction.mockResolvedValue([1, mockProducts]);
      mockPrisma.review.groupBy.mockResolvedValue([]);
      await ProductService.getProducts({}, { sortBy: 'price', sortOrder: 'desc' });
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { price: 'desc' } })
      );
    });

    it('handles sortBy createdAt asc', async () => {
      mockPrisma.$transaction.mockResolvedValue([1, mockProducts]);
      mockPrisma.review.groupBy.mockResolvedValue([]);
      await ProductService.getProducts({}, { sortBy: 'createdAt', sortOrder: 'asc' });
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'asc' } })
      );
    });

    it('handles products without review stats', async () => {
      mockPrisma.$transaction.mockResolvedValue([1, mockProducts]);
      mockPrisma.review.groupBy.mockResolvedValue([]);
      const result = await ProductService.getProducts({}, {});
      expect(result.products[0].reviewStats).toBeUndefined();
    });

    it('handles products with zero reviews', async () => {
      mockPrisma.$transaction.mockResolvedValue([1, [{ ...mockProducts[0], _count: { reviews: 0 } }]]);
      mockPrisma.review.groupBy.mockResolvedValue([]);
      const result = await ProductService.getProducts({}, {});
      expect(result.products[0].reviewStats).toBeUndefined();
    });

    it('handles rounding avgRating', async () => {
      mockPrisma.$transaction.mockResolvedValue([1, mockProducts]);
      mockPrisma.review.groupBy.mockResolvedValue([{ productId: 'p1', _avg: { rating: 4.567 }, _count: { rating: 10 } }]);
      const result = await ProductService.getProducts({}, {});
      expect(result.products[0].reviewStats.avgRating).toBe(4.6);
    });

    it('handles avgRating of 5', async () => {
      mockPrisma.$transaction.mockResolvedValue([1, mockProducts]);
      mockPrisma.review.groupBy.mockResolvedValue([{ productId: 'p1', _avg: { rating: 5 }, _count: { rating: 100 } }]);
      const result = await ProductService.getProducts({}, {});
      expect(result.products[0].reviewStats.avgRating).toBe(5);
    });

    it('handles avgRating of 1', async () => {
      mockPrisma.$transaction.mockResolvedValue([1, mockProducts]);
      mockPrisma.review.groupBy.mockResolvedValue([{ productId: 'p1', _avg: { rating: 1 }, _count: { rating: 1 } }]);
      const result = await ProductService.getProducts({}, {});
      expect(result.products[0].reviewStats.avgRating).toBe(1);
    });

    it('handles large total count', async () => {
      mockPrisma.$transaction.mockResolvedValue([10000, mockProducts]);
      mockPrisma.review.groupBy.mockResolvedValue([]);
      const result = await ProductService.getProducts({}, { limit: 100 });
      expect(result.pages).toBe(100);
    });

    it('handles exact page multiple', async () => {
      mockPrisma.$transaction.mockResolvedValue([100, mockProducts]);
      mockPrisma.review.groupBy.mockResolvedValue([]);
      const result = await ProductService.getProducts({}, { limit: 10 });
      expect(result.pages).toBe(10);
    });

    it('handles page with remainder', async () => {
      mockPrisma.$transaction.mockResolvedValue([101, mockProducts]);
      mockPrisma.review.groupBy.mockResolvedValue([]);
      const result = await ProductService.getProducts({}, { limit: 10 });
      expect(result.pages).toBe(11);
    });

    it('handles limit of 1', async () => {
      mockPrisma.$transaction.mockResolvedValue([1, mockProducts]);
      mockPrisma.review.groupBy.mockResolvedValue([]);
      await ProductService.getProducts({}, { limit: 1 });
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 1 })
      );
    });

    it('handles limit of 1000', async () => {
      mockPrisma.$transaction.mockResolvedValue([1000, mockProducts]);
      mockPrisma.review.groupBy.mockResolvedValue([]);
      await ProductService.getProducts({}, { limit: 1000 });
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 1000 })
      );
    });
  });

  describe('getProductById - Extended', () => {
    const mockProduct = {
      id: 'p1', name: 'Banarasi Silk', price: 5000, stock: 10,
      category: { id: 'c1', name: 'Silk' }, reviews: [],
      _count: { reviews: 5, orderItems: 20, wishlistItems: 15 },
    };

    it('handles product with many reviews', async () => {
      const reviews = Array.from({ length: 20 }, (_, i) => ({ id: `r${i}`, rating: 5 }));
      mockPrisma.product.findUnique.mockResolvedValue({ ...mockProduct, reviews });
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 } });
      mockPrisma.review.count.mockResolvedValue(0);
      const result = await ProductService.getProductById('p1');
      expect(result.reviews).toHaveLength(20);
    });

    it('handles product with no reviews', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ ...mockProduct, reviews: [], _count: { reviews: 0, orderItems: 0, wishlistItems: 0 } });
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: null } });
      mockPrisma.review.count.mockResolvedValue(0);
      const result = await ProductService.getProductById('p1');
      expect(result.reviewStats.totalReviews).toBe(0);
    });

    it('handles product with many orders', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ ...mockProduct, _count: { reviews: 5, orderItems: 1000, wishlistItems: 500 } });
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 } });
      mockPrisma.review.count.mockResolvedValue(0);
      const result = await ProductService.getProductById('p1');
      expect(result.reviewStats.totalOrders).toBe(1000);
    });

    it('handles product with many wishlists', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ ...mockProduct, _count: { reviews: 5, orderItems: 20, wishlistItems: 1000 } });
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 } });
      mockPrisma.review.count.mockResolvedValue(0);
      const result = await ProductService.getProductById('p1');
      expect(result.reviewStats.totalWishlists).toBe(1000);
    });

    it('handles distribution with all zeros', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 0 } });
      mockPrisma.review.count.mockResolvedValue(0);
      const result = await ProductService.getProductById('p1');
      expect(result.reviewStats.distribution).toHaveLength(5);
      result.reviewStats.distribution.forEach(d => expect(d.count).toBe(0));
    });

    it('handles distribution with all 5-star reviews', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 5 } });
      mockPrisma.review.groupBy.mockResolvedValue([{ rating: 5, _count: { rating: 10 } }]);
      const result = await ProductService.getProductById('p1');
      expect(result.reviewStats.distribution[0].count).toBe(10);
    });

    it('handles product with null description', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ ...mockProduct, description: null });
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 } });
      mockPrisma.review.count.mockResolvedValue(0);
      const result = await ProductService.getProductById('p1');
      expect(result.description).toBeNull();
    });

    it('handles product with null fabric', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ ...mockProduct, fabric: null });
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 } });
      mockPrisma.review.count.mockResolvedValue(0);
      const result = await ProductService.getProductById('p1');
      expect(result.fabric).toBeNull();
    });

    it('handles product with null mrp', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ ...mockProduct, mrp: null });
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 } });
      mockPrisma.review.count.mockResolvedValue(0);
      const result = await ProductService.getProductById('p1');
      expect(result.mrp).toBeNull();
    });

    it('handles product with zero stock', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ ...mockProduct, stock: 0 });
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 } });
      mockPrisma.review.count.mockResolvedValue(0);
      const result = await ProductService.getProductById('p1');
      expect(result.stock).toBe(0);
    });

    it('handles product with unicode name', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ ...mockProduct, name: 'रेशम साड़ी' });
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 } });
      mockPrisma.review.count.mockResolvedValue(0);
      const result = await ProductService.getProductById('p1');
      expect(result.name).toBe('रेशम साड़ी');
    });

    it('handles product with many images', async () => {
      const images = Array.from({ length: 10 }, (_, i) => `img${i}.jpg`);
      mockPrisma.product.findUnique.mockResolvedValue({ ...mockProduct, images });
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 } });
      mockPrisma.review.count.mockResolvedValue(0);
      const result = await ProductService.getProductById('p1');
      expect(result.images).toHaveLength(10);
    });

    it('handles product with single image', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ ...mockProduct, images: ['img.jpg'] });
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 } });
      mockPrisma.review.count.mockResolvedValue(0);
      const result = await ProductService.getProductById('p1');
      expect(result.images).toHaveLength(1);
    });

    it('handles product with empty images array', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ ...mockProduct, images: [] });
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 } });
      mockPrisma.review.count.mockResolvedValue(0);
      const result = await ProductService.getProductById('p1');
      expect(result.images).toEqual([]);
    });
  });

  describe('createProduct - Extended', () => {
    const validData = {
      name: 'New Saree', color: 'Red', occasion: 'Wedding', price: 2999, stock: 50,
      categoryId: 'cat1', images: ['img1.jpg', 'img2.jpg'], userId: 'user1',
    };

    it('handles product with description', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat1' });
      mockPrisma.product.create.mockResolvedValue({ id: 'p1' });
      await ProductService.createProduct({ ...validData, description: 'Beautiful saree' });
      expect(mockPrisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ description: 'Beautiful saree' }) })
      );
    });

    it('handles product with fabric', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat1' });
      mockPrisma.product.create.mockResolvedValue({ id: 'p1' });
      await ProductService.createProduct({ ...validData, fabric: 'Silk' });
      expect(mockPrisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ fabric: 'Silk' }) })
      );
    });

    it('handles product with mrp', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat1' });
      mockPrisma.product.create.mockResolvedValue({ id: 'p1' });
      await ProductService.createProduct({ ...validData, mrp: 3999 });
      expect(mockPrisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ mrp: 3999 }) })
      );
    });

    it('handles product with single image', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat1' });
      mockPrisma.product.create.mockResolvedValue({ id: 'p1' });
      await ProductService.createProduct({ ...validData, images: ['img.jpg'] });
      expect(mockPrisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ images: ['img.jpg'] }) })
      );
    });

    it('handles product with many images', async () => {
      const images = Array.from({ length: 10 }, (_, i) => `img${i}.jpg`);
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat1' });
      mockPrisma.product.create.mockResolvedValue({ id: 'p1' });
      await ProductService.createProduct({ ...validData, images });
      expect(mockPrisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ images }) })
      );
    });

    it('handles product with zero stock', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat1' });
      mockPrisma.product.create.mockResolvedValue({ id: 'p1' });
      await ProductService.createProduct({ ...validData, stock: 0 });
      expect(mockPrisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ stock: 0 }) })
      );
    });

    it('handles product with unicode name', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat1' });
      mockPrisma.product.create.mockResolvedValue({ id: 'p1' });
      await ProductService.createProduct({ ...validData, name: 'रेशम साड़ी' });
      expect(mockPrisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ name: 'रेशम साड़ी' }) })
      );
    });

    it('handles product with decimal price', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat1' });
      mockPrisma.product.create.mockResolvedValue({ id: 'p1' });
      await ProductService.createProduct({ ...validData, price: 2999.99 });
      expect(mockPrisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ price: 2999.99 }) })
      );
    });

    it('handles product with large price', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat1' });
      mockPrisma.product.create.mockResolvedValue({ id: 'p1' });
      await ProductService.createProduct({ ...validData, price: 99999 });
      expect(mockPrisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ price: 99999 }) })
      );
    });

    it('handles product with large stock', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat1' });
      mockPrisma.product.create.mockResolvedValue({ id: 'p1' });
      await ProductService.createProduct({ ...validData, stock: 10000 });
      expect(mockPrisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ stock: 10000 }) })
      );
    });
  });

  describe('updateProduct - Extended', () => {
    const existing = { id: 'p1', name: 'Old', images: ['old.jpg'], price: 1000, stock: 10 };

    it('handles updating name', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(existing);
      mockPrisma.product.update.mockResolvedValue({ ...existing, name: 'New' });
      await ProductService.updateProduct('p1', { name: 'New' });
      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ name: 'New', images: ['old.jpg'] }) })
      );
    });

    it('handles updating price', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(existing);
      mockPrisma.product.update.mockResolvedValue({ ...existing, price: 2000 });
      await ProductService.updateProduct('p1', { price: 2000 });
      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ price: 2000, images: ['old.jpg'] }) })
      );
    });

    it('handles updating stock', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(existing);
      mockPrisma.product.update.mockResolvedValue({ ...existing, stock: 50 });
      await ProductService.updateProduct('p1', { stock: 50 });
      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ stock: 50, images: ['old.jpg'] }) })
      );
    });

    it('handles updating description', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(existing);
      mockPrisma.product.update.mockResolvedValue({ ...existing, description: 'New desc' });
      await ProductService.updateProduct('p1', { description: 'New desc' });
      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ description: 'New desc', images: ['old.jpg'] }) })
      );
    });

    it('handles updating fabric', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(existing);
      mockPrisma.product.update.mockResolvedValue({ ...existing, fabric: 'Silk' });
      await ProductService.updateProduct('p1', { fabric: 'Silk' });
      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ fabric: 'Silk', images: ['old.jpg'] }) })
      );
    });

    it('handles updating multiple fields', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(existing);
      mockPrisma.product.update.mockResolvedValue({ ...existing, name: 'New', price: 2000, stock: 50 });
      await ProductService.updateProduct('p1', { name: 'New', price: 2000, stock: 50 });
      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ name: 'New', price: 2000, stock: 50, images: ['old.jpg'] }) })
      );
    });

    it('handles updating to null description', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(existing);
      mockPrisma.product.update.mockResolvedValue({ ...existing, description: null });
      await ProductService.updateProduct('p1', { description: null });
      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ description: null, images: ['old.jpg'] }) })
      );
    });

    it('handles updating to null fabric', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(existing);
      mockPrisma.product.update.mockResolvedValue({ ...existing, fabric: null });
      await ProductService.updateProduct('p1', { fabric: null });
      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ fabric: null, images: ['old.jpg'] }) })
      );
    });

    it('handles updating images', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(existing);
      mockPrisma.product.update.mockResolvedValue({ ...existing, images: ['new1.jpg', 'new2.jpg'] });
      await ProductService.updateProduct('p1', { images: ['new1.jpg', 'new2.jpg'] });
      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ images: ['new1.jpg', 'new2.jpg'] }) })
      );
    });

    it('handles updating to empty images array', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(existing);
      mockPrisma.product.update.mockResolvedValue({ ...existing, images: [] });
      await ProductService.updateProduct('p1', { images: [] });
      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ images: [] }) })
      );
    });
  });

  describe('deleteProduct - Extended', () => {
    it('handles deleting product with no cart items', async () => {
      mockPrisma.orderItem.count.mockResolvedValue(0);
      mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.product.delete.mockResolvedValue({ id: 'p1' });
      await ProductService.deleteProduct('p1');
      expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { productId: 'p1' } });
    });

    it('handles deleting product with cart items', async () => {
      mockPrisma.orderItem.count.mockResolvedValue(0);
      mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 5 });
      mockPrisma.product.delete.mockResolvedValue({ id: 'p1' });
      await ProductService.deleteProduct('p1');
      expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { productId: 'p1' } });
    });

    it('handles deleting product with single order item', async () => {
      mockPrisma.orderItem.count.mockResolvedValue(1);
      await expect(ProductService.deleteProduct('p1')).rejects.toThrow('Cannot delete. Product in 1 orders.');
    });

    it('handles deleting product with many order items', async () => {
      mockPrisma.orderItem.count.mockResolvedValue(100);
      await expect(ProductService.deleteProduct('p1')).rejects.toThrow('Cannot delete. Product in 100 orders.');
    });

    it('handles deleting product with zero order items', async () => {
      mockPrisma.orderItem.count.mockResolvedValue(0);
      mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.product.delete.mockResolvedValue({ id: 'p1' });
      await expect(ProductService.deleteProduct('p1')).resolves.toBeUndefined();
    });
  });
});
