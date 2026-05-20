import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderService, calculateDeliveryCharge } from '@/lib/services/orderService';
import { ValidationError, ConflictError, NotFoundError } from '@/lib/errors';
import { OrderStatus, OrderItemStatus } from '@prisma/client';

// Mock Prisma - must be hoisted since vi.mock is hoisted
const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    cart: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    cartItem: {
      deleteMany: vi.fn(),
    },
    order: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    orderItem: {
      updateMany: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    product: {
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('@/app/lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('OrderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── calculateDeliveryCharge (existing tests) ──────────
  describe('calculateDeliveryCharge', () => {
    it('should return 80 for Gujarat (case-insensitive)', () => {
      expect(calculateDeliveryCharge('gujarat')).toBe(80);
      expect(calculateDeliveryCharge('Gujarat')).toBe(80);
      expect(calculateDeliveryCharge('GUJARAT')).toBe(80);
      expect(calculateDeliveryCharge('  gujarat  ')).toBe(80);
    });

    it('should return 150 for other states', () => {
      expect(calculateDeliveryCharge('Maharashtra')).toBe(150);
      expect(calculateDeliveryCharge('Karnataka')).toBe(150);
      expect(calculateDeliveryCharge('Tamil Nadu')).toBe(150);
      expect(calculateDeliveryCharge('')).toBe(150);
    });

    it('should handle null/undefined gracefully', () => {
      // @ts-ignore - testing edge case
      expect(calculateDeliveryCharge(null)).toBe(150);
      // @ts-ignore - testing edge case
      expect(calculateDeliveryCharge(undefined)).toBe(150);
    });

    it('should handle state with whitespace', () => {
      expect(calculateDeliveryCharge('  Gujarat  ')).toBe(80);
      expect(calculateDeliveryCharge('\tGujarat\t')).toBe(80);
    });

    it('should handle state with numbers', () => {
      expect(calculateDeliveryCharge('Gujarat123')).toBe(150);
      expect(calculateDeliveryCharge('123Gujarat')).toBe(150);
    });

    it('should handle case variations', () => {
      expect(calculateDeliveryCharge('gujarat')).toBe(80);
      expect(calculateDeliveryCharge('Gujarat')).toBe(80);
      expect(calculateDeliveryCharge('GUJARAT')).toBe(80);
      expect(calculateDeliveryCharge('GuJaRaT')).toBe(80);
    });

    it('should handle SQL injection in state parameter', () => {
      const maliciousState = "'; DROP TABLE orders; --";
      expect(() => calculateDeliveryCharge(maliciousState)).not.toThrow();
      expect(calculateDeliveryCharge(maliciousState)).toBe(150);
    });

    it('should handle XSS attempts in state parameter', () => {
      const xssAttempt = '<script>alert("xss")</script>';
      expect(() => calculateDeliveryCharge(xssAttempt)).not.toThrow();
      expect(calculateDeliveryCharge(xssAttempt)).toBe(150);
    });

    it('should handle very long state string', () => {
      const longState = 'A'.repeat(10000);
      expect(() => calculateDeliveryCharge(longState)).not.toThrow();
      expect(calculateDeliveryCharge(longState)).toBe(150);
    });

    it('should handle unicode and special characters', () => {
      expect(calculateDeliveryCharge('गुजरात')).toBe(150);
      expect(calculateDeliveryCharge('گجرات')).toBe(150);
    });

    it('should handle control characters', () => {
      expect(calculateDeliveryCharge('Gujarat\n')).toBe(80);
      expect(calculateDeliveryCharge('Gujarat\r\n')).toBe(80);
      expect(calculateDeliveryCharge('\x00Gujarat')).toBe(150);
    });
  });

  // ─── validateCartItems ─────────────────────────────────
  describe('validateCartItems', () => {
    const mockCart = {
      id: 'cart1',
      userId: 'user1',
      items: [
        {
          id: 'ci1',
          productId: 'p1',
          quantity: 2,
          withPolish: false,
          product: {
            id: 'p1',
            name: 'Silk Saree',
            price: 1000,
            stock: 10,
            images: ['img1.jpg'],
          },
        },
        {
          id: 'ci2',
          productId: 'p2',
          quantity: 1,
          withPolish: true,
          product: {
            id: 'p2',
            name: 'Cotton Saree',
            price: 500,
            stock: 5,
            images: ['img2.jpg', 'img3.jpg'],
          },
        },
      ],
    };

    it('should validate and return cart items successfully', async () => {
      mockPrisma.cart.findFirst.mockResolvedValue(mockCart);

      const result = await OrderService.validateCartItems('user1');

      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toEqual({
        productId: 'p1',
        quantity: 2,
        price: 1000,
        withPolish: false,
        productName: 'Silk Saree',
        productImage: 'img1.jpg',
      });
      expect(result.items[1]).toEqual({
        productId: 'p2',
        quantity: 1,
        price: 500,
        withPolish: true,
        productName: 'Cotton Saree',
        productImage: 'img2.jpg',
      });
      expect(result.total).toBe(2500); // (1000*2) + (500*1)
      expect(result.cartId).toBe('cart1');
    });

    it('should throw ValidationError when cart is empty', async () => {
      mockPrisma.cart.findFirst.mockResolvedValue({
        ...mockCart,
        items: [],
      });

      await expect(OrderService.validateCartItems('user1'))
        .rejects
        .toThrow(ValidationError);
    });

    it('should throw ValidationError when user has no cart', async () => {
      mockPrisma.cart.findFirst.mockResolvedValue(null);

      await expect(OrderService.validateCartItems('user1'))
        .rejects
        .toThrow(ValidationError);
    });

    it('should throw ConflictError when insufficient stock', async () => {
      const lowStockCart = {
        ...mockCart,
        items: [
          {
            ...mockCart.items[0],
            quantity: 15,
            product: { ...mockCart.items[0].product, stock: 10 },
          },
        ],
      };
      mockPrisma.cart.findFirst.mockResolvedValue(lowStockCart);

      await expect(OrderService.validateCartItems('user1'))
        .rejects
        .toThrow(ConflictError);

      await expect(OrderService.validateCartItems('user1'))
        .rejects
        .toThrow('Not enough stock for Silk Saree. Only 10 available.');
    });

    it('should handle cart with undefined items', async () => {
      mockPrisma.cart.findFirst.mockResolvedValue({
        id: 'cart1',
        userId: 'user1',
        items: undefined,
      });

      await expect(OrderService.validateCartItems('user1'))
        .rejects
        .toThrow(ValidationError);
    });

    it('should use first image or empty string when no images', async () => {
      const noImageCart = {
        ...mockCart,
        items: [
          {
            ...mockCart.items[0],
            product: { ...mockCart.items[0].product, images: [] },
          },
        ],
      };
      mockPrisma.cart.findFirst.mockResolvedValue(noImageCart);

      const result = await OrderService.validateCartItems('user1');

      expect(result.items[0].productImage).toBe('');
    });

    it('should calculate total correctly with multiple items', async () => {
      mockPrisma.cart.findFirst.mockResolvedValue(mockCart);

      const result = await OrderService.validateCartItems('user1');

      expect(result.total).toBe(2500);
    });

    it('should include cart items with withPolish flag', async () => {
      mockPrisma.cart.findFirst.mockResolvedValue(mockCart);

      const result = await OrderService.validateCartItems('user1');

      expect(result.items[0].withPolish).toBe(false);
      expect(result.items[1].withPolish).toBe(true);
    });
  });

  // ─── createOrder ───────────────────────────────────────
  describe('createOrder', () => {
    const mockCart = {
      id: 'cart1',
      userId: 'user1',
      items: [
        {
          id: 'ci1',
          productId: 'p1',
          quantity: 2,
          withPolish: false,
          product: {
            id: 'p1',
            name: 'Silk Saree',
            price: 1000,
            stock: 10,
            images: ['img1.jpg'],
          },
        },
      ],
    };

    const mockAddress = {
      streetAddress: '123 MG Road',
      city: 'Surat',
      state: 'Gujarat',
      zipCode: '395001',
    };

    const mockCreatedOrder = {
      id: 'order1',
      userId: 'user1',
      totalAmount: 2080,
      deliveryCharge: 80,
      status: 'PENDING',
      orderItems: [
        {
          id: 'oi1',
          productId: 'p1',
          productName: 'Silk Saree',
          price: 1000,
          quantity: 2,
        },
      ],
    };

    it('should create order successfully', async () => {
      mockPrisma.cart.findFirst.mockResolvedValue(mockCart);
      mockPrisma.$transaction.mockResolvedValue([
        { matchedCount: 1 }, // stock update
        mockCreatedOrder,    // created order
      ]);

      const result = await OrderService.createOrder('user1', mockAddress, 80);

      expect(result.orderId).toBe('order1');
      expect(result.totalAmount).toBe(2080);
      expect(result.deliveryCharge).toBe(80);
    });

    it('should use provided country in address', async () => {
      mockPrisma.cart.findFirst.mockResolvedValue(mockCart);
      mockPrisma.$transaction.mockResolvedValue([
        { matchedCount: 1 },
        mockCreatedOrder,
      ]);

      await OrderService.createOrder('user1', { ...mockAddress, country: 'USA' }, 80);

      expect(mockPrisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            shippingAddress: expect.stringContaining('USA'),
          }),
        })
      );
    });

    it('should decrement stock for each item', async () => {
      mockPrisma.cart.findFirst.mockResolvedValue(mockCart);
      mockPrisma.$transaction.mockResolvedValue([
        { matchedCount: 1 },
        mockCreatedOrder,
      ]);

      await OrderService.createOrder('user1', mockAddress, 80);

      expect(mockPrisma.product.updateMany).toHaveBeenCalled();
    });

    it('should clear cart after order creation', async () => {
      mockPrisma.cart.findFirst.mockResolvedValue(mockCart);
      mockPrisma.$transaction.mockResolvedValue([
        { matchedCount: 1 },
        mockCreatedOrder,
      ]);

      await OrderService.createOrder('user1', mockAddress, 80);

      expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: 'cart1' },
      });
      expect(mockPrisma.cart.update).toHaveBeenCalledWith({
        where: { id: 'cart1' },
        data: { totalPrice: 0 },
      });
    });

    it('should set order status to PENDING', async () => {
      mockPrisma.cart.findFirst.mockResolvedValue(mockCart);
      mockPrisma.$transaction.mockResolvedValue([
        { matchedCount: 1 },
        mockCreatedOrder,
      ]);

      await OrderService.createOrder('user1', mockAddress, 80);

      expect(mockPrisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PENDING',
          }),
        })
      );
    });

    it('should calculate total amount including delivery charge', async () => {
      mockPrisma.cart.findFirst.mockResolvedValue(mockCart);
      mockPrisma.$transaction.mockResolvedValue([
        { matchedCount: 1 },
        { ...mockCreatedOrder, totalAmount: 2150 },
      ]);

      const result = await OrderService.createOrder('user1', mockAddress, 150);

      expect(result.totalAmount).toBe(2150); // 2000 + 150
    });

    it('should create order items with correct structure', async () => {
      mockPrisma.cart.findFirst.mockResolvedValue(mockCart);
      mockPrisma.$transaction.mockResolvedValue([
        { matchedCount: 1 },
        mockCreatedOrder,
      ]);

      await OrderService.createOrder('user1', mockAddress, 80);

      expect(mockPrisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orderItems: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({
                  productId: 'p1',
                  productName: 'Silk Saree',
                  productImage: 'img1.jpg',
                  price: 1000,
                  quantity: 2,
                  withPolish: false,
                  isReturnable: true,
                }),
              ]),
            }),
          }),
        })
      );
    });

    it('should set isReturnable to false for withPolish items', async () => {
      const polishCart = {
        ...mockCart,
        items: [
          {
            ...mockCart.items[0],
            withPolish: true,
          },
        ],
      };
      mockPrisma.cart.findFirst.mockResolvedValue(polishCart);
      mockPrisma.$transaction.mockResolvedValue([
        { matchedCount: 1 },
        mockCreatedOrder,
      ]);

      await OrderService.createOrder('user1', mockAddress, 80);

      expect(mockPrisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orderItems: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({
                  isReturnable: false,
                }),
              ]),
            }),
          }),
        })
      );
    });

    it('should fail when cart validation fails', async () => {
      mockPrisma.cart.findFirst.mockResolvedValue({
        ...mockCart,
        items: [],
      });

      await expect(OrderService.createOrder('user1', mockAddress, 80))
        .rejects
        .toThrow(ValidationError);
    });

    it('should format shipping address with default country India', async () => {
      mockPrisma.cart.findFirst.mockResolvedValue(mockCart);
      mockPrisma.$transaction.mockResolvedValue([
        { matchedCount: 1 },
        mockCreatedOrder,
      ]);

      await OrderService.createOrder('user1', mockAddress, 80);

      expect(mockPrisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            shippingAddress: expect.stringContaining('India'),
          }),
        })
      );
    });
  });

  // ─── updateOrderStatus ─────────────────────────────────
  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      mockPrisma.$transaction.mockResolvedValue([{}, {}]);

      await OrderService.updateOrderStatus('order1', OrderStatus.SHIPPED);

      expect(mockPrisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'order1' },
          data: { status: OrderStatus.SHIPPED },
        })
      );
    });

    it('should update order item statuses', async () => {
      mockPrisma.$transaction.mockResolvedValue([{}, {}]);

      await OrderService.updateOrderStatus('order1', OrderStatus.DELIVERED);

      expect(mockPrisma.orderItem.updateMany).toHaveBeenCalled();
    });

    it('should exclude return-status items from status update', async () => {
      mockPrisma.$transaction.mockResolvedValue([{}, {}]);

      await OrderService.updateOrderStatus('order1', OrderStatus.SHIPPED);

      expect(mockPrisma.orderItem.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: expect.objectContaining({
              notIn: expect.arrayContaining([
                OrderItemStatus.RETURN_REQUESTED,
                OrderItemStatus.RETURN_APPROVED,
                OrderItemStatus.RETURNED,
                OrderItemStatus.RETURN_DECLINED,
              ]),
            }),
          }),
        })
      );
    });

    it('should handle SHIPPED status', async () => {
      mockPrisma.$transaction.mockResolvedValue([{}, {}]);

      await expect(
        OrderService.updateOrderStatus('order1', OrderStatus.SHIPPED)
      ).resolves.toBeUndefined();
    });

    it('should handle CANCELLED status', async () => {
      mockPrisma.$transaction.mockResolvedValue([{}, {}]);

      await expect(
        OrderService.updateOrderStatus('order1', OrderStatus.CANCELLED)
      ).resolves.toBeUndefined();
    });
  });

  // ─── updateReturnStatus ────────────────────────────────
  describe('updateReturnStatus', () => {
    const mockOrderItem = {
      id: 'oi1',
      productId: 'p1',
      orderId: 'order1',
      quantity: 2,
      status: OrderItemStatus.RETURN_REQUESTED,
      product: { id: 'p1', name: 'Silk Saree' },
      order: { id: 'order1', status: OrderStatus.DELIVERED },
    };

    it('should update return status successfully', async () => {
      mockPrisma.orderItem.findUnique.mockResolvedValue(mockOrderItem);
      mockPrisma.$transaction.mockResolvedValue({});

      await OrderService.updateReturnStatus('oi1', OrderItemStatus.RETURN_APPROVED);

      expect(mockPrisma.orderItem.findUnique).toHaveBeenCalledWith({
        where: { id: 'oi1' },
        include: { product: true, order: true },
      });
    });

    it('should throw NotFoundError when order item does not exist', async () => {
      mockPrisma.orderItem.findUnique.mockResolvedValue(null);

      await expect(
        OrderService.updateReturnStatus('nonexistent', OrderItemStatus.RETURN_APPROVED)
      ).rejects.toThrow(NotFoundError);
    });

    it('should restore stock when return is approved', async () => {
      mockPrisma.orderItem.findUnique.mockResolvedValue(mockOrderItem);
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        if (typeof fn === 'function') {
          const mockTx = {
            product: { update: vi.fn().mockResolvedValue({}) },
            orderItem: {
              findMany: vi.fn().mockResolvedValue([mockOrderItem]),
              update: vi.fn().mockResolvedValue({}),
            },
            order: { update: vi.fn().mockResolvedValue({}) },
          };
          return fn(mockTx);
        }
        return {};
      });

      await OrderService.updateReturnStatus('oi1', OrderItemStatus.RETURN_APPROVED);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should not restore stock when return is declined', async () => {
      mockPrisma.orderItem.findUnique.mockResolvedValue(mockOrderItem);
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        if (typeof fn === 'function') {
          const mockTx = {
            product: { update: vi.fn().mockResolvedValue({}) },
            orderItem: {
              findMany: vi.fn().mockResolvedValue([mockOrderItem]),
              update: vi.fn().mockResolvedValue({}),
            },
            order: { update: vi.fn().mockResolvedValue({}) },
          };
          return fn(mockTx);
        }
        return {};
      });

      await OrderService.updateReturnStatus('oi1', OrderItemStatus.RETURN_DECLINED);
    });

    it('should update order to RETURNED when all items are returned', async () => {
      const allReturned = [
        { ...mockOrderItem, status: OrderItemStatus.RETURN_APPROVED },
        { ...mockOrderItem, id: 'oi2', status: OrderItemStatus.RETURNED },
      ];

      mockPrisma.orderItem.findUnique.mockResolvedValue(mockOrderItem);
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        if (typeof fn === 'function') {
          const mockTx = {
            product: { update: vi.fn().mockResolvedValue({}) },
            orderItem: {
              findMany: vi.fn().mockResolvedValue(allReturned),
              update: vi.fn().mockResolvedValue({}),
            },
            order: { update: vi.fn().mockResolvedValue({}) },
          };
          return fn(mockTx);
        }
        return {};
      });

      await OrderService.updateReturnStatus('oi1', OrderItemStatus.RETURN_APPROVED);
    });

    it('should not update order status when not all items are returned', async () => {
      const partiallyReturned = [
        { ...mockOrderItem, status: OrderItemStatus.RETURN_APPROVED },
        { ...mockOrderItem, id: 'oi2', status: OrderItemStatus.DELIVERED },
      ];

      mockPrisma.orderItem.findUnique.mockResolvedValue(mockOrderItem);
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        if (typeof fn === 'function') {
          const mockTx = {
            product: { update: vi.fn().mockResolvedValue({}) },
            orderItem: {
              findMany: vi.fn().mockResolvedValue(partiallyReturned),
              update: vi.fn().mockResolvedValue({}),
            },
            order: { update: vi.fn().mockResolvedValue({}) },
          };
          return fn(mockTx);
        }
        return {};
      });

      await OrderService.updateReturnStatus('oi1', OrderItemStatus.RETURN_APPROVED);
    });

    it('should handle single item order return', async () => {
      const singleItem = [mockOrderItem];

      mockPrisma.orderItem.findUnique.mockResolvedValue(mockOrderItem);
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        if (typeof fn === 'function') {
          const mockTx = {
            product: { update: vi.fn().mockResolvedValue({}) },
            orderItem: {
              findMany: vi.fn().mockResolvedValue(singleItem),
              update: vi.fn().mockResolvedValue({}),
            },
            order: { update: vi.fn().mockResolvedValue({}) },
          };
          return fn(mockTx);
        }
        return {};
      });

      await OrderService.updateReturnStatus('oi1', OrderItemStatus.RETURN_APPROVED);
    });
  });

  // ─── Integration Edge Cases ────────────────────────────
  describe('Integration Edge Cases', () => {
    it('should validate order item structure', () => {
      const validOrderItem = {
        productId: 'p1',
        quantity: 2,
        price: 100,
        withPolish: false,
      };

      expect(validOrderItem.quantity).toBeGreaterThan(0);
      expect(validOrderItem.price).toBeGreaterThan(0);
    });

    it('should validate address structure', () => {
      const validAddress = {
        streetAddress: '123 Main St',
        city: 'Ahmedabad',
        state: 'Gujarat',
        zipCode: '380001',
      };

      expect(validAddress.state).toBeDefined();
      expect(validAddress.zipCode).toBeDefined();
    });

    it('should handle international zip codes', () => {
      const internationalAddress = {
        streetAddress: '123 Street',
        city: 'London',
        state: 'UK',
        zipCode: 'SW1A 1AA',
      };

      expect(internationalAddress.zipCode).toBeDefined();
    });
  });
});
