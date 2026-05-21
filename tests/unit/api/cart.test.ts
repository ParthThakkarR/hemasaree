// @ts-nocheck
// tests/unit/api/cart.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma, mockUser } = vi.hoisted(() => ({
  mockPrisma: {
    cart: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    cartItem: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
    },
  },
  mockUser: {
    id: 'user123',
    email: 'test@example.com',
    firstName: 'Test',
  },
}));

vi.mock('@/app/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('@/app/lib/getUserFromToken', () => ({ getUserFromToken: vi.fn() }));
vi.mock('@prisma/client', () => ({
  OrderStatus: { PENDING: 'PENDING', CANCELLED: 'CANCELLED', CONFIRMED: 'CONFIRMED', SHIPPED: 'SHIPPED', DELIVERED: 'DELIVERED', RETURNED: 'RETURNED' },
  OrderItemStatus: { PENDING: 'PENDING', CANCELLED: 'CANCELLED', DELIVERED: 'DELIVERED', RETURN_REQUESTED: 'RETURN_REQUESTED' },
}));

import { GET, POST, PUT, DELETE } from '/home/meet/Babar-Meet/hemasaree/app/api/cart/route.tsx';
import { getUserFromToken } from '@/app/lib/getUserFromToken';

const makeReq = (body?: Record<string, unknown>) => ({
  json: vi.fn().mockResolvedValue(body || {}),
} as unknown as Request);

describe('GET /api/cart', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.mocked(getUserFromToken).mockReset(); mockPrisma.cart.findFirst.mockReset(); });

  it('returns 200 with cart for authenticated user', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.cart.findFirst.mockResolvedValue({ id: 'cart1', userId: 'user123', totalPrice: 100, items: [] });
    const res = await GET(makeReq());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cart).toBeDefined();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(null);
    const res = await GET(makeReq());
    expect(res.status).toBe(401);
  });

  it('returns 401 when getUserFromToken returns undefined', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(undefined);
    const res = await GET(makeReq());
    expect(res.status).toBe(401);
  });

  it('queries cart by userId', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.cart.findFirst.mockResolvedValue(null);
    await GET(makeReq());
    expect(mockPrisma.cart.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user123' } })
    );
  });

  it('includes items with product details', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.cart.findFirst.mockResolvedValue(null);
    await GET(makeReq());
    expect(mockPrisma.cart.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ include: expect.objectContaining({ items: expect.any(Object) }) })
    );
  });

  it('returns null cart when user has no cart', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.cart.findFirst.mockResolvedValue(null);
    const res = await GET(makeReq());
    const body = await res.json();
    expect(body.cart).toBeNull();
  });

  it('returns cart with items', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.cart.findFirst.mockResolvedValue({
      id: 'cart1', userId: 'user123', totalPrice: 500,
      items: [{ id: 'ci1', productId: 'p1', quantity: 2, price: 250, product: { name: 'Saree', stock: 10 } }],
    });
    const res = await GET(makeReq());
    const body = await res.json();
    expect(body.cart.items).toHaveLength(1);
  });

  it('returns 500 when Prisma throws', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.cart.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await GET(makeReq());
    expect(res.status).toBe(500);
  });

  it('returns 500 when getUserFromToken throws', async () => {
    vi.mocked(getUserFromToken).mockRejectedValue(new Error('Token error'));
    const res = await GET(makeReq());
    expect(res.status).toBe(500);
  });
});

