// @ts-nocheck
// tests/unit/api/reviews.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma, mockSession } = vi.hoisted(() => ({
  mockPrisma: {
    review: {
      findMany: vi.fn(),
      aggregate: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    orderItem: {
      findFirst: vi.fn(),
    },
  },
  mockSession: vi.fn(),
}));

vi.mock('@/app/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('next-auth', () => ({ getServerSession: mockSession }));
vi.mock('@/app/lib/auth', () => ({ authOptions: {} }));

import { GET, POST } from '/home/meet/Babar-Meet/hemasaree/app/api/reviews/route.tsx';

const makeReq = (url = 'http://localhost:3000/api/reviews', body?: Record<string, unknown>) => ({
  nextUrl: new URL(url),
  json: vi.fn().mockResolvedValue(body || {}),
} as unknown as Request);

describe('GET /api/reviews', () => {
  beforeEach(() => { vi.clearAllMocks(); mockSession.mockReset(); mockPrisma.review.findMany.mockReset(); mockPrisma.review.aggregate.mockReset(); mockPrisma.review.count.mockReset(); });

  it('returns latest approved reviews without productId', async () => {
    mockPrisma.review.findMany.mockResolvedValue([
      { id: 'r1', rating: 5, text: 'Great!', user: { firstName: 'Test' }, product: { name: 'Saree' } },
    ]);
    const res = await GET(makeReq());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.reviews).toHaveLength(1);
  });

  it('filters by isApproved: true', async () => {
    mockPrisma.review.findMany.mockResolvedValue([]);
    await GET(makeReq());
    expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isApproved: true } })
    );
  });

  it('orders by createdAt desc for latest reviews', async () => {
    mockPrisma.review.findMany.mockResolvedValue([]);
    await GET(makeReq());
    expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } })
    );
  });

  it('respects limit parameter', async () => {
    mockPrisma.review.findMany.mockResolvedValue([]);
    await GET(makeReq('http://localhost:3000/api/reviews?limit=5'));
    expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5 })
    );
  });

  it('uses default limit of 20', async () => {
    mockPrisma.review.findMany.mockResolvedValue([]);
    await GET(makeReq());
    expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 20 })
    );
  });

  it('returns reviews for specific productId', async () => {
    mockPrisma.review.findMany.mockResolvedValue([]);
    mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 }, _count: { rating: 10 } });
    mockPrisma.review.count.mockResolvedValue(0);
    await GET(makeReq('http://localhost:3000/api/reviews?productId=p1'));
    expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { productId: 'p1', isApproved: true } })
    );
  });

  it('returns stats with avgRating and totalReviews', async () => {
    mockPrisma.review.findMany.mockResolvedValue([]);
    mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.3 }, _count: { rating: 25 } });
    mockPrisma.review.count.mockResolvedValue(0);
    const res = await GET(makeReq('http://localhost:3000/api/reviews?productId=p1'));
    const body = await res.json();
    expect(body.stats.avgRating).toBe(4.3);
    expect(body.stats.totalReviews).toBe(25);
  });

  it('returns rating distribution', async () => {
    mockPrisma.review.findMany.mockResolvedValue([]);
    mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4 }, _count: { rating: 10 } });
    mockPrisma.review.count.mockResolvedValue(2);
    const res = await GET(makeReq('http://localhost:3000/api/reviews?productId=p1'));
    const body = await res.json();
    expect(body.stats.distribution).toHaveLength(5);
  });

  it('sorts by rating when sort=highest', async () => {
    mockPrisma.review.findMany.mockResolvedValue([]);
    mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4 }, _count: { rating: 10 } });
    mockPrisma.review.count.mockResolvedValue(0);
    await GET(makeReq('http://localhost:3000/api/reviews?productId=p1&sort=highest'));
    expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { rating: 'desc' } })
    );
  });

  it('sorts by createdAt when sort=newest (default)', async () => {
    mockPrisma.review.findMany.mockResolvedValue([]);
    mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4 }, _count: { rating: 10 } });
    mockPrisma.review.count.mockResolvedValue(0);
    await GET(makeReq('http://localhost:3000/api/reviews?productId=p1'));
    expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } })
    );
  });

  it('includes user info in reviews', async () => {
    mockPrisma.review.findMany.mockResolvedValue([]);
    mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4 }, _count: { rating: 10 } });
    mockPrisma.review.count.mockResolvedValue(0);
    await GET(makeReq('http://localhost:3000/api/reviews?productId=p1'));
    expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ include: expect.objectContaining({ user: expect.any(Object) }) })
    );
  });

  it('returns 500 when Prisma throws', async () => {
    mockPrisma.review.findMany.mockRejectedValue(new Error('DB error'));
    const res = await GET(makeReq());
    expect(res.status).toBe(500);
  });

  it('handles zero reviews gracefully', async () => {
    mockPrisma.review.findMany.mockResolvedValue([]);
    mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: null }, _count: { rating: 0 } });
    mockPrisma.review.count.mockResolvedValue(0);
    const res = await GET(makeReq('http://localhost:3000/api/reviews?productId=p1'));
    const body = await res.json();
    expect(body.stats.avgRating).toBe(0);
    expect(body.stats.totalReviews).toBe(0);
  });
});

