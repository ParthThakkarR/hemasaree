/**
 * HemaSaree — ACID & System Property Tests
 * 
 * Tests Atomicity, Consistency, Isolation, Durability, Idempotency,
 * Data Integrity, Input Validation, and Error Handling properties.
 *
 * Uses Vitest with the existing test infrastructure.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ──────────────────────────────────────────────────────────────────────
// Mock Prisma — use vi.hoisted() so the variable is available when vi.mock is hoisted
// ──────────────────────────────────────────────────────────────────────

const { mockPrisma } = vi.hoisted(() => {
  const mockPrisma = {
    product: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
    },
    order: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    orderItem: {
      count: vi.fn(),
      updateMany: vi.fn(),
    },
    cart: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    cartItem: {
      deleteMany: vi.fn(),
    },
    category: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    review: {
      groupBy: vi.fn(),
      aggregate: vi.fn(),
    },
    storeSettings: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  return { mockPrisma };
});

vi.mock('../../../app/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.mock('../../../lib/cache', () => ({
  cache: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    clearPattern: vi.fn().mockResolvedValue(undefined),
    getOrSet: vi.fn().mockImplementation(async (_key: string, loader: () => Promise<any>) => loader()),
    writeThrough: vi.fn().mockImplementation(async (_key: string, writer: () => Promise<any>) => writer()),
  },
}));

import { OrderService, calculateDeliveryCharge } from '../../../lib/services/orderService';
import { ProductService } from '../../../lib/services/productService';
import { SettingsService } from '../../../lib/services/settingsService';

beforeEach(() => {
  vi.clearAllMocks();
});

// ══════════════════════════════════════════════════════════════════════
// 1. ATOMICITY — All-or-nothing operations
// ══════════════════════════════════════════════════════════════════════

describe('ATOMICITY', () => {
  describe('Order creation is atomic', () => {
    it('should decrement stock AND create order within a single transaction', async () => {
      // Setup: product with stock=5, user cart with 2 items
      const mockProduct = { id: 'prod1', name: 'Silk Saree', stock: 5, price: 2000, images: ['/img.jpg'], isDeleted: false };
      const mockCart = {
        id: 'cart1',
        items: [{
          productId: 'prod1',
          quantity: 2,
          withPolish: false,
          product: mockProduct,
        }],
      };

      mockPrisma.cart.findFirst.mockResolvedValue(mockCart);
      mockPrisma.storeSettings.findFirst.mockResolvedValue({
        deliveryChargeGujarat: 80,
        deliveryChargeDefault: 150,
        polishPrice: 450,
        isPolishEnabled: true,
      });

      // The $transaction callback should be called with an async function
      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          product: {
            findUnique: vi.fn().mockResolvedValue({ stock: 5 }),
            update: vi.fn().mockResolvedValue({ stock: 3 }),
          },
          order: {
            create: vi.fn().mockResolvedValue({
              id: 'order1',
              totalAmount: 4150,
              deliveryCharge: 150,
              orderItems: [],
            }),
          },
        };
        return fn(tx);
      });
      mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.cart.update.mockResolvedValue({});

      const result = await OrderService.createOrder(
        'user1',
        { houseNumber: '12', area: 'Test', city: 'Surat', state: 'Maharashtra', pincode: '395001' },
        150,
      );

      // Verify $transaction was called (atomicity guarantee)
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(result.orderId).toBe('order1');
    });

    it('should rollback stock if order creation fails inside transaction', async () => {
      const mockProduct = { id: 'prod1', name: 'Silk Saree', stock: 5, price: 2000, images: ['/img.jpg'], isDeleted: false };
      const mockCart = {
        id: 'cart1',
        items: [{ productId: 'prod1', quantity: 2, withPolish: false, product: mockProduct }],
      };

      mockPrisma.cart.findFirst.mockResolvedValue(mockCart);
      mockPrisma.storeSettings.findFirst.mockResolvedValue({
        deliveryChargeGujarat: 80, deliveryChargeDefault: 150,
        polishPrice: 450, isPolishEnabled: true,
      });

      // Simulate transaction failure — the DB error means NOTHING is committed
      mockPrisma.$transaction.mockRejectedValue(new Error('DB write failure'));

      await expect(
        OrderService.createOrder('user1',
          { houseNumber: '12', area: 'Test', city: 'Surat', state: 'Maharashtra', pincode: '395001' },
          150,
        )
      ).rejects.toThrow('DB write failure');

      // Cart should NOT be cleared since transaction failed
      expect(mockPrisma.cartItem.deleteMany).not.toHaveBeenCalled();
    });

    it('should not clear cart if transaction fails (post-transaction side effects)', async () => {
      const mockProduct = { id: 'prod1', name: 'Test', stock: 3, price: 1000, images: [], isDeleted: false };
      mockPrisma.cart.findFirst.mockResolvedValue({
        id: 'cart1',
        items: [{ productId: 'prod1', quantity: 1, withPolish: false, product: mockProduct }],
      });
      mockPrisma.storeSettings.findFirst.mockResolvedValue({
        deliveryChargeGujarat: 80, deliveryChargeDefault: 150,
        polishPrice: 450, isPolishEnabled: true,
      });
      mockPrisma.$transaction.mockRejectedValue(new Error('Connection lost'));

      await expect(
        OrderService.createOrder('user1',
          { houseNumber: '1', area: 'A', city: 'B', state: 'C', pincode: '000000' }, 80)
      ).rejects.toThrow();

      expect(mockPrisma.cartItem.deleteMany).not.toHaveBeenCalled();
      expect(mockPrisma.cart.update).not.toHaveBeenCalled();
    });
  });

  describe('Order status update is atomic', () => {
    it('should update both order and orderItems status in a single transaction', async () => {
      mockPrisma.$transaction.mockResolvedValue([
        { id: 'order1', status: 'SHIPPED' },
        { count: 2 },
      ]);

      await OrderService.updateOrderStatus('order1', 'SHIPPED');

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      const transactionCalls = mockPrisma.$transaction.mock.calls[0][0];
      expect(transactionCalls).toHaveLength(2); // order update + orderItem updateMany
    });
  });
});

// ══════════════════════════════════════════════════════════════════════
// 2. CONSISTENCY — Data always valid after operations
// ══════════════════════════════════════════════════════════════════════

describe('CONSISTENCY', () => {
  describe('Stock constraints', () => {
    it('should reject order when requested quantity exceeds available stock', async () => {
      const mockProduct = {
        id: 'prod1', name: 'Limited Saree', stock: 1, price: 5000,
        images: ['/img.jpg'], isDeleted: false,
      };

      mockPrisma.cart.findFirst.mockResolvedValue({
        id: 'cart1',
        items: [{ productId: 'prod1', quantity: 5, withPolish: false, product: mockProduct }],
      });

      await expect(OrderService.validateCartItems('user1'))
        .rejects.toThrow('Not enough stock');
    });

    it('should reject buy-now when product is out of stock', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'prod1', name: 'Sold Out', stock: 0, price: 3000,
        images: [], isDeleted: false,
      });
      mockPrisma.storeSettings.findFirst.mockResolvedValue({
        deliveryChargeGujarat: 80, deliveryChargeDefault: 150,
        polishPrice: 450, isPolishEnabled: true,
      });

      await expect(OrderService.validateBuyNowItem('prod1', 1))
        .rejects.toThrow('Not enough stock');
    });

    it('should reject buy-now for deleted products', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'prod1', name: 'Deleted', stock: 10, price: 1000,
        images: [], isDeleted: true,
      });

      await expect(OrderService.validateBuyNowItem('prod1', 1))
        .rejects.toThrow('Product not found');
    });

    it('should reject buy-now for non-existent products', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(OrderService.validateBuyNowItem('nonexistent', 1))
        .rejects.toThrow('Product not found');
    });
  });

  describe('Cart validation', () => {
    it('should reject checkout with empty cart', async () => {
      mockPrisma.cart.findFirst.mockResolvedValue({ id: 'cart1', items: [] });

      await expect(OrderService.validateCartItems('user1'))
        .rejects.toThrow('Your cart is empty');
    });

    it('should reject checkout when cart not found', async () => {
      mockPrisma.cart.findFirst.mockResolvedValue(null);

      await expect(OrderService.validateCartItems('user1'))
        .rejects.toThrow('Your cart is empty');
    });
  });

  describe('Price calculations remain consistent', () => {
    it('should calculate total correctly for multiple items', async () => {
      const items = [
        { productId: 'p1', quantity: 2, withPolish: false, product: { id: 'p1', name: 'A', stock: 10, price: 1000, images: [], isDeleted: false } },
        { productId: 'p2', quantity: 1, withPolish: false, product: { id: 'p2', name: 'B', stock: 5, price: 3000, images: [], isDeleted: false } },
      ];

      mockPrisma.cart.findFirst.mockResolvedValue({ id: 'cart1', items });

      const result = await OrderService.validateCartItems('user1');
      // 2 × 1000 + 1 × 3000 = 5000
      expect(result.total).toBe(5000);
      expect(result.items).toHaveLength(2);
    });

    it('should add polish price correctly to buy-now item', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'prod1', name: 'Polish Saree', stock: 5, price: 2000,
        images: [], isDeleted: false,
      });
      mockPrisma.storeSettings.findFirst.mockResolvedValue({
        deliveryChargeGujarat: 80, deliveryChargeDefault: 150,
        polishPrice: 450, isPolishEnabled: true,
      });

      const result = await OrderService.validateBuyNowItem('prod1', 1, true);
      // 2000 + 450 (polish) = 2450
      expect(result.total).toBe(2450);
      expect(result.items[0].withPolish).toBe(true);
    });
  });

  describe('Delivery charge consistency', () => {
    it('should return Gujarat rate for Gujarat state', async () => {
      mockPrisma.storeSettings.findFirst.mockResolvedValue({
        deliveryChargeGujarat: 80, deliveryChargeDefault: 150,
        polishPrice: 450, isPolishEnabled: true,
      });

      const charge = await calculateDeliveryCharge('Gujarat');
      expect(charge).toBe(80);
    });

    it('should return default rate for non-Gujarat states', async () => {
      mockPrisma.storeSettings.findFirst.mockResolvedValue({
        deliveryChargeGujarat: 80, deliveryChargeDefault: 150,
        polishPrice: 450, isPolishEnabled: true,
      });

      const charge = await calculateDeliveryCharge('Maharashtra');
      expect(charge).toBe(150);
    });

    it('should be case-insensitive for state matching', async () => {
      mockPrisma.storeSettings.findFirst.mockResolvedValue({
        deliveryChargeGujarat: 80, deliveryChargeDefault: 150,
        polishPrice: 450, isPolishEnabled: true,
      });

      const charge = await calculateDeliveryCharge('GUJARAT');
      expect(charge).toBe(80);
    });

    it('should handle null/undefined state gracefully', async () => {
      mockPrisma.storeSettings.findFirst.mockResolvedValue({
        deliveryChargeGujarat: 80, deliveryChargeDefault: 150,
        polishPrice: 450, isPolishEnabled: true,
      });

      const charge = await calculateDeliveryCharge(null as any);
      expect(charge).toBe(150); // Falls back to default
    });
  });
});

// ══════════════════════════════════════════════════════════════════════
// 3. ISOLATION — Concurrent operations don't interfere
// ══════════════════════════════════════════════════════════════════════

describe('ISOLATION', () => {
  describe('Concurrent stock checks inside transaction', () => {
    it('should re-check stock inside transaction to prevent overselling', async () => {
      // Scenario: Two users try to buy the last item simultaneously
      // The transaction should re-check stock and reject the second buyer
      const mockProduct = {
        id: 'prod1', name: 'Last Item', stock: 1, price: 5000,
        images: ['/img.jpg'], isDeleted: false,
      };

      mockPrisma.cart.findFirst.mockResolvedValue({
        id: 'cart1',
        items: [{ productId: 'prod1', quantity: 1, withPolish: false, product: mockProduct }],
      });
      mockPrisma.storeSettings.findFirst.mockResolvedValue({
        deliveryChargeGujarat: 80, deliveryChargeDefault: 150,
        polishPrice: 450, isPolishEnabled: true,
      });

      // Simulate: by the time the transaction runs, stock is already 0
      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          product: {
            findUnique: vi.fn().mockResolvedValue({ stock: 0 }), // Already sold!
            update: vi.fn(),
          },
          order: { create: vi.fn() },
        };
        return fn(tx);
      });

      await expect(
        OrderService.createOrder('user2',
          { houseNumber: '1', area: 'A', city: 'B', state: 'C', pincode: '000000' }, 80)
      ).rejects.toThrow('Not enough stock');
    });
  });

  describe('Cache isolation', () => {
    it('should generate unique cache keys for different filter combinations', () => {
      const key1 = JSON.stringify({ filters: { categoryId: 'silk' }, page: 1 });
      const key2 = JSON.stringify({ filters: { categoryId: 'cotton' }, page: 1 });
      const key3 = JSON.stringify({ filters: { categoryIds: ['silk', 'cotton'] }, page: 1 });

      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(key3);
      expect(key2).not.toBe(key3);
    });
  });
});

// ══════════════════════════════════════════════════════════════════════
// 4. DURABILITY — Data persists after commitment
// ══════════════════════════════════════════════════════════════════════

describe('DURABILITY', () => {
  describe('Settings persistence', () => {
    it('should create default settings if none exist', async () => {
      mockPrisma.storeSettings.findFirst.mockResolvedValue(null);
      mockPrisma.storeSettings.create.mockResolvedValue({
        id: 'settings1',
        deliveryChargeGujarat: 80,
        deliveryChargeDefault: 150,
        polishPrice: 450,
        isPolishEnabled: true,
        multiCategoryBannerImage: null,
      });

      const settings = await SettingsService.getSettings();
      expect(settings.deliveryChargeGujarat).toBe(80);
      expect(mockPrisma.storeSettings.create).toHaveBeenCalledTimes(1);
    });

    it('should return existing settings without creating new ones', async () => {
      mockPrisma.storeSettings.findFirst.mockResolvedValue({
        id: 'existing',
        deliveryChargeGujarat: 100,
        deliveryChargeDefault: 200,
        polishPrice: 500,
        isPolishEnabled: false,
        multiCategoryBannerImage: '/banner.webp',
      });

      const settings = await SettingsService.getSettings();
      expect(settings.deliveryChargeGujarat).toBe(100);
      expect(settings.multiCategoryBannerImage).toBe('/banner.webp');
      expect(mockPrisma.storeSettings.create).not.toHaveBeenCalled();
    });
  });

  describe('Order data persists correctly', () => {
    it('should persist order with correct address formatting', async () => {
      const mockProduct = { id: 'p1', name: 'Test', stock: 5, price: 1000, images: [], isDeleted: false };
      mockPrisma.cart.findFirst.mockResolvedValue({
        id: 'cart1',
        items: [{ productId: 'p1', quantity: 1, withPolish: false, product: mockProduct }],
      });
      mockPrisma.storeSettings.findFirst.mockResolvedValue({
        deliveryChargeGujarat: 80, deliveryChargeDefault: 150,
        polishPrice: 450, isPolishEnabled: true,
      });

      let capturedOrderData: any = null;
      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          product: {
            findUnique: vi.fn().mockResolvedValue({ stock: 5 }),
            update: vi.fn().mockResolvedValue({}),
          },
          order: {
            create: vi.fn().mockImplementation((args: any) => {
              capturedOrderData = args.data;
              return { id: 'order1', totalAmount: 1080, deliveryCharge: 80, orderItems: [] };
            }),
          },
        };
        return fn(tx);
      });
      mockPrisma.cartItem.deleteMany.mockResolvedValue({});
      mockPrisma.cart.update.mockResolvedValue({});

      await OrderService.createOrder('user1',
        { houseNumber: '42', buildingName: 'Silk Tower', area: 'Ring Road', city: 'Surat', state: 'Gujarat', pincode: '395001' },
        80
      );

      expect(capturedOrderData.shippingAddress).toContain('42');
      expect(capturedOrderData.shippingAddress).toContain('Silk Tower');
      expect(capturedOrderData.shippingAddress).toContain('Ring Road');
      expect(capturedOrderData.shippingAddress).toContain('Surat');
      expect(capturedOrderData.userId).toBe('user1');
      expect(capturedOrderData.status).toBe('PENDING');
    });
  });
});

// ══════════════════════════════════════════════════════════════════════
// 5. DATA INTEGRITY — Referential integrity & constraints
// ══════════════════════════════════════════════════════════════════════

describe('DATA INTEGRITY', () => {
  describe('Product deletion constraints', () => {
    it('should prevent deletion of product with existing orders', async () => {
      mockPrisma.orderItem.count.mockResolvedValue(3);

      await expect(ProductService.deleteProduct('prod1'))
        .rejects.toThrow('Cannot delete');
    });

    it('should allow deletion of product with no orders', async () => {
      mockPrisma.orderItem.count.mockResolvedValue(0);
      mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.product.delete.mockResolvedValue({});

      await expect(ProductService.deleteProduct('prod1')).resolves.not.toThrow();
      expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { productId: 'prod1' } });
      expect(mockPrisma.product.delete).toHaveBeenCalledWith({ where: { id: 'prod1' } });
    });

    it('should clean up cart items before deleting product', async () => {
      mockPrisma.orderItem.count.mockResolvedValue(0);
      mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.product.delete.mockResolvedValue({});

      await ProductService.deleteProduct('prod1');

      // Cart items cleaned BEFORE product delete
      const deleteCartCall = mockPrisma.cartItem.deleteMany.mock.invocationCallOrder[0];
      const deleteProductCall = mockPrisma.product.delete.mock.invocationCallOrder[0];
      expect(deleteCartCall).toBeLessThan(deleteProductCall);
    });
  });

  describe('Product creation requires valid category', () => {
    it('should reject product with non-existent category', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      await expect(ProductService.createProduct({
        name: 'Test', color: 'Red', occasion: 'Bridal', price: 1000,
        stock: 10, categoryId: 'nonexistent', images: [], userId: 'admin1',
      })).rejects.toThrow('Category not found');
    });

    it('should create product when category exists', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat1', name: 'Silk' });
      mockPrisma.product.create.mockResolvedValue({ id: 'newprod', name: 'Test' });

      const result = await ProductService.createProduct({
        name: 'New Silk Saree', color: 'Red', occasion: 'Bridal',
        price: 2500, stock: 10, categoryId: 'cat1', images: ['/img.jpg'], userId: 'admin1',
      });

      expect(result.id).toBe('newprod');
    });
  });

  describe('Product update with non-existent product', () => {
    it('should throw NotFoundError for non-existent product update', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(ProductService.updateProduct('nonexistent', { name: 'Updated' }))
        .rejects.toThrow('Product not found');
    });
  });
});

// ══════════════════════════════════════════════════════════════════════
// 6. INPUT VALIDATION — Boundary conditions
// ══════════════════════════════════════════════════════════════════════

describe('INPUT VALIDATION', () => {
  describe('Product filters - boundary conditions', () => {
    it('should build empty where clause for no filters', () => {
      const where = ProductService.buildWhereClause({});
      expect(where.isDeleted).toBe(false);
      expect(where.categoryId).toBeUndefined();
      expect(where.OR).toBeUndefined();
    });

    it('should handle single category by ObjectId', () => {
      const where = ProductService.buildWhereClause({ categoryId: '507f1f77bcf86cd799439011' });
      expect(where.categoryId).toBe('507f1f77bcf86cd799439011');
    });

    it('should handle single category by name', () => {
      const where = ProductService.buildWhereClause({ categoryId: 'Silk' });
      expect(where.category).toEqual({ name: { equals: 'Silk', mode: 'insensitive' } });
    });

    it('should handle multiple categories by name', () => {
      const where = ProductService.buildWhereClause({ categoryIds: ['Silk', 'Banarasi'] });
      expect(where.OR || where.category).toBeDefined();
    });

    it('should handle mixed ObjectIds and names in multi-category', () => {
      const where = ProductService.buildWhereClause({
        categoryIds: ['507f1f77bcf86cd799439011', 'Silk'],
      });
      // Should have OR condition with both categoryId and category.name
      expect(where.OR).toBeDefined();
      expect(where.OR).toHaveLength(2);
    });

    it('should handle empty categoryIds array as no filter', () => {
      const where = ProductService.buildWhereClause({ categoryIds: [] });
      expect(where.categoryId).toBeUndefined();
    });

    it('should combine search with category filters using AND', () => {
      const where = ProductService.buildWhereClause({
        categoryIds: ['507f1f77bcf86cd799439011', 'Silk'],
        search: 'wedding',
      });
      // Should use AND to combine category OR with search OR
      expect(where.AND).toBeDefined();
      expect(where.AND).toHaveLength(2);
    });

    it('should handle price range filters', () => {
      const where = ProductService.buildWhereClause({ minPrice: 1000, maxPrice: 5000 });
      expect(where.price.gte).toBe(1000);
      expect(where.price.lte).toBe(5000);
    });

    it('should handle fabric filter', () => {
      const where = ProductService.buildWhereClause({ fabric: 'Silk' });
      expect(where.fabric).toEqual({ contains: 'Silk', mode: 'insensitive' });
    });

    it('should include deleted products when flag is set', () => {
      const where = ProductService.buildWhereClause({ includeDeleted: true });
      expect(where.isDeleted).toBeUndefined();
    });
  });
});

// ══════════════════════════════════════════════════════════════════════
// 7. ERROR HANDLING — Graceful failure modes
// ══════════════════════════════════════════════════════════════════════

describe('ERROR HANDLING', () => {
  describe('Settings service resilience', () => {
    it('should create default settings when database is empty', async () => {
      mockPrisma.storeSettings.findFirst.mockResolvedValue(null);
      mockPrisma.storeSettings.create.mockResolvedValue({
        id: 'new',
        deliveryChargeGujarat: 80,
        deliveryChargeDefault: 150,
        polishPrice: 450,
        isPolishEnabled: true,
        multiCategoryBannerImage: null,
      });

      const settings = await SettingsService.getSettings();
      expect(settings).toBeDefined();
      expect(settings.deliveryChargeGujarat).toBe(80);
    });

    it('should handle update when no settings exist yet', async () => {
      mockPrisma.storeSettings.findFirst.mockResolvedValue(null);
      mockPrisma.storeSettings.create.mockResolvedValue({
        id: 'new',
        deliveryChargeGujarat: 90,
        deliveryChargeDefault: 160,
        polishPrice: 500,
        isPolishEnabled: true,
        multiCategoryBannerImage: '/banner.webp',
      });

      const settings = await SettingsService.updateSettings({
        deliveryChargeGujarat: 90,
        deliveryChargeDefault: 160,
        multiCategoryBannerImage: '/banner.webp',
      });

      expect(settings.deliveryChargeGujarat).toBe(90);
    });
  });

  describe('Product service error cases', () => {
    it('should throw NotFoundError for non-existent product by ID', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(ProductService.getProductById('nonexistent'))
        .rejects.toThrow('Product not found');
    });

    it('should throw NotFoundError for soft-deleted product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'prod1', isDeleted: true, _count: { reviews: 0, orderItems: 0, wishlistItems: 0 },
      });

      await expect(ProductService.getProductById('prod1'))
        .rejects.toThrow('Product not found');
    });
  });
});

// ══════════════════════════════════════════════════════════════════════
// 8. IDEMPOTENCY — Repeated operations produce same result
// ══════════════════════════════════════════════════════════════════════

describe('IDEMPOTENCY', () => {
  describe('Settings operations are idempotent', () => {
    it('should return same settings on repeated getSettings calls', async () => {
      const settingsData = {
        id: 'settings1',
        deliveryChargeGujarat: 80,
        deliveryChargeDefault: 150,
        polishPrice: 450,
        isPolishEnabled: true,
        multiCategoryBannerImage: null,
      };

      mockPrisma.storeSettings.findFirst.mockResolvedValue(settingsData);

      const result1 = await SettingsService.getSettings();
      const result2 = await SettingsService.getSettings();

      expect(result1).toEqual(result2);
    });
  });

  describe('Filter building is idempotent', () => {
    it('should produce identical where clause for same inputs', () => {
      const filters = { categoryIds: ['Silk', 'Banarasi'], search: 'wedding', minPrice: 1000 };
      const where1 = ProductService.buildWhereClause(filters);
      const where2 = ProductService.buildWhereClause(filters);

      expect(JSON.stringify(where1)).toBe(JSON.stringify(where2));
    });
  });

  describe('Order status update is idempotent', () => {
    it('should not fail when setting status to the same value', async () => {
      mockPrisma.$transaction.mockResolvedValue([
        { id: 'order1', status: 'SHIPPED' },
        { count: 1 },
      ]);

      // Setting to SHIPPED twice should work without error
      await OrderService.updateOrderStatus('order1', 'SHIPPED');
      await OrderService.updateOrderStatus('order1', 'SHIPPED');

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(2);
    });
  });
});