describe('POST /api/cart (add item)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserFromToken).mockReset();
    mockPrisma.product.findUnique.mockReset();
    mockPrisma.cart.findFirst.mockReset();
    mockPrisma.cart.create.mockReset();
    mockPrisma.cartItem.findMany.mockReset();
    mockPrisma.cartItem.create.mockReset();
    mockPrisma.cartItem.update.mockReset();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(null);
    const res = await POST(makeReq({ productId: 'p1', quantity: 1, price: 100 }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when productId is missing', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    const res = await POST(makeReq({ quantity: 1, price: 100 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when quantity is missing', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    const res = await POST(makeReq({ productId: 'p1', price: 100 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when price is missing', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    const res = await POST(makeReq({ productId: 'p1', quantity: 1 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when quantity is 0', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    const res = await POST(makeReq({ productId: 'p1', quantity: 0, price: 100 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when quantity is negative', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    const res = await POST(makeReq({ productId: 'p1', quantity: -1, price: 100 }));
    expect(res.status).toBe(400);
  });

  it('returns 404 when product not found', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.product.findUnique.mockResolvedValue(null);
    const res = await POST(makeReq({ productId: 'nonexistent', quantity: 1, price: 100, productName: 'Test' }));
    expect(res.status).toBe(404);
  });

  it('returns 400 when stock is insufficient', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', stock: 2 });
    mockPrisma.cart.findFirst.mockResolvedValue({ id: 'cart1' });
    mockPrisma.cartItem.findMany.mockResolvedValue([{ id: 'ci1', productId: 'p1', quantity: 2, withPolish: false }]);
    const res = await POST(makeReq({ productId: 'p1', quantity: 1, price: 100, productName: 'Test' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('available');
  });

  it('creates cart when user has none', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', stock: 10 });
    mockPrisma.cart.findFirst.mockResolvedValue(null);
    mockPrisma.cart.create.mockResolvedValue({ id: 'newCart', userId: 'user123' });
    mockPrisma.cartItem.findMany.mockResolvedValue([]);
    mockPrisma.cartItem.create.mockResolvedValue({ id: 'ci1' });
    mockPrisma.cart.update.mockResolvedValue({ id: 'newCart', totalPrice: 100, items: [] });
    const res = await POST(makeReq({ productId: 'p1', quantity: 1, price: 100, productName: 'Test' }));
    expect(res.status).toBe(200);
    expect(mockPrisma.cart.create).toHaveBeenCalledWith({ data: { userId: 'user123' } });
  });

  it('creates new cartItem when variant does not exist', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', stock: 10, price: 50 });
    mockPrisma.cart.findFirst.mockResolvedValue({ id: 'cart1' });
    mockPrisma.cartItem.findMany.mockResolvedValue([]);
    mockPrisma.cartItem.create.mockResolvedValue({ id: 'ci1' });
    mockPrisma.cart.update.mockResolvedValue({ id: 'cart1', totalPrice: 100, items: [] });
    const res = await POST(makeReq({ productId: 'p1', quantity: 2, price: 50, productName: 'Silk', productImage: 'img.jpg' }));
    expect(res.status).toBe(200);
    expect(mockPrisma.cartItem.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ productId: 'p1', quantity: 2, price: 50 }) })
    );
  });

  it('updates existing cartItem when same variant exists', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', stock: 10 });
    mockPrisma.cart.findFirst.mockResolvedValue({ id: 'cart1' });
    mockPrisma.cartItem.findMany.mockResolvedValue([{ id: 'ci1', productId: 'p1', quantity: 1, withPolish: true }]);
    mockPrisma.cartItem.update.mockResolvedValue({ id: 'ci1' });
    mockPrisma.cart.update.mockResolvedValue({ id: 'cart1', totalPrice: 150, items: [] });
    const res = await POST(makeReq({ productId: 'p1', quantity: 1, price: 50, productName: 'Test', withPolish: true }));
    expect(res.status).toBe(200);
    expect(mockPrisma.cartItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'ci1' }, data: { quantity: 2 } })
    );
  });

  it('allows adding when product has infinite stock (stock = 0 treated as Infinity)', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', stock: 0 });
    mockPrisma.cart.findFirst.mockResolvedValue({ id: 'cart1' });
    mockPrisma.cartItem.findMany.mockResolvedValue([]);
    mockPrisma.cartItem.create.mockResolvedValue({ id: 'ci1' });
    mockPrisma.cart.update.mockResolvedValue({ id: 'cart1', totalPrice: 100, items: [] });
    const res = await POST(makeReq({ productId: 'p1', quantity: 999, price: 100, productName: 'Test' }));
    expect(res.status).toBe(200);
  });

  it('allows adding when product has negative stock (treated as Infinity)', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', stock: -5 });
    mockPrisma.cart.findFirst.mockResolvedValue({ id: 'cart1' });
    mockPrisma.cartItem.findMany.mockResolvedValue([]);
    mockPrisma.cartItem.create.mockResolvedValue({ id: 'ci1' });
    mockPrisma.cart.update.mockResolvedValue({ id: 'cart1', totalPrice: 100, items: [] });
    const res = await POST(makeReq({ productId: 'p1', quantity: 50, price: 100, productName: 'Test' }));
    expect(res.status).toBe(200);
  });

  it('recalculates cart total after adding', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', stock: 10 });
    mockPrisma.cart.findFirst.mockResolvedValue({ id: 'cart1' });
    mockPrisma.cartItem.findMany.mockResolvedValue([]);
    mockPrisma.cartItem.create.mockResolvedValue({ id: 'ci1' });
    mockPrisma.cart.update.mockResolvedValue({ id: 'cart1', totalPrice: 100, items: [] });
    const res = await POST(makeReq({ productId: 'p1', quantity: 1, price: 100, productName: 'Test' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cart).toBeDefined();
  });

  it('returns 500 when Prisma throws', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.product.findUnique.mockRejectedValue(new Error('DB error'));
    const res = await POST(makeReq({ productId: 'p1', quantity: 1, price: 100, productName: 'Test' }));
    expect(res.status).toBe(500);
  });

  it('returns 500 when JSON parse fails', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    const req = { json: vi.fn().mockRejectedValue(new SyntaxError('bad json')) } as unknown as Request;
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it('handles withPolish field for variant merging', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', stock: 10 });
    mockPrisma.cart.findFirst.mockResolvedValue({ id: 'cart1' });
    mockPrisma.cartItem.findMany.mockResolvedValue([
      { id: 'ci1', productId: 'p1', quantity: 1, withPolish: true },
      { id: 'ci2', productId: 'p1', quantity: 1, withPolish: false },
    ]);
    mockPrisma.cartItem.update.mockResolvedValue({ id: 'ci1' });
    mockPrisma.cart.update.mockResolvedValue({ id: 'cart1', totalPrice: 200, items: [] });
    const res = await POST(makeReq({ productId: 'p1', quantity: 1, price: 100, productName: 'Test', withPolish: true }));
    expect(res.status).toBe(200);
    expect(mockPrisma.cartItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'ci1' }, data: { quantity: 2 } })
    );
  });

  it('creates new item when different polish variant', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', stock: 10 });
    mockPrisma.cart.findFirst.mockResolvedValue({ id: 'cart1' });
    mockPrisma.cartItem.findMany.mockResolvedValue([
      { id: 'ci1', productId: 'p1', quantity: 1, withPolish: true },
    ]);
    mockPrisma.cartItem.create.mockResolvedValue({ id: 'ci2' });
    mockPrisma.cart.update.mockResolvedValue({ id: 'cart1', totalPrice: 200, items: [] });
    const res = await POST(makeReq({ productId: 'p1', quantity: 1, price: 100, productName: 'Test', withPolish: false }));
    expect(res.status).toBe(200);
    expect(mockPrisma.cartItem.create).toHaveBeenCalled();
  });

  it('handles null withPolish as distinct variant', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', stock: 10 });
    mockPrisma.cart.findFirst.mockResolvedValue({ id: 'cart1' });
    mockPrisma.cartItem.findMany.mockResolvedValue([
      { id: 'ci1', productId: 'p1', quantity: 1, withPolish: true },
    ]);
    mockPrisma.cartItem.create.mockResolvedValue({ id: 'ci2' });
    mockPrisma.cart.update.mockResolvedValue({ id: 'cart1', totalPrice: 200, items: [] });
    const res = await POST(makeReq({ productId: 'p1', quantity: 1, price: 100, productName: 'Test' }));
    expect(res.status).toBe(200);
    expect(mockPrisma.cartItem.create).toHaveBeenCalled();
  });

  it('handles very large quantity (10000)', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', stock: 999 });
    mockPrisma.cart.findFirst.mockResolvedValue({ id: 'cart1' });
    mockPrisma.cartItem.findMany.mockResolvedValue([]);
    const res = await POST(makeReq({ productId: 'p1', quantity: 10000, price: 100 }));
    expect(res.status).toBe(400);
  });

  it('handles stock check with existing items of same product', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', stock: 5 });
    mockPrisma.cart.findFirst.mockResolvedValue({ id: 'cart1' });
    mockPrisma.cartItem.findMany.mockResolvedValue([
      { id: 'ci1', productId: 'p1', quantity: 3, withPolish: true },
      { id: 'ci2', productId: 'p1', quantity: 1, withPolish: false },
    ]);
    const res = await POST(makeReq({ productId: 'p1', quantity: 2, price: 100, productName: 'Test', withPolish: true }));
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/cart (update quantity)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserFromToken).mockReset();
    mockPrisma.cartItem.findFirst.mockReset();
    mockPrisma.cartItem.update.mockReset();
    mockPrisma.cartItem.findMany.mockReset();
    mockPrisma.cart.update.mockReset();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(null);
    const res = await PUT(makeReq({ cartItemId: 'ci1', quantity: 3 }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when cartItemId is missing', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    const res = await PUT(makeReq({ quantity: 3 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when quantity is missing', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    const res = await PUT(makeReq({ cartItemId: 'ci1' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when quantity is 0', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    const res = await PUT(makeReq({ cartItemId: 'ci1', quantity: 0 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when quantity is negative', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    const res = await PUT(makeReq({ cartItemId: 'ci1', quantity: -5 }));
    expect(res.status).toBe(400);
  });

  it('returns 404 when cartItem not found', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.cartItem.findFirst.mockResolvedValue(null);
    const res = await PUT(makeReq({ cartItemId: 'nonexistent', quantity: 3 }));
    expect(res.status).toBe(404);
  });

  it('returns 404 when cartItem belongs to another user', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.cartItem.findFirst.mockResolvedValue(null);
    const res = await PUT(makeReq({ cartItemId: 'other-user-item', quantity: 3 }));
    expect(res.status).toBe(404);
  });

  it('updates quantity successfully', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.cartItem.findFirst.mockResolvedValue({
      id: 'ci1', cartId: 'cart1', productId: 'p1', quantity: 2,
      product: { stock: 10 },
    });
    mockPrisma.cartItem.findMany.mockResolvedValue([]);
    mockPrisma.cartItem.update.mockResolvedValue({ id: 'ci1' });
    mockPrisma.cart.update.mockResolvedValue({ id: 'cart1', totalPrice: 300, items: [] });
    const res = await PUT(makeReq({ cartItemId: 'ci1', quantity: 5 }));
    expect(res.status).toBe(200);
    expect(mockPrisma.cartItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'ci1' }, data: { quantity: 5 } })
    );
  });

  it('returns 400 when new quantity exceeds stock', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.cartItem.findFirst.mockResolvedValue({
      id: 'ci1', cartId: 'cart1', productId: 'p1', quantity: 2,
      product: { stock: 5 },
    });
    mockPrisma.cartItem.findMany.mockResolvedValue([{ id: 'ci2', quantity: 3 }]);
    const res = await PUT(makeReq({ cartItemId: 'ci1', quantity: 4 }));
    expect(res.status).toBe(400);
  });

  it('allows decreasing quantity freely', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.cartItem.findFirst.mockResolvedValue({
      id: 'ci1', cartId: 'cart1', productId: 'p1', quantity: 5,
      product: { stock: 2 },
    });
    mockPrisma.cartItem.findMany.mockResolvedValue([]);
    mockPrisma.cartItem.update.mockResolvedValue({ id: 'ci1' });
    mockPrisma.cart.update.mockResolvedValue({ id: 'cart1', totalPrice: 100, items: [] });
    const res = await PUT(makeReq({ cartItemId: 'ci1', quantity: 1 }));
    expect(res.status).toBe(200);
  });

  it('checks siblings when product has multiple variants', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.cartItem.findFirst.mockResolvedValue({
      id: 'ci1', cartId: 'cart1', productId: 'p1', quantity: 1,
      product: { stock: 5 },
    });
    mockPrisma.cartItem.findMany.mockResolvedValue([{ id: 'ci2', quantity: 3 }]);
    const res = await PUT(makeReq({ cartItemId: 'ci1', quantity: 3 }));
    expect(res.status).toBe(400);
  });

  it('recalculates cart total after update', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.cartItem.findFirst.mockResolvedValue({
      id: 'ci1', cartId: 'cart1', productId: 'p1', quantity: 1,
      product: { stock: 10 },
    });
    mockPrisma.cartItem.findMany.mockResolvedValue([]);
    mockPrisma.cartItem.update.mockResolvedValue({ id: 'ci1' });
    mockPrisma.cart.update.mockResolvedValue({ id: 'cart1', totalPrice: 200, items: [] });
    const res = await PUT(makeReq({ cartItemId: 'ci1', quantity: 4 }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cart).toBeDefined();
  });

  it('returns 500 when Prisma throws', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.cartItem.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await PUT(makeReq({ cartItemId: 'ci1', quantity: 3 }));
    expect(res.status).toBe(500);
  });

  it('handles infinite stock (stock = 0)', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.cartItem.findFirst.mockResolvedValue({
      id: 'ci1', cartId: 'cart1', productId: 'p1', quantity: 1,
      product: { stock: 0 },
    });
    mockPrisma.cartItem.findMany.mockResolvedValue([]);
    mockPrisma.cartItem.update.mockResolvedValue({ id: 'ci1' });
    mockPrisma.cart.update.mockResolvedValue({ id: 'cart1', totalPrice: 99900, items: [] });
    const res = await PUT(makeReq({ cartItemId: 'ci1', quantity: 999 }));
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/cart (remove item)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserFromToken).mockReset();
    mockPrisma.cartItem.findFirst.mockReset();
    mockPrisma.cartItem.delete.mockReset();
    mockPrisma.cart.update.mockReset();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(null);
    const res = await DELETE(makeReq({ cartItemId: 'ci1' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when cartItemId is missing', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    const res = await DELETE(makeReq({}));
    expect(res.status).toBe(400);
  });

  it('returns 400 when cartItemId is empty', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    const res = await DELETE(makeReq({ cartItemId: '' }));
    expect(res.status).toBe(400);
  });

  it('returns 404 when cartItem not found', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.cartItem.findFirst.mockResolvedValue(null);
    const res = await DELETE(makeReq({ cartItemId: 'nonexistent' }));
    expect(res.status).toBe(404);
  });

  it('returns 404 when cartItem belongs to another user', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.cartItem.findFirst.mockResolvedValue(null);
    const res = await DELETE(makeReq({ cartItemId: 'other-user-item' }));
    expect(res.status).toBe(404);
  });

  it('deletes cartItem successfully', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.cartItem.findFirst.mockResolvedValue({ id: 'ci1', cartId: 'cart1' });
    mockPrisma.cartItem.delete.mockResolvedValue({ id: 'ci1' });
    mockPrisma.cart.update.mockResolvedValue({ id: 'cart1', totalPrice: 0, items: [] });
    const res = await DELETE(makeReq({ cartItemId: 'ci1' }));
    expect(res.status).toBe(200);
    expect(mockPrisma.cartItem.delete).toHaveBeenCalledWith({ where: { id: 'ci1' } });
  });

  it('recalculates cart total after deletion', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.cartItem.findFirst.mockResolvedValue({ id: 'ci1', cartId: 'cart1' });
    mockPrisma.cartItem.delete.mockResolvedValue({ id: 'ci1' });
    mockPrisma.cart.update.mockResolvedValue({ id: 'cart1', totalPrice: 0, items: [] });
    const res = await DELETE(makeReq({ cartItemId: 'ci1' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cart).toBeDefined();
  });

  it('returns 500 when Prisma throws', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.cartItem.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await DELETE(makeReq({ cartItemId: 'ci1' }));
    expect(res.status).toBe(500);
  });

  it('returns success message', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.cartItem.findFirst.mockResolvedValue({ id: 'ci1', cartId: 'cart1' });
    mockPrisma.cartItem.delete.mockResolvedValue({ id: 'ci1' });
    mockPrisma.cart.update.mockResolvedValue({ id: 'cart1', totalPrice: 0, items: [] });
    const res = await DELETE(makeReq({ cartItemId: 'ci1' }));
    const body = await res.json();
    expect(body.message).toBe('Item removed');
  });

  it('handles deleting last item in cart', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.cartItem.findFirst.mockResolvedValue({ id: 'ci1', cartId: 'cart1' });
    mockPrisma.cartItem.delete.mockResolvedValue({ id: 'ci1' });
    mockPrisma.cart.update.mockResolvedValue({ id: 'cart1', totalPrice: 0, items: [] });
    const res = await DELETE(makeReq({ cartItemId: 'ci1' }));
    expect(res.status).toBe(200);
  });

  it('handles SQL injection in cartItemId', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.cartItem.findFirst.mockResolvedValue(null);
    const res = await DELETE(makeReq({ cartItemId: "'; DROP TABLE cart_items; --" }));
    expect(res.status).toBe(404);
  });

  it('handles very long cartItemId', async () => {
    vi.mocked(getUserFromToken).mockResolvedValue(mockUser);
    mockPrisma.cartItem.findFirst.mockResolvedValue(null);
    const res = await DELETE(makeReq({ cartItemId: 'x'.repeat(1000) }));
    expect(res.status).toBe(404);
  });
});
