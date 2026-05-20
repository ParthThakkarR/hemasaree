// @ts-nocheck
// tests/unit/api/wishlist.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma, mockSession } = vi.hoisted(() => ({
  mockPrisma: {
    user: {
      findUnique: vi.fn(),
    },
    wishlistItem: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
  mockSession: vi.fn(),
}));

vi.mock('@/app/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('next-auth', () => ({ getServerSession: mockSession }));
vi.mock('@/app/lib/auth', () => ({ authOptions: {} }));

import { GET, POST, DELETE } from '/home/meet/Babar-Meet/hemasaree/app/api/wishlist/route.ts';

const makeReq = (body?: Record<string, unknown>) => ({
  json: vi.fn().mockResolvedValue(body || {}),
} as unknown as Request);

describe('GET /api/wishlist', () => {
  beforeEach(() => { vi.clearAllMocks(); mockSession.mockReset(); mockPrisma.user.findUnique.mockReset(); });

  it('returns 200 with product IDs', async () => {
    mockSession.mockResolvedValue({ user: { email: 'test@example.com' } });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user123', email: 'test@example.com',
      wishlist: [{ productId: 'p1' }, { productId: 'p2' }],
    });
    const res = await GET(makeReq());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(['p1', 'p2']);
  });

  it('returns 401 when no session', async () => {
    mockSession.mockResolvedValue(null);
    const res = await GET(makeReq());
    expect(res.status).toBe(401);
  });

  it('returns 401 when session has no user email', async () => {
    mockSession.mockResolvedValue({ user: {} });
    const res = await GET(makeReq());
    expect(res.status).toBe(401);
  });

  it('returns 404 when user not found', async () => {
    mockSession.mockResolvedValue({ user: { email: 'test@example.com' } });
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const res = await GET(makeReq());
    expect(res.status).toBe(404);
  });

  it('returns empty array when wishlist is empty', async () => {
    mockSession.mockResolvedValue({ user: { email: 'test@example.com' } });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user123', email: 'test@example.com', wishlist: [] });
    const res = await GET(makeReq());
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it('queries user by email', async () => {
    mockSession.mockResolvedValue({ user: { email: 'test@example.com' } });
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await GET(makeReq());
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'test@example.com' } })
    );
  });

  it('includes wishlist with productId select', async () => {
    mockSession.mockResolvedValue({ user: { email: 'test@example.com' } });
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await GET(makeReq());
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ include: { wishlist: { select: { productId: true } } } })
    );
  });

  it('returns 500 when Prisma throws', async () => {
    mockSession.mockResolvedValue({ user: { email: 'test@example.com' } });
    mockPrisma.user.findUnique.mockRejectedValue(new Error('DB error'));
    const res = await GET(makeReq());
    expect(res.status).toBe(500);
  });

  it('returns 500 when getServerSession throws', async () => {
    mockSession.mockRejectedValue(new Error('Session error'));
    const res = await GET(makeReq());
    expect(res.status).toBe(500);
  });
});

