// @ts-nocheck
// tests/unit/api/orders/cancel.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma, mockUser, mockTransaction } = vi.hoisted(() => ({
  mockPrisma: {
    order: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    product: {
      update: vi.fn(),
    },
    orderItem: {
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
  mockUser: {
    id: 'user123',
    email: 'test@example.com',
    firstName: 'Test',
  },
  mockTransaction: vi.fn(),
}));

vi.mock('@/app/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.mock('@/app/lib/getUserFromToken', () => ({
  getUserFromToken: vi.fn(),
}));

vi.mock('@prisma/client', () => ({
  OrderStatus: {
    PENDING: 'PENDING',
    CANCELLED: 'CANCELLED',
    CONFIRMED: 'CONFIRMED',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    RETURNED: 'RETURNED',
  },
  OrderItemStatus: {
    PENDING: 'PENDING',
    CANCELLED: 'CANCELLED',
    DELIVERED: 'DELIVERED',
    RETURN_REQUESTED: 'RETURN_REQUESTED',
  },
}));

import { POST } from '/home/meet/Babar-Meet/hemasaree/app/api/orders/[id]/cancel/route.tsx';
import { getUserFromToken } from '@/app/lib/getUserFromToken';

const callRoute = async (orderId: string) => {
  const req = {} as Request;
  const params = { id: orderId };
  return POST(req, { params });
};

