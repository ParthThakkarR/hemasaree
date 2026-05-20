// @ts-nocheck
// tests/unit/api/checkout.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma, mockUser, mockCreateOrder, mockCalcDelivery } = vi.hoisted(() => ({
  mockPrisma: {
    order: {
      findUnique: vi.fn(),
    },
  },
  mockUser: {
    id: 'user123',
    email: 'test@example.com',
    firstName: 'Test',
  },
  mockCreateOrder: vi.fn(),
  mockCalcDelivery: vi.fn(),
}));

vi.mock('@/app/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('@/app/lib/getUserFromToken', () => ({ getUserFromToken: vi.fn() }));
vi.mock('@/lib/services/orderService', () => ({
  OrderService: { createOrder: mockCreateOrder },
  calculateDeliveryCharge: mockCalcDelivery,
}));
vi.mock('@/lib/errors', () => ({
  handleApiError: vi.fn((err) => ({ message: err.message || 'Internal error', statusCode: err.statusCode || 500 })),
}));
vi.mock('@/lib/email/emailQueue', () => ({
  emailQueue: { add: vi.fn().mockResolvedValue({}) },
}));

import { POST } from '/home/meet/Babar-Meet/hemasaree/app/api/checkout/route.tsx';
import { getUserFromToken } from '@/app/lib/getUserFromToken';

const makeReq = (body?: Record<string, unknown>) => ({
  json: vi.fn().mockResolvedValue(body || {}),
} as unknown as Request);

describe('POST /api/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserFromToken).mockReset();
    mockCreateOrder.mockReset();
    mockCalcDelivery.mockReset();
    mockPrisma.order.findUnique.mockReset();
  });

  describe('Success (200)', () => {
    it('returns 200 when order is placed successfully', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockCalcDelivery.mockReturnValue(100);
      mockCreateOrder.mockResolvedValue({ orderId: 'order1', totalAmount: 1500 });
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order1', user: { email: 'test@example.com' }, orderItems: [],
      });

      const res = await POST(makeReq({
        address: { streetAddress: '123 Main St', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001', label: 'Home' },
      }));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.orderId).toBe('order1');
    });

    it('calculates delivery charge based on state', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockCalcDelivery.mockReturnValue(150);
      mockCreateOrder.mockResolvedValue({ orderId: 'order1', totalAmount: 1650 });

      await POST(makeReq({
        address: { streetAddress: '123 Main St', city: 'Delhi', state: 'Delhi', zipCode: '110001', label: 'Office' },
      }));
      expect(mockCalcDelivery).toHaveBeenCalledWith('Delhi');
    });

    it('creates order with user ID from authenticated session', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockCalcDelivery.mockReturnValue(100);
      mockCreateOrder.mockResolvedValue({ orderId: 'order1', totalAmount: 1500 });

      await POST(makeReq({
        address: { streetAddress: '123 Main St', city: 'Mumbai', state: 'MH', zipCode: '400001', label: 'Home' },
      }));
      expect(mockCreateOrder).toHaveBeenCalledWith('user123', expect.any(Object), 100);
    });

    it('passes address to OrderService.createOrder', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockCalcDelivery.mockReturnValue(100);
      mockCreateOrder.mockResolvedValue({ orderId: 'order1', totalAmount: 1500 });
      const address = { streetAddress: '123 Main St', city: 'Mumbai', state: 'MH', zipCode: '400001' };

      await POST(makeReq({ address }));
      expect(mockCreateOrder).toHaveBeenCalledWith('user123', expect.objectContaining({
        streetAddress: '123 Main St', city: 'Mumbai', state: 'MH', zipCode: '400001',
      }), 100);
    });

    it('returns totalAmount in response', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockCalcDelivery.mockReturnValue(100);
      mockCreateOrder.mockResolvedValue({ orderId: 'order1', totalAmount: 2500 });

      const res = await POST(makeReq({
        address: { streetAddress: '123 Main St', city: 'Mumbai', state: 'MH', zipCode: '400001' },
      }));
      const body = await res.json();
      expect(body.totalAmount).toBe(2500);
    });

    it('returns success message', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockCalcDelivery.mockReturnValue(100);
      mockCreateOrder.mockResolvedValue({ orderId: 'order1', totalAmount: 1500 });

      const res = await POST(makeReq({
        address: { streetAddress: '123 Main St', city: 'Mumbai', state: 'MH', zipCode: '400001' },
      }));
      const body = await res.json();
      expect(body.message).toBe('Order placed successfully!');
    });

    it('queues order confirmation email', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockCalcDelivery.mockReturnValue(100);
      mockCreateOrder.mockResolvedValue({ orderId: 'order1', totalAmount: 1500 });
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order1', user: { email: 'test@example.com' }, orderItems: [],
      });

      await POST(makeReq({
        address: { streetAddress: '123 Main St', city: 'Mumbai', state: 'MH', zipCode: '400001' },
      }));
      expect(mockPrisma.order.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'order1' }, include: expect.any(Object) })
      );
    });

    it('handles email queue error gracefully', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockCalcDelivery.mockReturnValue(100);
      mockCreateOrder.mockResolvedValue({ orderId: 'order1', totalAmount: 1500 });
      mockPrisma.order.findUnique.mockResolvedValue(null);

      const res = await POST(makeReq({
        address: { streetAddress: '123 Main St', city: 'Mumbai', state: 'MH', zipCode: '400001' },
      }));
      expect(res.status).toBe(200);
    });

    it('handles different state delivery charges', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockCalcDelivery.mockReturnValue(0);
      mockCreateOrder.mockResolvedValue({ orderId: 'order1', totalAmount: 1000 });

      await POST(makeReq({
        address: { streetAddress: '123 Main St', city: 'Local', state: 'Maharashtra', zipCode: '400001' },
      }));
      expect(mockCalcDelivery).toHaveBeenCalledWith('Maharashtra');
    });
  });

  describe('401 — Unauthorized', () => {
    it('returns 401 when not authenticated', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(null);
      const res = await POST(makeReq({ address: {} }));
      expect(res.status).toBe(401);
    });

    it('returns 401 when getUserFromToken returns undefined', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(undefined);
      const res = await POST(makeReq({ address: {} }));
      expect(res.status).toBe(401);
    });
  });

  describe('400 — Validation failures', () => {
    it('returns 400 when address is missing', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      const res = await POST(makeReq({}));
      expect(res.status).toBe(400);
    });

    it('returns 400 when streetAddress is missing', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      const res = await POST(makeReq({ address: { city: 'Mumbai', state: 'MH', zipCode: '400001' } }));
      expect(res.status).toBe(400);
    });

    it('returns 400 when city is missing', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      const res = await POST(makeReq({ address: { streetAddress: '123 Main', state: 'MH', zipCode: '400001' } }));
      expect(res.status).toBe(400);
    });

    it('returns 400 when state is missing', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      const res = await POST(makeReq({ address: { streetAddress: '123 Main', city: 'Mumbai', zipCode: '400001' } }));
      expect(res.status).toBe(400);
    });

    it('returns 400 when zipCode is missing', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      const res = await POST(makeReq({ address: { streetAddress: '123 Main', city: 'Mumbai', state: 'MH' } }));
      expect(res.status).toBe(400);
    });

    it('returns 400 when address fields are empty strings', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      const res = await POST(makeReq({ address: { streetAddress: '', city: '', state: '', zipCode: '' } }));
      expect(res.status).toBe(400);
    });
  });

  describe('500 — Server errors', () => {
    it('returns 500 when OrderService.createOrder throws', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockCalcDelivery.mockReturnValue(100);
      mockCreateOrder.mockRejectedValue(new Error('Order creation failed'));

      const res = await POST(makeReq({
        address: { streetAddress: '123 Main St', city: 'Mumbai', state: 'MH', zipCode: '400001' },
      }));
      expect(res.status).toBe(500);
    });

    it('returns 500 when getUserFromToken throws', async () => {
      vi.mocked(getUserFromToken).mockRejectedValue(new Error('Token error'));
      const res = await POST(makeReq({ address: {} }));
      expect(res.status).toBe(500);
    });

    it('returns 500 when JSON parse fails', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      const req = { json: vi.fn().mockRejectedValue(new SyntaxError('bad json')) } as unknown as Request;
      const res = await POST(req);
      expect(res.status).toBe(500);
    });

    it('handles ValidationError from OrderService', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockCalcDelivery.mockReturnValue(100);
      const err = new Error('Cart is empty');
      (err as any).statusCode = 400;
      mockCreateOrder.mockRejectedValue(err);

      const res = await POST(makeReq({
        address: { streetAddress: '123 Main St', city: 'Mumbai', state: 'MH', zipCode: '400001' },
      }));
      expect(res.status).toBe(400);
    });

    it('handles NotFoundError from OrderService', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockCalcDelivery.mockReturnValue(100);
      const err = new Error('Product not found');
      (err as any).statusCode = 404;
      mockCreateOrder.mockRejectedValue(err);

      const res = await POST(makeReq({
        address: { streetAddress: '123 Main St', city: 'Mumbai', state: 'MH', zipCode: '400001' },
      }));
      expect(res.status).toBe(404);
    });
  });

  describe('Edge cases', () => {
    it('handles address with special characters', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockCalcDelivery.mockReturnValue(100);
      mockCreateOrder.mockResolvedValue({ orderId: 'order1', totalAmount: 1500 });

      const res = await POST(makeReq({
        address: {
          streetAddress: 'Apt #42, <script>alert(1)</script>',
          city: "St. John's",
          state: 'MH',
          zipCode: '400001',
        },
      }));
      expect(res.status).toBe(200);
    });

    it('handles very long address fields', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockCalcDelivery.mockReturnValue(100);
      mockCreateOrder.mockResolvedValue({ orderId: 'order1', totalAmount: 1500 });

      const res = await POST(makeReq({
        address: {
          streetAddress: 'S'.repeat(500),
          city: 'C'.repeat(200),
          state: 'MH',
          zipCode: '400001',
        },
      }));
      expect(res.status).toBe(200);
    });

    it('handles address with unicode characters', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockCalcDelivery.mockReturnValue(100);
      mockCreateOrder.mockResolvedValue({ orderId: 'order1', totalAmount: 1500 });

      const res = await POST(makeReq({
        address: {
          streetAddress: 'मुंबई मुख्य मार्ग १२३',
          city: 'मुंबई',
          state: 'MH',
          zipCode: '400001',
        },
      }));
      expect(res.status).toBe(200);
    });

    it('handles null address', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      const res = await POST(makeReq({ address: null }));
      expect(res.status).toBe(400);
    });

    it('handles empty address object', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      const res = await POST(makeReq({ address: {} }));
      expect(res.status).toBe(400);
    });

    it('handles concurrent checkout attempts', async () => {
      vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
      mockCalcDelivery.mockReturnValue(100);
      mockCreateOrder.mockResolvedValue({ orderId: 'order1', totalAmount: 1500 });
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order1', user: { email: 'test@example.com' }, orderItems: [],
      });

      const results = await Promise.all([
        POST(makeReq({ address: { streetAddress: '123 Main', city: 'Mumbai', state: 'MH', zipCode: '400001' } })),
        POST(makeReq({ address: { streetAddress: '123 Main', city: 'Mumbai', state: 'MH', zipCode: '400001' } })),
      ]);
      expect(results.every((r) => r.status === 200)).toBe(true);
    });
  });
});