describe('POST /api/wishlist (toggle)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession.mockReset();
    mockPrisma.user.findUnique.mockReset();
    mockPrisma.wishlistItem.findUnique.mockReset();
    mockPrisma.wishlistItem.create.mockReset();
    mockPrisma.wishlistItem.delete.mockReset();
  });

  it('adds to wishlist when not present', async () => {
    mockSession.mockResolvedValue({ user: { email: 'test@example.com' } });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user123' });
    mockPrisma.wishlistItem.findUnique.mockResolvedValue(null);
    mockPrisma.wishlistItem.create.mockResolvedValue({ id: 'wi1' });
    const res = await POST(makeReq({ productId: 'p1' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.action).toBe('added');
  });

  it('removes from wishlist when present', async () => {
    mockSession.mockResolvedValue({ user: { email: 'test@example.com' } });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user123' });
    mockPrisma.wishlistItem.findUnique.mockResolvedValue({ id: 'wi1' });
    mockPrisma.wishlistItem.delete.mockResolvedValue({ id: 'wi1' });
    const res = await POST(makeReq({ productId: 'p1' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.action).toBe('removed');
  });

  it('returns 401 when no session', async () => {
    mockSession.mockResolvedValue(null);
    const res = await POST(makeReq({ productId: 'p1' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when productId is missing', async () => {
    mockSession.mockResolvedValue({ user: { email: 'test@example.com' } });
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
  });

  it('returns 400 when productId is empty', async () => {
    mockSession.mockResolvedValue({ user: { email: 'test@example.com' } });
    const res = await POST(makeReq({ productId: '' }));
    expect(res.status).toBe(400);
  });

  it('returns 404 when user not found', async () => {
    mockSession.mockResolvedValue({ user: { email: 'test@example.com' } });
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const res = await POST(makeReq({ productId: 'p1' }));
    expect(res.status).toBe(404);
  });

  it('checks existing item with userId_productId composite key', async () => {
    mockSession.mockResolvedValue({ user: { email: 'test@example.com' } });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user123' });
    mockPrisma.wishlistItem.findUnique.mockResolvedValue(null);
    mockPrisma.wishlistItem.create.mockResolvedValue({ id: 'wi1' });
    await POST(makeReq({ productId: 'p1' }));
    expect(mockPrisma.wishlistItem.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId_productId: { userId: 'user123', productId: 'p1' } } })
    );
  });

  it('creates wishlistItem with userId and productId', async () => {
    mockSession.mockResolvedValue({ user: { email: 'test@example.com' } });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user123' });
    mockPrisma.wishlistItem.findUnique.mockResolvedValue(null);
    mockPrisma.wishlistItem.create.mockResolvedValue({ id: 'wi1' });
    await POST(makeReq({ productId: 'p1' }));
    expect(mockPrisma.wishlistItem.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { userId: 'user123', productId: 'p1' } })
    );
  });

  it('toggles: removes if exists, adds if not', async () => {
    mockSession.mockResolvedValue({ user: { email: 'test@example.com' } });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user123' });
    mockPrisma.wishlistItem.findUnique.mockResolvedValue(null);
    mockPrisma.wishlistItem.create.mockResolvedValue({ id: 'wi1' });
    const res1 = await POST(makeReq({ productId: 'p1' }));
    expect((await res1.json()).action).toBe('added');

    mockPrisma.wishlistItem.findUnique.mockResolvedValue({ id: 'wi1' });
    mockPrisma.wishlistItem.delete.mockResolvedValue({ id: 'wi1' });
    const res2 = await POST(makeReq({ productId: 'p1' }));
    expect((await res2.json()).action).toBe('removed');
  });

  it('returns 500 when Prisma throws', async () => {
    mockSession.mockResolvedValue({ user: { email: 'test@example.com' } });
    mockPrisma.user.findUnique.mockRejectedValue(new Error('DB error'));
    const res = await POST(makeReq({ productId: 'p1' }));
    expect(res.status).toBe(500);
  });

  it('returns 500 when getServerSession throws', async () => {
    mockSession.mockRejectedValue(new Error('Session error'));
    const res = await POST(makeReq({ productId: 'p1' }));
    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/wishlist (clear)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession.mockReset();
    mockPrisma.user.findUnique.mockReset();
    mockPrisma.wishlistItem.deleteMany.mockReset();
  });

  it('clears entire wishlist', async () => {
    mockSession.mockResolvedValue({ user: { email: 'test@example.com' } });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user123' });
    mockPrisma.wishlistItem.deleteMany.mockResolvedValue({ count: 5 });
    const res = await DELETE(makeReq());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe('Wishlist cleared');
  });

  it('returns 401 when no session', async () => {
    mockSession.mockResolvedValue(null);
    const res = await DELETE(makeReq());
    expect(res.status).toBe(401);
  });

  it('returns 404 when user not found', async () => {
    mockSession.mockResolvedValue({ user: { email: 'test@example.com' } });
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const res = await DELETE(makeReq());
    expect(res.status).toBe(404);
  });

  it('deletes by userId', async () => {
    mockSession.mockResolvedValue({ user: { email: 'test@example.com' } });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user123' });
    mockPrisma.wishlistItem.deleteMany.mockResolvedValue({ count: 0 });
    await DELETE(makeReq());
    expect(mockPrisma.wishlistItem.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user123' } })
    );
  });

  it('returns 500 when Prisma throws', async () => {
    mockSession.mockResolvedValue({ user: { email: 'test@example.com' } });
    mockPrisma.user.findUnique.mockRejectedValue(new Error('DB error'));
    const res = await DELETE(makeReq());
    expect(res.status).toBe(500);
  });
});
