// @ts-nocheck
// tests/unit/api/orders/list.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma, mockUser } = vi.hoisted(() => ({
  mockPrisma: {
    order: {
      findMany: vi.fn(),
    },
  },
  mockUser: {
    id: 'user123',
    email: 'test@example.com',
    firstName: 'Test',
  },
}));

vi.mock('@/app/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.mock('@/app/lib/getUserFromToken', () => ({
  getUserFromToken: vi.fn(),
}));

import { GET } from '/home/meet/Babar-Meet/hemasaree/app/api/orders/route.tsx';
import { getUserFromToken } from '@/app/lib/getUserFromToken';

const callRoute = async () => {
  const req = {} as Request;
  return GET(req);
};

describe('GET /api/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.order.findMany.mockReset();
    vi.mocked(getUserFromToken).mockReset();
  });

  describe('Success (200)', () => {
    it('returns 200 with orders when user is authenticated', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findMany.mockResolvedValue([
        {
          id: 'order1',
          userId: 'user123',
          total: 1000,
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
          payment: null,
          orderItems: [],
        },
      ]);

      const res = await callRoute();
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.orders).toHaveLength(1);
    });

    it('includes payment, orderItems, and product details', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findMany.mockResolvedValue([
        {
          id: 'order1',
          userId: 'user123',
          total: 500,
          status: 'DELIVERED',
          createdAt: new Date(),
          updatedAt: new Date(),
          payment: { id: 'pay1', amount: 500 },
          orderItems: [
            {
              id: 'item1',
              productId: 'prod1',
              quantity: 2,
              price: 250,
              product: {
                id: 'prod1',
                name: 'Silk Saree',
                price: 250,
                category: { name: 'Silk' },
              },
            },
          ],
        },
      ]);

      const res = await callRoute();
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.orders[0].orderItems[0].product.name).toBe('Silk Saree');
    });

    it('enriches orders with user info (firstName, email)', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findMany.mockResolvedValue([]);

      const res = await callRoute();
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.orders).toEqual([]);
    });

    it('returns empty array when user has no orders', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findMany.mockResolvedValue([]);

      const res = await callRoute();
      const body = await res.json();
      expect(body.orders).toHaveLength(0);
    });

    it('queries orders for the authenticated user only', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findMany.mockResolvedValue([]);

      await callRoute();
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user123' },
        })
      );
    });

    it('orders by createdAt descending', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findMany.mockResolvedValue([]);

      await callRoute();
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('includes payment relation', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findMany.mockResolvedValue([]);

      await callRoute();
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            payment: true,
          }),
        })
      );
    });

    it('includes orderItems with product relation', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findMany.mockResolvedValue([]);

      await callRoute();
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    category: { select: { name: true } },
                  },
                },
              },
            },
          }),
        })
      );
    });

    it('handles multiple orders', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findMany.mockResolvedValue([
        { id: 'o1', userId: 'user123', total: 100, status: 'PENDING', createdAt: new Date(), updatedAt: new Date(), payment: null, orderItems: [] },
        { id: 'o2', userId: 'user123', total: 200, status: 'DELIVERED', createdAt: new Date(), updatedAt: new Date(), payment: null, orderItems: [] },
        { id: 'o3', userId: 'user123', total: 300, status: 'CANCELLED', createdAt: new Date(), updatedAt: new Date(), payment: null, orderItems: [] },
      ]);

      const res = await callRoute();
      const body = await res.json();
      expect(body.orders).toHaveLength(3);
    });
  });

  describe('401 — Unauthorized', () => {
    it('returns 401 when user is not authenticated', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(null);

      const res = await callRoute();
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toBe('Unauthorized');
    });

    it('returns 401 when getUserFromToken returns undefined', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(undefined);

      const res = await callRoute();
      expect(res.status).toBe(401);
    });
  });

  describe('500 — Server errors', () => {
    it('returns 500 when Prisma throws', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findMany.mockRejectedValue(new Error('DB connection error'));

      const res = await callRoute();
      expect(res.status).toBe(500);
    });

    it('returns 500 with error message', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findMany.mockRejectedValue(new Error('Custom DB error'));

      const res = await callRoute();
      const body = await res.json();
      expect(body.error).toBe('Custom DB error');
    });

    it('returns 500 when getUserFromToken throws', async () => {
      vi.mocked(getUserFromToken).mockRejectedValue(new Error('Token decode error'));

      const res = await callRoute();
      expect(res.status).toBe(500);
    });
  });

  describe('Edge cases', () => {
    it('handles orders with null payment', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findMany.mockResolvedValue([
        { id: 'o1', userId: 'user123', total: 100, status: 'PENDING', createdAt: new Date(), updatedAt: new Date(), payment: null, orderItems: [] },
      ]);

      const res = await callRoute();
      expect(res.status).toBe(200);
    });

    it('handles orders with empty orderItems', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findMany.mockResolvedValue([
        { id: 'o1', userId: 'user123', total: 100, status: 'PENDING', createdAt: new Date(), updatedAt: new Date(), payment: null, orderItems: [] },
      ]);

      const res = await callRoute();
      expect(res.status).toBe(200);
    });

    it('handles very large number of orders', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      const manyOrders = Array.from({ length: 100 }, (_, i) => ({
        id: `o${i}`,
        userId: 'user123',
        total: i * 100,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        payment: null,
        orderItems: [],
      }));
      mockPrisma.order.findMany.mockResolvedValue(manyOrders);

      const res = await callRoute();
      const body = await res.json();
      expect(body.orders).toHaveLength(100);
    });

    it('handles user with special characters in firstName', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue({
        ...mockUser,
        firstName: 'Test <script>alert(1)</script>',
      });
      mockPrisma.order.findMany.mockResolvedValue([]);

      const res = await callRoute();
      expect(res.status).toBe(200);
    });

    it('handles user with null firstName', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue({
        ...mockUser,
        firstName: null,
      });
      mockPrisma.order.findMany.mockResolvedValue([]);

      const res = await callRoute();
      expect(res.status).toBe(200);
    });
  });
});