describe('POST /api/reviews (submit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession.mockReset();
    mockPrisma.review.findUnique.mockReset();
    mockPrisma.review.create.mockReset();
    mockPrisma.orderItem.findFirst.mockReset();
  });

  it('returns 201 when review is submitted', async () => {
    mockSession.mockResolvedValue({ user: { id: 'user123' } });
    mockPrisma.review.findUnique.mockResolvedValue(null);
    mockPrisma.orderItem.findFirst.mockResolvedValue(null);
    mockPrisma.review.create.mockResolvedValue({ id: 'r1', rating: 5, text: 'Great product!' });
    const res = await POST(makeReq('http://localhost:3000/api/reviews', {
      productId: 'p1', rating: 5, text: 'Great product!',
    }));
    expect(res.status).toBe(201);
  });

  it('returns 401 when not authenticated', async () => {
    mockSession.mockResolvedValue(null);
    const res = await POST(makeReq('http://localhost:3000/api/reviews', {
      productId: 'p1', rating: 5, text: 'Great product!',
    }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when productId is missing', async () => {
    mockSession.mockResolvedValue({ user: { id: 'user123' } });
    const res = await POST(makeReq('http://localhost:3000/api/reviews', {
      rating: 5, text: 'Great product!',
    }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when rating is missing', async () => {
    mockSession.mockResolvedValue({ user: { id: 'user123' } });
    const res = await POST(makeReq('http://localhost:3000/api/reviews', {
      productId: 'p1', text: 'Great product!',
    }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when text is missing', async () => {
    mockSession.mockResolvedValue({ user: { id: 'user123' } });
    const res = await POST(makeReq('http://localhost:3000/api/reviews', {
      productId: 'p1', rating: 5,
    }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when rating is below 1', async () => {
    mockSession.mockResolvedValue({ user: { id: 'user123' } });
    const res = await POST(makeReq('http://localhost:3000/api/reviews', {
      productId: 'p1', rating: 0, text: 'Bad',
    }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when rating is above 5', async () => {
    mockSession.mockResolvedValue({ user: { id: 'user123' } });
    const res = await POST(makeReq('http://localhost:3000/api/reviews', {
      productId: 'p1', rating: 6, text: 'Too good',
    }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when text is too short (less than 10 chars)', async () => {
    mockSession.mockResolvedValue({ user: { id: 'user123' } });
    const res = await POST(makeReq('http://localhost:3000/api/reviews', {
      productId: 'p1', rating: 5, text: 'Short',
    }));
    expect(res.status).toBe(400);
  });

  it('returns 409 when user already reviewed this product', async () => {
    mockSession.mockResolvedValue({ user: { id: 'user123' } });
    mockPrisma.review.findUnique.mockResolvedValue({ id: 'r1' });
    const res = await POST(makeReq('http://localhost:3000/api/reviews', {
      productId: 'p1', rating: 5, text: 'Great product!',
    }));
    expect(res.status).toBe(409);
  });

  it('creates review with isApproved: false', async () => {
    mockSession.mockResolvedValue({ user: { id: 'user123' } });
    mockPrisma.review.findUnique.mockResolvedValue(null);
    mockPrisma.orderItem.findFirst.mockResolvedValue(null);
    mockPrisma.review.create.mockResolvedValue({ id: 'r1' });
    await POST(makeReq('http://localhost:3000/api/reviews', {
      productId: 'p1', rating: 5, text: 'Great product!',
    }));
    expect(mockPrisma.review.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isApproved: false }) })
    );
  });

  it('checks for verified purchase', async () => {
    mockSession.mockResolvedValue({ user: { id: 'user123' } });
    mockPrisma.review.findUnique.mockResolvedValue(null);
    mockPrisma.orderItem.findFirst.mockResolvedValue({ id: 'oi1' });
    mockPrisma.review.create.mockResolvedValue({ id: 'r1' });
    const res = await POST(makeReq('http://localhost:3000/api/reviews', {
      productId: 'p1', rating: 5, text: 'Great product!',
    }));
    const body = await res.json();
    expect(body.isVerifiedPurchase).toBe(true);
  });

  it('sets isVerifiedPurchase to false when no purchase found', async () => {
    mockSession.mockResolvedValue({ user: { id: 'user123' } });
    mockPrisma.review.findUnique.mockResolvedValue(null);
    mockPrisma.orderItem.findFirst.mockResolvedValue(null);
    mockPrisma.review.create.mockResolvedValue({ id: 'r1' });
    const res = await POST(makeReq('http://localhost:3000/api/reviews', {
      productId: 'p1', rating: 5, text: 'Great product!',
    }));
    const body = await res.json();
    expect(body.isVerifiedPurchase).toBe(false);
  });

  it('checks purchase with DELIVERED status only', async () => {
    mockSession.mockResolvedValue({ user: { id: 'user123' } });
    mockPrisma.review.findUnique.mockResolvedValue(null);
    mockPrisma.orderItem.findFirst.mockResolvedValue(null);
    mockPrisma.review.create.mockResolvedValue({ id: 'r1' });
    await POST(makeReq('http://localhost:3000/api/reviews', {
      productId: 'p1', rating: 5, text: 'Great product!',
    }));
    expect(mockPrisma.orderItem.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ order: expect.objectContaining({ status: { in: ['DELIVERED'] } }) }) })
    );
  });

  it('includes optional title', async () => {
    mockSession.mockResolvedValue({ user: { id: 'user123' } });
    mockPrisma.review.findUnique.mockResolvedValue(null);
    mockPrisma.orderItem.findFirst.mockResolvedValue(null);
    mockPrisma.review.create.mockResolvedValue({ id: 'r1' });
    await POST(makeReq('http://localhost:3000/api/reviews', {
      productId: 'p1', rating: 5, title: 'Amazing', text: 'Great product!',
    }));
    expect(mockPrisma.review.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ title: 'Amazing' }) })
    );
  });

  it('includes optional images array', async () => {
    mockSession.mockResolvedValue({ user: { id: 'user123' } });
    mockPrisma.review.findUnique.mockResolvedValue(null);
    mockPrisma.orderItem.findFirst.mockResolvedValue(null);
    mockPrisma.review.create.mockResolvedValue({ id: 'r1' });
    await POST(makeReq('http://localhost:3000/api/reviews', {
      productId: 'p1', rating: 5, text: 'Great product, highly recommended!', images: ['img1.jpg', 'img2.jpg'],
    }));
    expect(mockPrisma.review.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ images: ['img1.jpg', 'img2.jpg'] }) })
    );
  });

  it('returns success message', async () => {
    mockSession.mockResolvedValue({ user: { id: 'user123' } });
    mockPrisma.review.findUnique.mockResolvedValue(null);
    mockPrisma.orderItem.findFirst.mockResolvedValue(null);
    mockPrisma.review.create.mockResolvedValue({ id: 'r1' });
    const res = await POST(makeReq('http://localhost:3000/api/reviews', {
      productId: 'p1', rating: 5, text: 'Great product!',
    }));
    const body = await res.json();
    expect(body.message).toContain('after admin approval');
  });

  it('returns 500 when Prisma throws', async () => {
    mockSession.mockResolvedValue({ user: { id: 'user123' } });
    mockPrisma.review.findUnique.mockRejectedValue(new Error('DB error'));
    const res = await POST(makeReq('http://localhost:3000/api/reviews', {
      productId: 'p1', rating: 5, text: 'Great product!',
    }));
    expect(res.status).toBe(500);
  });

  it('returns 500 when getServerSession throws', async () => {
    mockSession.mockRejectedValue(new Error('Session error'));
    const res = await POST(makeReq('http://localhost:3000/api/reviews', {
      productId: 'p1', rating: 5, text: 'Great product!',
    }));
    expect(res.status).toBe(500);
  });
});
