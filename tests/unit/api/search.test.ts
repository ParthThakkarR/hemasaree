// @ts-nocheck
// tests/unit/api/search.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockSearchProducts } = vi.hoisted(() => ({
  mockSearchProducts: vi.fn(),
}));

vi.mock('@/lib/searchService', () => ({ searchProducts: mockSearchProducts }));

import { GET } from '/home/meet/Babar-Meet/hemasaree/app/api/search/route.ts';

const makeReq = (url: string) => ({ url } as unknown as Request);

describe('GET /api/search', () => {
  beforeEach(() => { vi.clearAllMocks(); mockSearchProducts.mockReset(); });

  it('returns 200 with search results', async () => {
    mockSearchProducts.mockResolvedValue({ products: [], total: 0, page: 1, limit: 12 });
    const res = await GET(makeReq('http://localhost:3000/api/search?q=silk'));
    expect(res.status).toBe(200);
  });

  it('passes query parameter to searchProducts', async () => {
    mockSearchProducts.mockResolvedValue({ products: [], total: 0 });
    await GET(makeReq('http://localhost:3000/api/search?q=silk+saree'));
    expect(mockSearchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'silk saree' })
    );
  });

  it('passes category filter', async () => {
    mockSearchProducts.mockResolvedValue({ products: [], total: 0 });
    await GET(makeReq('http://localhost:3000/api/search?category=silk'));
    expect(mockSearchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'silk' })
    );
  });

  it('passes color filter', async () => {
    mockSearchProducts.mockResolvedValue({ products: [], total: 0 });
    await GET(makeReq('http://localhost:3000/api/search?color=red'));
    expect(mockSearchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'red' })
    );
  });

  it('passes occasion filter', async () => {
    mockSearchProducts.mockResolvedValue({ products: [], total: 0 });
    await GET(makeReq('http://localhost:3000/api/search?occasion=wedding'));
    expect(mockSearchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ occasion: 'wedding' })
    );
  });

  it('passes minPrice and maxPrice', async () => {
    mockSearchProducts.mockResolvedValue({ products: [], total: 0 });
    await GET(makeReq('http://localhost:3000/api/search?minPrice=500&maxPrice=5000'));
    expect(mockSearchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ minPrice: 500, maxPrice: 5000 })
    );
  });

  it('uses default minPrice 0 when not provided', async () => {
    mockSearchProducts.mockResolvedValue({ products: [], total: 0 });
    await GET(makeReq('http://localhost:3000/api/search'));
    expect(mockSearchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ minPrice: 0 })
    );
  });

  it('uses default maxPrice 1000000 when not provided', async () => {
    mockSearchProducts.mockResolvedValue({ products: [], total: 0 });
    await GET(makeReq('http://localhost:3000/api/search'));
    expect(mockSearchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ maxPrice: 1000000 })
    );
  });

  it('passes sort parameter', async () => {
    mockSearchProducts.mockResolvedValue({ products: [], total: 0 });
    await GET(makeReq('http://localhost:3000/api/search?sort=price_asc'));
    expect(mockSearchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ sort: 'price_asc' })
    );
  });

  it('passes page parameter', async () => {
    mockSearchProducts.mockResolvedValue({ products: [], total: 0 });
    await GET(makeReq('http://localhost:3000/api/search?page=3'));
    expect(mockSearchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ page: 3 })
    );
  });

  it('passes limit parameter', async () => {
    mockSearchProducts.mockResolvedValue({ products: [], total: 0 });
    await GET(makeReq('http://localhost:3000/api/search?limit=24'));
    expect(mockSearchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 24 })
    );
  });

  it('uses default page 1', async () => {
    mockSearchProducts.mockResolvedValue({ products: [], total: 0 });
    await GET(makeReq('http://localhost:3000/api/search'));
    expect(mockSearchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1 })
    );
  });

  it('uses default limit 12', async () => {
    mockSearchProducts.mockResolvedValue({ products: [], total: 0 });
    await GET(makeReq('http://localhost:3000/api/search'));
    expect(mockSearchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 12 })
    );
  });

  it('passes null query when q param missing', async () => {
    mockSearchProducts.mockResolvedValue({ products: [], total: 0 });
    await GET(makeReq('http://localhost:3000/api/search'));
    expect(mockSearchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ query: null })
    );
  });

  it('combines multiple filters', async () => {
    mockSearchProducts.mockResolvedValue({ products: [], total: 0 });
    await GET(makeReq('http://localhost:3000/api/search?q=silk&category=silk&color=red&occasion=wedding&minPrice=500&maxPrice=5000&sort=price_asc&page=2&limit=24'));
    expect(mockSearchProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'silk',
        category: 'silk',
        color: 'red',
        occasion: 'wedding',
        minPrice: 500,
        maxPrice: 5000,
        sort: 'price_asc',
        page: 2,
        limit: 24,
      })
    );
  });

  it('returns search results with products', async () => {
    mockSearchProducts.mockResolvedValue({
      products: [{ id: 'p1', name: 'Silk Saree' }],
      total: 1,
      page: 1,
      limit: 12,
    });
    const res = await GET(makeReq('http://localhost:3000/api/search?q=silk'));
    const body = await res.json();
    expect(body.products).toHaveLength(1);
  });

  it('returns 500 when searchProducts throws', async () => {
    mockSearchProducts.mockRejectedValue(new Error('Search failed'));
    const res = await GET(makeReq('http://localhost:3000/api/search?q=test'));
    expect(res.status).toBe(500);
  });

  it('handles empty query string', async () => {
    mockSearchProducts.mockResolvedValue({ products: [], total: 0 });
    const res = await GET(makeReq('http://localhost:3000/api/search?q='));
    expect(res.status).toBe(200);
  });

  it('handles invalid page parameter (NaN)', async () => {
    mockSearchProducts.mockResolvedValue({ products: [], total: 0 });
    await GET(makeReq('http://localhost:3000/api/search?page=abc'));
    expect(mockSearchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ page: NaN })
    );
  });

  it('handles invalid limit parameter (NaN)', async () => {
    mockSearchProducts.mockResolvedValue({ products: [], total: 0 });
    await GET(makeReq('http://localhost:3000/api/search?limit=xyz'));
    expect(mockSearchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ limit: NaN })
    );
  });
});
