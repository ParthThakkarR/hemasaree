// @ts-nocheck
// tests/unit/api/orders/detail.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma, mockUser } = vi.hoisted(() => ({
  mockPrisma: {
    order: {
      findFirst: vi.fn(),
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

import { GET } from '/home/meet/Babar-Meet/hemasaree/app/api/orders/[id]/route.tsx';
import { getUserFromToken } from '@/app/lib/getUserFromToken';

const callRoute = async (orderId: string) => {
  const req = { nextUrl: new URL(`http://localhost:3000/api/orders/${orderId}`) } as unknown as Request;
  const params = { id: orderId };
  return GET(req, { params });
};

describe('GET /api/orders/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.order.findFirst.mockReset();
    vi.mocked(getUserFromToken).mockReset();
  });

  describe('Success (200)', () => {
    it('returns 200 with order when user owns the order', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order1',
        userId: 'user123',
        total: 1000,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        orderItems: [],
        user: { firstName: 'Test', lastName: 'User', email: 'test@example.com' },
        payment: null,
      });

      const res = await callRoute('order1');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.order.id).toBe('order1');
    });

    it('includes orderItems with product details', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order1',
        userId: 'user123',
        total: 500,
        status: 'DELIVERED',
        createdAt: new Date(),
        updatedAt: new Date(),
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
              images: ['img1.jpg'],
            },
          },
        ],
        user: { firstName: 'Test', lastName: 'User', email: 'test@example.com' },
        payment: null,
      });

      const res = await callRoute('order1');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.order.orderItems[0].product.name).toBe('Silk Saree');
    });

    it('includes payment details', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order1',
        userId: 'user123',
        total: 1000,
        status: 'DELIVERED',
        createdAt: new Date(),
        updatedAt: new Date(),
        orderItems: [],
        user: { firstName: 'Test', lastName: 'User', email: 'test@example.com' },
        payment: { id: 'pay1', amount: 1000, status: 'COMPLETED' },
      });

      const res = await callRoute('order1');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.order.payment.id).toBe('pay1');
    });

    it('includes user details (firstName, lastName, email)', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order1',
        userId: 'user123',
        total: 100,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        orderItems: [],
        user: { firstName: 'Test', lastName: 'User', email: 'test@example.com' },
        payment: null,
      });

      const res = await callRoute('order1');
      const body = await res.json();
      expect(body.order.user.firstName).toBe('Test');
    });

    it('queries with correct userId and orderId', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue(null);

      await callRoute('order1');
      expect(mockPrisma.order.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'order1',
          userId: 'user123',
        },
        include: expect.any(Object),
      });
    });

    it('includes orderItems with product select', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue(null);

      await callRoute('order1');
      expect(mockPrisma.order.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    images: true,
                  },
                },
              },
            },
          }),
        })
      );
    });

    it('includes user select', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue(null);

      await callRoute('order1');
      expect(mockPrisma.order.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          }),
        })
      );
    });

    it('includes payment', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue(null);

      await callRoute('order1');
      expect(mockPrisma.order.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            payment: true,
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
      const body = await res.json();
      expect(body.error).toBe('Unauthorized');
    });

    it('returns 401 when getUserFromToken returns undefined', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(undefined);

      const res = await callRoute('order1');
      expect(res.status).toBe(401);
    });
  });

  describe('400 — Validation failures', () => {
    it('returns 400 when order ID is empty string', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);

      const res = await callRoute('');
      expect(res.status).toBe(400);
    });

    it('returns 400 when order ID is missing', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);

      const res = await callRoute(undefined as unknown as string);
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
      expect(body.error).toBe('Order not found');
    });

    it('returns 404 when order belongs to another user', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue(null);

      const res = await callRoute('other-user-order');
      expect(res.status).toBe(404);
    });
  });

  describe('500 — Server errors', () => {
    it('returns 500 when Prisma throws', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockRejectedValue(new Error('DB error'));

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
    it('handles order with multiple orderItems', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order1',
        userId: 'user123',
        total: 1500,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        orderItems: [
          { id: 'item1', productId: 'p1', quantity: 1, price: 500, product: { id: 'p1', name: 'Saree 1', price: 500, images: [] } },
          { id: 'item2', productId: 'p2', quantity: 2, price: 500, product: { id: 'p2', name: 'Saree 2', price: 500, images: [] } },
        ],
        user: { firstName: 'Test', lastName: 'User', email: 'test@example.com' },
        payment: null,
      });

      const res = await callRoute('order1');
      const body = await res.json();
      expect(body.order.orderItems).toHaveLength(2);
    });

    it('handles order with null payment', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order1',
        userId: 'user123',
        total: 100,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        orderItems: [],
        user: { firstName: 'Test', lastName: 'User', email: 'test@example.com' },
        payment: null,
      });

      const res = await callRoute('order1');
      expect(res.status).toBe(200);
    });

    it('handles order with various statuses', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      const statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];

      for (const status of statuses) {
        mockPrisma.order.findFirst.mockResolvedValue({
          id: 'order1',
          userId: 'user123',
          total: 100,
          status,
          createdAt: new Date(),
          updatedAt: new Date(),
          orderItems: [],
          user: { firstName: 'Test', lastName: 'User', email: 'test@example.com' },
          payment: null,
        });

        const res = await callRoute('order1');
        expect(res.status).toBe(200);
      }
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
  });
});
