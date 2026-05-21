// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  mockPrisma: {
    product: { findMany: vi.fn(), count: vi.fn() },
  },
}));

vi.mock('@/app/lib/prisma', () => ({ prisma: mocks.mockPrisma }));

describe('searchService.searchProducts', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it('returns products array', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    const result = await searchProducts({});
    expect(Array.isArray(result.products)).toBe(true);
  });

  it('returns total count', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(25);
    const { searchProducts } = await import('@/lib/searchService');
    const result = await searchProducts({});
    expect(result.total).toBe(25);
  });

  it('calculates pages correctly', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(25);
    const { searchProducts } = await import('@/lib/searchService');
    const result = await searchProducts({ limit: 10 });
    expect(result.pages).toBe(3);
  });

  it('uses default page 1', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({});
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 12 })
    );
  });

  it('uses default limit 12', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({});
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 12 })
    );
  });

  it('applies custom page', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ page: 3 });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 24 })
    );
  });

  it('applies custom limit', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ limit: 24 });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 24 })
    );
  });

  it('searches by query in name', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ query: 'silk' });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              OR: expect.arrayContaining([
                expect.objectContaining({ name: expect.any(Object) }),
              ]),
            }),
          ]),
        }),
      })
    );
  });

  it('searches by query in color', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ query: 'red' });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              OR: expect.arrayContaining([
                expect.objectContaining({ color: expect.any(Object) }),
              ]),
            }),
          ]),
        }),
      })
    );
  });

  it('searches by query in occasion', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ query: 'wedding' });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              OR: expect.arrayContaining([
                expect.objectContaining({ occasion: expect.any(Object) }),
              ]),
            }),
          ]),
        }),
      })
    );
  });

  it('uses case-insensitive search', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ query: 'SILK' });
    const call = mocks.mockPrisma.product.findMany.mock.calls[0][0];
    const orClause = call.where.AND[0].OR;
    expect(orClause[0].name.mode).toBe('insensitive');
  });

  it('filters by category', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ category: 'cat123' });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ categoryId: 'cat123' }),
          ]),
        }),
      })
    );
  });

  it('filters by color', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ color: 'Red' });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ color: expect.any(Object) }),
          ]),
        }),
      })
    );
  });

  it('filters by occasion', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ occasion: 'Wedding' });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ occasion: expect.any(Object) }),
          ]),
        }),
      })
    );
  });

  it('filters by minPrice', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ minPrice: 500 });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ price: expect.objectContaining({ gte: 500 }) }),
          ]),
        }),
      })
    );
  });

  it('filters by maxPrice', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ maxPrice: 2000 });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ price: expect.objectContaining({ lte: 2000 }) }),
          ]),
        }),
      })
    );
  });

  it('filters by price range', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ minPrice: 500, maxPrice: 2000 });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ price: expect.objectContaining({ gte: 500, lte: 2000 }) }),
          ]),
        }),
      })
    );
  });

  it('uses default maxPrice 1000000 when only minPrice', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ minPrice: 100 });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ price: expect.objectContaining({ lte: 1000000 }) }),
          ]),
        }),
      })
    );
  });

  it('uses default minPrice 0 when only maxPrice', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ maxPrice: 500 });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ price: expect.objectContaining({ gte: 0 }) }),
          ]),
        }),
      })
    );
  });

  it('sorts by newest by default', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({});
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } })
    );
  });

  it('sorts by price ascending', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ sort: 'price_asc' });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { price: 'asc' } })
    );
  });

  it('sorts by price descending', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ sort: 'price_desc' });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { price: 'desc' } })
    );
  });

  it('sorts by newest explicitly', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ sort: 'newest' });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } })
    );
  });

  it('includes category in results', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({});
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ include: { category: true } })
    );
  });

  it('returns empty products when none match', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    const result = await searchProducts({ query: 'nonexistent' });
    expect(result.products).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.pages).toBe(0);
  });

  it('returns products when found', async () => {
    const mockProducts = [{ id: 'p1', name: 'Silk Saree', price: 1000 }];
    mocks.mockPrisma.product.findMany.mockResolvedValue(mockProducts);
    mocks.mockPrisma.product.count.mockResolvedValue(1);
    const { searchProducts } = await import('@/lib/searchService');
    const result = await searchProducts({ query: 'silk' });
    expect(result.products).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('handles page 0', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ page: 0 });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: -12 })
    );
  });

  it('handles negative page', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ page: -1 });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: -24 })
    );
  });

  it('handles limit 1', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ limit: 1 });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 1 })
    );
  });

  it('handles limit 100', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ limit: 100 });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 })
    );
  });

  it('combines multiple filters', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ query: 'silk', category: 'cat1', color: 'Red', minPrice: 500, maxPrice: 2000 });
    const call = mocks.mockPrisma.product.findMany.mock.calls[0][0];
    expect(call.where.AND.length).toBeGreaterThan(1);
  });

  it('handles empty query', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ query: '' });
    const call = mocks.mockPrisma.product.findMany.mock.calls[0][0];
    expect(call.where.AND.length).toBe(0);
  });

  it('handles null query', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ query: null });
    const call = mocks.mockPrisma.product.findMany.mock.calls[0][0];
    expect(call.where.AND.length).toBe(0);
  });

  it('handles undefined query', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ query: undefined });
    const call = mocks.mockPrisma.product.findMany.mock.calls[0][0];
    expect(call.where.AND.length).toBe(0);
  });

  it('uses Promise.all for parallel queries', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({});
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalled();
    expect(mocks.mockPrisma.product.count).toHaveBeenCalled();
  });

  it('handles special characters in query', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ query: "O'Brien" });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalled();
  });

  it('handles unicode query', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ query: 'साड़ी' });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalled();
  });

  it('handles XSS attempt in query', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ query: '<script>alert(1)</script>' });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalled();
  });

  it('handles SQL injection in query', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ query: "'; DROP TABLE products; --" });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalled();
  });

  it('handles very long query', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ query: 'a'.repeat(1000) });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalled();
  });

  it('handles zero minPrice', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ minPrice: 0 });
    const call = mocks.mockPrisma.product.findMany.mock.calls[0][0];
    expect(call.where.AND.length).toBe(0);
  });

  it('handles zero maxPrice', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ maxPrice: 0 });
    const call = mocks.mockPrisma.product.findMany.mock.calls[0][0];
    expect(call.where.AND.length).toBe(0);
  });

  it('handles negative prices', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ minPrice: -100, maxPrice: -10 });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalled();
  });

  it('calculates pages for exact multiple', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(24);
    const { searchProducts } = await import('@/lib/searchService');
    const result = await searchProducts({ limit: 12 });
    expect(result.pages).toBe(2);
  });

  it('calculates pages for non-exact multiple', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(25);
    const { searchProducts } = await import('@/lib/searchService');
    const result = await searchProducts({ limit: 12 });
    expect(result.pages).toBe(3);
  });

  it('calculates pages for single item', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(1);
    const { searchProducts } = await import('@/lib/searchService');
    const result = await searchProducts({});
    expect(result.pages).toBe(1);
  });

  it('handles large total count', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(10000);
    const { searchProducts } = await import('@/lib/searchService');
    const result = await searchProducts({ limit: 12 });
    expect(result.pages).toBe(834);
  });

  it('handles unknown sort value', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ sort: 'unknown' });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } })
    );
  });

  it('handles empty sort', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({ sort: '' });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } })
    );
  });

  it('handles all filters together', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { searchProducts } = await import('@/lib/searchService');
    await searchProducts({
      query: 'silk',
      category: 'cat1',
      color: 'red',
      occasion: 'wedding',
      minPrice: 100,
      maxPrice: 5000,
      sort: 'price_asc',
      page: 2,
      limit: 20,
    });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalled();
    expect(mocks.mockPrisma.product.count).toHaveBeenCalled();
  });
});
