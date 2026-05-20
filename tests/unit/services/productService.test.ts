import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProductService } from '@/lib/services/productService';
import { NotFoundError, ConflictError } from '@/lib/errors';

// Mock Prisma - must be hoisted since vi.mock is hoisted
const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    product: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    category: {
      findUnique: vi.fn(),
    },
    review: {
      groupBy: vi.fn(),
      aggregate: vi.fn(),
      count: vi.fn(),
    },
    cartItem: {
      deleteMany: vi.fn(),
    },
    orderItem: {
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('@/app/lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('ProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── buildWhereClause (existing tests) ─────────────────
  describe('buildWhereClause', () => {
    it('should build where clause with non-objectId category name', () => {
      const filters = { categoryId: 'sarees' };
      const where = ProductService.buildWhereClause(filters);
      expect(where.category.name.equals).toBe('sarees');
      expect(where.category.name.mode).toBe('insensitive');
    });

    it('should build where clause with search filter', () => {
      const filters = { search: 'cotton' };
      const where = ProductService.buildWhereClause(filters);
      expect(where.OR).toBeDefined();
      expect(where.OR).toHaveLength(3);
    });

    it('should build where clause with price range', () => {
      const filters = { minPrice: 100, maxPrice: 1000 };
      const where = ProductService.buildWhereClause(filters);
      expect(where.price.gte).toBe(100);
      expect(where.price.lte).toBe(1000);
    });

    it('should build where clause with color filter', () => {
      const filters = { color: 'red' };
      const where = ProductService.buildWhereClause(filters);
      expect(where.color.contains).toBe('red');
    });

    it('should build where clause with ocassion filter', () => {
      const filters = { ocassion: 'wedding' };
      const where = ProductService.buildWhereClause(filters);
      expect(where.ocassion.contains).toBe('wedding');
    });

    it('should build empty where clause', () => {
      const filters = {};
      const where = ProductService.buildWhereClause(filters);
      expect(Object.keys(where)).toHaveLength(0);
    });

    it('should build where clause with special characters in search', () => {
      const filters = { search: "O'Reilly & Sons" };
      const where = ProductService.buildWhereClause(filters);
      expect(where.OR).toBeDefined();
    });

    it('should build where clause with unicode in search', () => {
      const filters = { search: 'साड़ी' };
      const where = ProductService.buildWhereClause(filters);
      expect(where.OR).toBeDefined();
    });

    it('should build where clause with zero price values', () => {
      const filters = { minPrice: 0, maxPrice: 0 };
      const where = ProductService.buildWhereClause(filters);
      expect(where.price.gte).toBe(0);
      expect(where.price.lte).toBe(0);
    });

    it('should build where clause with valid ObjectId categoryId', () => {
      const filters = { categoryId: '507f1f77bcf86cd799439011' };
      const where = ProductService.buildWhereClause(filters);
      expect(where.categoryId).toBe('507f1f77bcf86cd799439011');
      expect(where.category).toBeUndefined();
    });
  });

  // ─── getProducts ───────────────────────────────────────
  describe('getProducts', () => {
    const mockProducts = [
      {
        id: 'p1',
        name: 'Silk Saree',
        price: 1000,
        category: { id: 'c1', name: 'Silk' },
        _count: { reviews: 5 },
      },
      {
        id: 'p2',
        name: 'Cotton Saree',
        price: 500,
        category: { id: 'c2', name: 'Cotton' },
        _count: { reviews: 3 },
      },
    ];

    const mockReviewStats = [
      { productId: 'p1', _avg: { rating: 4.5 }, _count: { rating: 5 } },
      { productId: 'p2', _avg: { rating: 3.8 }, _count: { rating: 3 } },
    ];

    it('should return paginated products with defaults', async () => {
      mockPrisma.$transaction.mockResolvedValue([10, mockProducts]);
      mockPrisma.review.groupBy.mockResolvedValue(mockReviewStats);

      const result = await ProductService.getProducts({}, {});

      expect(result.total).toBe(10);
      expect(result.pages).toBe(1); // ceil(10/12)
      expect(result.products).toHaveLength(2);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should apply custom pagination', async () => {
      mockPrisma.$transaction.mockResolvedValue([5, [mockProducts[0]]]);
      mockPrisma.review.groupBy.mockResolvedValue([]);

      await ProductService.getProducts({}, { page: 2, limit: 5 });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        })
      );
    });

    it('should apply sorting', async () => {
      mockPrisma.$transaction.mockResolvedValue([1, mockProducts]);
      mockPrisma.review.groupBy.mockResolvedValue([]);

      await ProductService.getProducts({}, { sortBy: 'price', sortOrder: 'asc' });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { price: 'asc' },
        })
      );
    });

    it('should apply filters via buildWhereClause', async () => {
      mockPrisma.$transaction.mockResolvedValue([1, mockProducts]);
      mockPrisma.review.groupBy.mockResolvedValue([]);

      await ProductService.getProducts(
        { categoryId: 'sarees', minPrice: 100, maxPrice: 2000 },
        {}
      );

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: expect.any(Object),
            price: expect.any(Object),
          }),
        })
      );
    });

    it('should enrich products with review stats', async () => {
      mockPrisma.$transaction.mockResolvedValue([2, mockProducts]);
      mockPrisma.review.groupBy.mockResolvedValue(mockReviewStats);

      const result = await ProductService.getProducts({}, {});

      expect(result.products[0].reviewStats).toEqual({
        avgRating: 4.5,
        totalReviews: 5,
      });
      expect(result.products[1].reviewStats).toEqual({
        avgRating: 3.8,
        totalReviews: 3,
      });
    });

    it('should handle products with no reviews', async () => {
      const productsNoReviews = [
        { ...mockProducts[0], _count: { reviews: 0 } },
      ];
      mockPrisma.$transaction.mockResolvedValue([1, productsNoReviews]);
      mockPrisma.review.groupBy.mockResolvedValue([]);

      const result = await ProductService.getProducts({}, {});

      expect(result.products[0].reviewStats).toBeUndefined();
    });

    it('should return empty products when none match', async () => {
      mockPrisma.$transaction.mockResolvedValue([0, []]);
      mockPrisma.review.groupBy.mockResolvedValue([]);

      const result = await ProductService.getProducts({ search: 'nonexistent' }, {});

      expect(result.total).toBe(0);
      expect(result.pages).toBe(0);
      expect(result.products).toHaveLength(0);
    });

    it('should calculate pages correctly for various totals', async () => {
      mockPrisma.$transaction.mockResolvedValue([25, mockProducts]);
      mockPrisma.review.groupBy.mockResolvedValue([]);

      const result = await ProductService.getProducts({}, { limit: 10 });

      expect(result.pages).toBe(3); // ceil(25/10)
    });

    it('should round avgRating to 1 decimal place', async () => {
      mockPrisma.$transaction.mockResolvedValue([1, mockProducts]);
      mockPrisma.review.groupBy.mockResolvedValue([
        { productId: 'p1', _avg: { rating: 4.567 }, _count: { rating: 10 } },
      ]);

      const result = await ProductService.getProducts({}, {});

      expect(result.products[0].reviewStats.avgRating).toBe(4.6);
    });

    it('should use default page=1, limit=12, sortBy=createdAt, sortOrder=desc', async () => {
      mockPrisma.$transaction.mockResolvedValue([1, mockProducts]);
      mockPrisma.review.groupBy.mockResolvedValue([]);

      await ProductService.getProducts({}, {});

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 12,
          orderBy: { createdAt: 'desc' },
        })
      );
    });
  });

  // ─── getProductById ────────────────────────────────────
  describe('getProductById', () => {
    const mockProduct = {
      id: 'p1',
      name: 'Banarasi Silk',
      price: 5000,
      stock: 10,
      category: { id: 'c1', name: 'Silk' },
      reviews: [],
      _count: { reviews: 5, orderItems: 20, wishlistItems: 15 },
    };

    it('should return product with full details', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 } });
      mockPrisma.review.count.mockResolvedValue(2);

      const result = await ProductService.getProductById('p1');

      expect(result.id).toBe('p1');
      expect(result.name).toBe('Banarasi Silk');
      expect(result.category).toEqual({ id: 'c1', name: 'Silk' });
      expect(result.reviewStats.totalReviews).toBe(5);
      expect(result.reviewStats.totalOrders).toBe(20);
      expect(result.reviewStats.totalWishlists).toBe(15);
    });

    it('should throw NotFoundError when product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(ProductService.getProductById('nonexistent'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should calculate review distribution', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.0 } });
      mockPrisma.review.count
        .mockResolvedValueOnce(10) // 5 stars
        .mockResolvedValueOnce(5)  // 4 stars
        .mockResolvedValueOnce(2)  // 3 stars
        .mockResolvedValueOnce(1)  // 2 stars
        .mockResolvedValueOnce(0); // 1 star

      const result = await ProductService.getProductById('p1');

      expect(result.reviewStats.distribution).toHaveLength(5);
      expect(result.reviewStats.distribution[0]).toEqual({ stars: 5, count: 10 });
      expect(result.reviewStats.distribution[4]).toEqual({ stars: 1, count: 0 });
    });

    it('should handle product with zero avg rating', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: null } });
      mockPrisma.review.count.mockResolvedValue(0);

      const result = await ProductService.getProductById('p1');

      expect(result.reviewStats.avgRating).toBe(0);
    });

    it('should include approved reviews only', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.0 } });
      mockPrisma.review.count.mockResolvedValue(0);

      await ProductService.getProductById('p1');

      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'p1' },
        include: expect.objectContaining({
          reviews: expect.objectContaining({
            where: { isApproved: true },
          }),
        }),
      });
    });

    it('should limit reviews to 20', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.0 } });
      mockPrisma.review.count.mockResolvedValue(0);

      await ProductService.getProductById('p1');

      const include = mockPrisma.product.findUnique.mock.calls[0][0].include;
      expect(include.reviews.take).toBe(20);
    });

    it('should order reviews by createdAt desc', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.0 } });
      mockPrisma.review.count.mockResolvedValue(0);

      await ProductService.getProductById('p1');

      const include = mockPrisma.product.findUnique.mock.calls[0][0].include;
      expect(include.reviews.orderBy).toEqual({ createdAt: 'desc' });
    });
  });

  // ─── createProduct ─────────────────────────────────────
  describe('createProduct', () => {
    const validProductData = {
      name: 'New Silk Saree',
      color: 'Red',
      ocassion: 'Wedding',
      price: 2999,
      stock: 50,
      categoryId: 'cat1',
      images: ['img1.jpg', 'img2.jpg'],
      userId: 'user1',
    };

    it('should create product successfully', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat1', name: 'Silk' });
      mockPrisma.product.create.mockResolvedValue({ ...validProductData, id: 'p1' });

      const result = await ProductService.createProduct(validProductData);

      expect(result.id).toBe('p1');
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: {
          name: 'New Silk Saree',
          description: null,
          color: 'Red',
          fabric: null,
          ocassion: 'Wedding',
          price: 2999,
          mrp: null,
          stock: 50,
          categoryId: 'cat1',
          images: ['img1.jpg', 'img2.jpg'],
          userId: 'user1',
        },
      });
    });

    it('should throw NotFoundError when category does not exist', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      await expect(ProductService.createProduct(validProductData))
        .rejects
        .toThrow(NotFoundError);

      expect(mockPrisma.product.create).not.toHaveBeenCalled();
    });

    it('should include optional description and fabric', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat1', name: 'Silk' });
      mockPrisma.product.create.mockResolvedValue({ ...validProductData, id: 'p1' });

      await ProductService.createProduct({
        ...validProductData,
        description: 'Beautiful silk saree',
        fabric: 'Silk',
        mrp: 3999,
      });

      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          description: 'Beautiful silk saree',
          fabric: 'Silk',
          mrp: 3999,
        }),
      });
    });

    it('should validate category before creating product', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat1', name: 'Silk' });
      mockPrisma.product.create.mockResolvedValue({ ...validProductData, id: 'p1' });

      await ProductService.createProduct(validProductData);

      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat1' },
      });
      expect(mockPrisma.category.findUnique).toHaveBeenCalledBefore(mockPrisma.product.create);
    });
  });

  // ─── updateProduct ─────────────────────────────────────
  describe('updateProduct', () => {
    const existingProduct = {
      id: 'p1',
      name: 'Old Name',
      images: ['old.jpg'],
      price: 1000,
    };

    it('should update product successfully', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(existingProduct);
      mockPrisma.product.update.mockResolvedValue({
        ...existingProduct,
        name: 'New Name',
      });

      const result = await ProductService.updateProduct('p1', { name: 'New Name' });

      expect(result.name).toBe('New Name');
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { name: 'New Name', images: ['old.jpg'] },
      });
    });

    it('should throw NotFoundError when product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(ProductService.updateProduct('nonexistent', { name: 'New' }))
        .rejects
        .toThrow(NotFoundError);

      expect(mockPrisma.product.update).not.toHaveBeenCalled();
    });

    it('should fallback to existing images when not provided', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(existingProduct);
      mockPrisma.product.update.mockResolvedValue(existingProduct);

      await ProductService.updateProduct('p1', { price: 1500 });

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { price: 1500, images: ['old.jpg'] },
      });
    });

    it('should use new images when provided', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(existingProduct);
      mockPrisma.product.update.mockResolvedValue({
        ...existingProduct,
        images: ['new1.jpg', 'new2.jpg'],
      });

      await ProductService.updateProduct('p1', {
        images: ['new1.jpg', 'new2.jpg'],
      });

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { images: ['new1.jpg', 'new2.jpg'] },
      });
    });

    it('should handle partial update with multiple fields', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(existingProduct);
      mockPrisma.product.update.mockResolvedValue({
        ...existingProduct,
        name: 'Updated',
        price: 2000,
        stock: 100,
      });

      await ProductService.updateProduct('p1', {
        name: 'Updated',
        price: 2000,
        stock: 100,
      });

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: {
          name: 'Updated',
          price: 2000,
          stock: 100,
          images: ['old.jpg'],
        },
      });
    });
  });

  // ─── deleteProduct ─────────────────────────────────────
  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      mockPrisma.orderItem.count.mockResolvedValue(0);
      mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.product.delete.mockResolvedValue({ id: 'p1' });

      await ProductService.deleteProduct('p1');

      expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { productId: 'p1' },
      });
      expect(mockPrisma.product.delete).toHaveBeenCalledWith({
        where: { id: 'p1' },
      });
    });

    it('should throw ConflictError when product is in orders', async () => {
      mockPrisma.orderItem.count.mockResolvedValue(3);

      await expect(ProductService.deleteProduct('p1'))
        .rejects
        .toThrow(ConflictError);

      await expect(ProductService.deleteProduct('p1'))
        .rejects
        .toThrow('Cannot delete. Product in 3 orders.');

      expect(mockPrisma.product.delete).not.toHaveBeenCalled();
    });

    it('should clean up cart items before deleting product', async () => {
      mockPrisma.orderItem.count.mockResolvedValue(0);
      mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.product.delete.mockResolvedValue({ id: 'p1' });

      await ProductService.deleteProduct('p1');

      const order = mockPrisma.cartItem.deleteMany.mock.invocationCallOrder[0];
      const deleteOrder = mockPrisma.product.delete.mock.invocationCallOrder[0];
      expect(order).toBeLessThan(deleteOrder);
    });

    it('should delete product with zero cart items', async () => {
      mockPrisma.orderItem.count.mockResolvedValue(0);
      mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.product.delete.mockResolvedValue({ id: 'p1' });

      await expect(ProductService.deleteProduct('p1')).resolves.toBeUndefined();
    });
  });

  // ─── Security & Edge Cases ─────────────────────────────
  describe('Security Edge Cases', () => {
    it('should not expose internal structure', () => {
      const filters = {
        categoryId: 'test',
        search: 'test',
        minPrice: 100,
        maxPrice: 1000,
      };
      const where = ProductService.buildWhereClause(filters);
      expect(typeof where).toBe('object');
      expect(where).not.toBeNull();
    });

    it('should handle prototype pollution attempt gracefully', () => {
      const maliciousFilter = JSON.parse('{"__proto__":{"polluted":true},"categoryId":"test"}');
      const where = ProductService.buildWhereClause(maliciousFilter as any);
      expect(({} as any).polluted).toBeUndefined();
    });

    it('should handle XSS attempt in search', () => {
      const xssAttempt = '<script>alert("xss")</script>';
      const filters = { search: xssAttempt };
      const where = ProductService.buildWhereClause(filters);
      expect(where.OR).toBeDefined();
    });

    it('should handle SQL injection attempt in categoryId', () => {
      const sqlInjection = "1'; DROP TABLE products; --";
      const filters = { categoryId: sqlInjection };
      const where = ProductService.buildWhereClause(filters);
      expect(where.category).toBeDefined();
      expect(where.category.name.equals).toBe(sqlInjection);
    });

    it('should handle very long search string', () => {
      const longSearch = 'a'.repeat(1000);
      const filters = { search: longSearch };
      const where = ProductService.buildWhereClause(filters);
      expect(where.OR).toBeDefined();
      expect(where.OR[0].name.contains).toBe(longSearch);
    });

    it('should handle empty string search', () => {
      const filters = { search: '' };
      const where = ProductService.buildWhereClause(filters);
      expect(where.OR).toBeUndefined();
    });

    it('should handle negative price range', () => {
      const filters = { minPrice: -100, maxPrice: -10 };
      const where = ProductService.buildWhereClause(filters);
      expect(where.price.gte).toBe(-100);
      expect(where.price.lte).toBe(-10);
    });

    it('should handle only minPrice', () => {
      const filters = { minPrice: 100 };
      const where = ProductService.buildWhereClause(filters);
      expect(where.price.gte).toBe(100);
      expect(where.price.lte).toBeUndefined();
    });

    it('should handle only maxPrice', () => {
      const filters = { maxPrice: 1000 };
      const where = ProductService.buildWhereClause(filters);
      expect(where.price.lte).toBe(1000);
      expect(where.price.gte).toBeUndefined();
    });
  });
});
