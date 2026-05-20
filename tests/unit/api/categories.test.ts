// @ts-nocheck
// tests/unit/api/categories.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    category: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/app/lib/prisma', () => ({ prisma: mockPrisma }));

import { GET } from '/home/meet/Babar-Meet/hemasaree/app/api/categories/route.tsx';

describe('GET /api/categories', () => {
  beforeEach(() => { vi.clearAllMocks(); mockPrisma.category.findMany.mockReset(); });

  it('returns 200 with categories', async () => {
    mockPrisma.category.findMany.mockResolvedValue([
      { id: 'c1', name: 'Silk', slug: 'silk', products: [] },
      { id: 'c2', name: 'Cotton', slug: 'cotton', products: [] },
    ]);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
  });

  it('includes products in each category', async () => {
    mockPrisma.category.findMany.mockResolvedValue([
      { id: 'c1', name: 'Silk', slug: 'silk', products: [{ id: 'p1', name: 'Saree' }] },
    ]);
    const res = await GET();
    const body = await res.json();
    expect(body[0].products).toHaveLength(1);
  });

  it('returns empty array when no categories', async () => {
    mockPrisma.category.findMany.mockResolvedValue([]);
    const res = await GET();
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it('queries with products included', async () => {
    mockPrisma.category.findMany.mockResolvedValue([]);
    await GET();
    expect(mockPrisma.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ include: { products: true } })
    );
  });

  it('returns 500 when Prisma throws', async () => {
    mockPrisma.category.findMany.mockRejectedValue(new Error('DB error'));
    const res = await GET();
    expect(res.status).toBe(500);
  });

  it('handles many categories', async () => {
    const cats = Array.from({ length: 50 }, (_, i) => ({ id: `c${i}`, name: `Cat${i}`, slug: `cat${i}`, products: [] }));
    mockPrisma.category.findMany.mockResolvedValue(cats);
    const res = await GET();
    const body = await res.json();
    expect(body).toHaveLength(50);
  });

  it('handles category with many products', async () => {
    const products = Array.from({ length: 100 }, (_, i) => ({ id: `p${i}`, name: `Product${i}` }));
    mockPrisma.category.findMany.mockResolvedValue([{ id: 'c1', name: 'Silk', slug: 'silk', products }]);
    const res = await GET();
    const body = await res.json();
    expect(body[0].products).toHaveLength(100);
  });
});
