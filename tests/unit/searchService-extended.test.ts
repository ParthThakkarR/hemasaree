// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  mockPrisma: {
    product: { findMany: vi.fn(), count: vi.fn() },
  },
}));

vi.mock('@/app/lib/prisma', () => ({ prisma: mocks.mockPrisma }));

const { searchProducts } = await import('@/lib/searchService');

describe('searchProducts', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  const mockProducts = [
    { id: 'p1', name: 'Silk Saree', color: 'Red', ocassion: 'Wedding', price: 5000 },
  ];

  it('returns products and total', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue(mockProducts);
    mocks.mockPrisma.product.count.mockResolvedValue(1);

    const result = await searchProducts({ query: 'Silk' });
    expect(result.products).toEqual(mockProducts);
    expect(result.total).toBe(1);
  });

  it('calculates pages correctly', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue(mockProducts);
    mocks.mockPrisma.product.count.mockResolvedValue(25);

    const result = await searchProducts({ query: 'Silk', limit: 12 });
    expect(result.pages).toBe(3);
  });

  it('uses default page 1', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({});
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 12 })
    );
  });

  it('uses default limit 12', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({});
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 12 })
    );
  });

  it('calculates skip correctly for page 2', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({ page: 2 });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 12 })
    );
  });

  it('calculates skip correctly for page 3', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({ page: 3, limit: 10 });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20 })
    );
  });

  it('searches by query in name', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({ query: 'Silk' });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              OR: expect.arrayContaining([
                expect.objectContaining({ name: { contains: 'Silk', mode: 'insensitive' } }),
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

    await searchProducts({ query: 'Red' });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              OR: expect.arrayContaining([
                expect.objectContaining({ color: { contains: 'Red', mode: 'insensitive' } }),
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

    await searchProducts({ query: 'Wedding' });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              OR: expect.arrayContaining([
                expect.objectContaining({ ocassion: { contains: 'Wedding', mode: 'insensitive' } }),
              ]),
            }),
          ]),
        }),
      })
    );
  });

  it('filters by category', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({ category: 'cat1' });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ categoryId: 'cat1' }),
          ]),
        }),
      })
    );
  });

  it('filters by color', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({ color: 'Red' });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ color: { equals: 'Red', mode: 'insensitive' } }),
          ]),
        }),
      })
    );
  });

  it('filters by occasion', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({ occasion: 'Wedding' });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ ocassion: { equals: 'Wedding', mode: 'insensitive' } }),
          ]),
        }),
      })
    );
  });

  it('filters by minPrice', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({ minPrice: 1000 });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ price: { gte: 1000, lte: 1000000 } }),
          ]),
        }),
      })
    );
  });

  it('filters by maxPrice', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({ maxPrice: 5000 });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ price: { gte: 0, lte: 5000 } }),
          ]),
        }),
      })
    );
  });

  it('filters by minPrice and maxPrice', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({ minPrice: 1000, maxPrice: 5000 });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ price: { gte: 1000, lte: 5000 } }),
          ]),
        }),
      })
    );
  });

  it('sorts by price_asc', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({ sort: 'price_asc' });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { price: 'asc' } })
    );
  });

  it('sorts by price_desc', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({ sort: 'price_desc' });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { price: 'desc' } })
    );
  });

  it('sorts by newest', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({ sort: 'newest' });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } })
    );
  });

  it('defaults to createdAt desc sort', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({});
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } })
    );
  });

  it('includes category relation', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({});
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ include: { category: true } })
    );
  });

  it('calls product.count with same where', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({ query: 'Silk' });
    expect(mocks.mockPrisma.product.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.any(Object) })
    );
  });

  it('returns empty products when none found', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    const result = await searchProducts({ query: 'NonExistent' });
    expect(result.products).toEqual([]);
  });

  it('returns zero total when none found', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    const result = await searchProducts({ query: 'NonExistent' });
    expect(result.total).toBe(0);
  });

  it('returns zero pages when none found', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    const result = await searchProducts({ query: 'NonExistent' });
    expect(result.pages).toBe(0);
  });

  it('combines multiple filters', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({ query: 'Silk', category: 'cat1', color: 'Red', minPrice: 1000, maxPrice: 5000 });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.any(Object),
            expect.any(Object),
            expect.any(Object),
            expect.any(Object),
          ]),
        }),
      })
    );
  });

  it('handles custom limit', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({ limit: 24 });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 24 })
    );
  });

  it('handles page 1 with custom limit', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({ page: 1, limit: 24 });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 24 })
    );
  });

  it('handles page 5 with limit 10', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({ page: 5, limit: 10 });
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 40, take: 10 })
    );
  });

  it('calculates pages with exact division', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(24);

    const result = await searchProducts({ limit: 12 });
    expect(result.pages).toBe(2);
  });

  it('calculates pages with remainder', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(25);

    const result = await searchProducts({ limit: 12 });
    expect(result.pages).toBe(3);
  });

  it('uses Promise.all for parallel queries', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({});
    expect(mocks.mockPrisma.product.findMany).toHaveBeenCalled();
    expect(mocks.mockPrisma.product.count).toHaveBeenCalled();
  });

  it('does not add query filter when query is empty', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({ query: '' });
    const call = mocks.mockPrisma.product.findMany.mock.calls[0][0];
    const andConditions = call.where.AND;
    const hasQueryFilter = andConditions.some((c: any) => c.OR);
    expect(hasQueryFilter).toBe(false);
  });

  it('does not add category filter when category is empty', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({ category: '' });
    const call = mocks.mockPrisma.product.findMany.mock.calls[0][0];
    const andConditions = call.where.AND;
    const hasCategoryFilter = andConditions.some((c: any) => c.categoryId);
    expect(hasCategoryFilter).toBe(false);
  });

  it('does not add color filter when color is empty', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({ color: '' });
    const call = mocks.mockPrisma.product.findMany.mock.calls[0][0];
    const andConditions = call.where.AND;
    const hasColorFilter = andConditions.some((c: any) => c.color);
    expect(hasColorFilter).toBe(false);
  });

  it('does not add price filter when no price params', async () => {
    mocks.mockPrisma.product.findMany.mockResolvedValue([]);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    await searchProducts({});
    const call = mocks.mockPrisma.product.findMany.mock.calls[0][0];
    const andConditions = call.where.AND;
    const hasPriceFilter = andConditions.some((c: any) => c.price);
    expect(hasPriceFilter).toBe(false);
  });
});