describe('POST /api/orders/[id]/cancel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.order.findFirst.mockReset();
    mockPrisma.order.update.mockReset();
    mockPrisma.product.update.mockReset();
    mockPrisma.orderItem.updateMany.mockReset();
    mockPrisma.$transaction.mockReset();
    vi.mocked(getUserFromToken).mockReset();
  });

  describe('Success (200)', () => {
    it('returns 200 when order is cancelled successfully', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order1',
        userId: 'user123',
        status: 'PENDING',
        orderItems: [
          { id: 'item1', productId: 'prod1', quantity: 2 },
        ],
      });
      mockPrisma.$transaction.mockResolvedValue({
        id: 'order1',
        status: 'CANCELLED',
        cancelledAt: new Date(),
        orderItems: [{ id: 'item1', productId: 'prod1', quantity: 2 }],
      });

      const res = await callRoute('order1');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it('restores stock for each order item', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order1',
        userId: 'user123',
        status: 'PENDING',
        orderItems: [
          { id: 'item1', productId: 'prod1', quantity: 3 },
          { id: 'item2', productId: 'prod2', quantity: 1 },
        ],
      });
      mockPrisma.$transaction.mockResolvedValue({
        id: 'order1',
        status: 'CANCELLED',
        cancelledAt: new Date(),
        orderItems: [
          { id: 'item1', productId: 'prod1', quantity: 3 },
          { id: 'item2', productId: 'prod2', quantity: 1 },
        ],
      });

      await callRoute('order1');
      const txFn = mockPrisma.$transaction.mock.calls[0][0];
      const mockTx = {
        product: { update: vi.fn() },
        order: { update: vi.fn() },
        orderItem: { updateMany: vi.fn() },
      };
      await txFn(mockTx);
      expect(mockTx.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'prod1' }, data: { stock: { increment: 3 } } })
      );
      expect(mockTx.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'prod2' }, data: { stock: { increment: 1 } } })
      );
    });

    it('updates order status to CANCELLED', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order1',
        userId: 'user123',
        status: 'PENDING',
        orderItems: [],
      });
      mockPrisma.$transaction.mockResolvedValue({
        id: 'order1',
        status: 'CANCELLED',
        cancelledAt: new Date(),
        orderItems: [],
      });

      await callRoute('order1');
      const txFn = mockPrisma.$transaction.mock.calls[0][0];
      const mockTx = {
        product: { update: vi.fn() },
        order: { update: vi.fn() },
        orderItem: { updateMany: vi.fn() },
      };
      await txFn(mockTx);
      expect(mockTx.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'CANCELLED',
          }),
        })
      );
    });

    it('sets cancelledAt timestamp', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order1',
        userId: 'user123',
        status: 'PENDING',
        orderItems: [],
      });
      mockPrisma.$transaction.mockResolvedValue({
        id: 'order1',
        status: 'CANCELLED',
        cancelledAt: new Date(),
        orderItems: [],
      });

      await callRoute('order1');
      const txFn = mockPrisma.$transaction.mock.calls[0][0];
      const mockTx = {
        product: { update: vi.fn() },
        order: { update: vi.fn() },
        orderItem: { updateMany: vi.fn() },
      };
      await txFn(mockTx);
      expect(mockTx.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            cancelledAt: expect.any(Date),
          }),
        })
      );
    });

    it('updates order items status to CANCELLED', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order1',
        userId: 'user123',
        status: 'PENDING',
        orderItems: [{ id: 'item1', productId: 'prod1', quantity: 1 }],
      });
      mockPrisma.$transaction.mockResolvedValue({
        id: 'order1',
        status: 'CANCELLED',
        cancelledAt: new Date(),
        orderItems: [{ id: 'item1', productId: 'prod1', quantity: 1 }],
      });

      await callRoute('order1');
      const txFn = mockPrisma.$transaction.mock.calls[0][0];
      const mockTx = {
        product: { update: vi.fn() },
        order: { update: vi.fn() },
        orderItem: { updateMany: vi.fn() },
      };
      await txFn(mockTx);
      expect(mockTx.orderItem.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { orderId: 'order1' },
          data: { status: 'CANCELLED' },
        })
      );
    });

    it('returns success message', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order1',
        userId: 'user123',
        status: 'PENDING',
        orderItems: [],
      });
      mockPrisma.$transaction.mockResolvedValue({
        id: 'order1',
        status: 'CANCELLED',
        cancelledAt: new Date(),
        orderItems: [],
      });

      const res = await callRoute('order1');
      const body = await res.json();
      expect(body.message).toBe('Order cancelled and product stock restored.');
    });

    it('returns cancelled order in response', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order1',
        userId: 'user123',
        status: 'PENDING',
        orderItems: [],
      });
      const cancelledOrder = {
        id: 'order1',
        status: 'CANCELLED',
        cancelledAt: new Date(),
        orderItems: [],
      };
      mockPrisma.$transaction.mockResolvedValue(cancelledOrder);

      const res = await callRoute('order1');
      const body = await res.json();
      expect(body.order.status).toBe('CANCELLED');
    });

    it('only cancels PENDING orders', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order1',
        userId: 'user123',
        status: 'PENDING',
        orderItems: [],
      });
      mockPrisma.$transaction.mockResolvedValue({
        id: 'order1',
        status: 'CANCELLED',
        cancelledAt: new Date(),
        orderItems: [],
      });

      await callRoute('order1');
      expect(mockPrisma.order.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PENDING',
          }),
        })
      );
    });

    it('verifies order ownership via userId', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order1',
        userId: 'user123',
        status: 'PENDING',
        orderItems: [],
      });
      mockPrisma.$transaction.mockResolvedValue({
        id: 'order1',
        status: 'CANCELLED',
        cancelledAt: new Date(),
        orderItems: [],
      });

      await callRoute('order1');
      expect(mockPrisma.order.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user123',
          }),
        })
      );
    });
  });

  describe('401 — Unauthorized', () => {
    it('returns 401 when user is not authenticated', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(null);

      const res = await callRoute('order1');
      expect(res.status).toBe(401);
    });

    it('returns 401 when getUserFromToken returns undefined', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(undefined);

      const res = await callRoute('order1');
      expect(res.status).toBe(401);
    });
  });

  describe('400 — Bad request', () => {
    it('returns 400 when order ID is missing', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);

      const res = await callRoute(undefined as unknown as string);
      expect(res.status).toBe(400);
    });

    it('returns 400 when order ID is empty string', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);

      const res = await callRoute('');
      expect(res.status).toBe(400);
    });
  });

  describe('404 — Not found', () => {
    it('returns 404 when order does not exist', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue(null);

      const res = await callRoute('nonexistent');
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toContain('not found');
    });

    it('returns 404 when order belongs to another user', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue(null);

      const res = await callRoute('other-user-order');
      expect(res.status).toBe(404);
    });

    it('returns 404 when order is not PENDING (already shipped)', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue(null); // status filter excludes non-PENDING

      const res = await callRoute('shipped-order');
      expect(res.status).toBe(404);
    });

    it('returns 404 when order is already delivered', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue(null);

      const res = await callRoute('delivered-order');
      expect(res.status).toBe(404);
    });

    it('returns 404 when order is already cancelled', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue(null);

      const res = await callRoute('cancelled-order');
      expect(res.status).toBe(404);
    });
  });

  describe('500 — Server errors', () => {
    it('returns 500 when Prisma findFirst throws', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockRejectedValue(new Error('DB error'));

      const res = await callRoute('order1');
      expect(res.status).toBe(500);
    });

    it('returns 500 when transaction throws', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order1',
        userId: 'user123',
        status: 'PENDING',
        orderItems: [],
      });
      mockPrisma.$transaction.mockRejectedValue(new Error('Transaction failed'));

      const res = await callRoute('order1');
      expect(res.status).toBe(500);
    });

    it('returns 500 when getUserFromToken throws', async () => {
      vi.mocked(getUserFromToken).mockRejectedValue(new Error('Token error'));

      const res = await callRoute('order1');
      expect(res.status).toBe(500);
    });
  });

  describe('Edge cases', () => {
    it('handles order with multiple items for stock restoration', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order1',
        userId: 'user123',
        status: 'PENDING',
        orderItems: [
          { id: 'item1', productId: 'p1', quantity: 5 },
          { id: 'item2', productId: 'p2', quantity: 3 },
          { id: 'item3', productId: 'p3', quantity: 1 },
        ],
      });
      mockPrisma.$transaction.mockResolvedValue({
        id: 'order1',
        status: 'CANCELLED',
        cancelledAt: new Date(),
        orderItems: [
          { id: 'item1', productId: 'p1', quantity: 5 },
          { id: 'item2', productId: 'p2', quantity: 3 },
          { id: 'item3', productId: 'p3', quantity: 1 },
        ],
      });

      await callRoute('order1');
      const txFn = mockPrisma.$transaction.mock.calls[0][0];
      const mockTx = {
        product: { update: vi.fn() },
        order: { update: vi.fn() },
        orderItem: { updateMany: vi.fn() },
      };
      await txFn(mockTx);
      expect(mockTx.product.update).toHaveBeenCalledTimes(3);
    });

    it('handles order with zero quantity items', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order1',
        userId: 'user123',
        status: 'PENDING',
        orderItems: [
          { id: 'item1', productId: 'p1', quantity: 0 },
        ],
      });
      mockPrisma.$transaction.mockResolvedValue({
        id: 'order1',
        status: 'CANCELLED',
        cancelledAt: new Date(),
        orderItems: [{ id: 'item1', productId: 'p1', quantity: 0 }],
      });

      const res = await callRoute('order1');
      expect(res.status).toBe(200);
    });

    it('handles very long order ID', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue(null);

      const longId = 'o'.repeat(1000);
      const res = await callRoute(longId);
      expect(res.status).toBe(404);
    });

    it('handles SQL injection in order ID', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue(null);

      const res = await callRoute("'; DROP TABLE orders; --");
      expect([400, 404]).toContain(res.status);
    });

    it('handles concurrent cancellation attempts', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order1',
        userId: 'user123',
        status: 'PENDING',
        orderItems: [],
      });
      mockPrisma.$transaction.mockResolvedValue({
        id: 'order1',
        status: 'CANCELLED',
        cancelledAt: new Date(),
        orderItems: [],
      });

      const results = await Promise.all([
        callRoute('order1'),
        callRoute('order1'),
        callRoute('order1'),
      ]);
      expect(results.every((r) => r.status === 200)).toBe(true);
    });
  });
});
