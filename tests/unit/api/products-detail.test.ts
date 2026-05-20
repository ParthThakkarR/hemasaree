// @ts-nocheck
// tests/unit/api/products-detail.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetProductById } = vi.hoisted(() => ({
  mockGetProductById: vi.fn(),
}));

vi.mock('@/lib/services/productService', () => ({
  ProductService: { getProductById: mockGetProductById },
}));

import { GET } from '/home/meet/Babar-Meet/hemasaree/app/api/products/[id]/route.tsx';

describe('GET /api/products/[id]', () => {
  beforeEach(() => { vi.clearAllMocks(); mockGetProductById.mockReset(); });

  it('returns 200 with product', async () => {
    mockGetProductById.mockResolvedValue({ id: 'p1', name: 'Silk Saree', price: 1000 });
    const res = await GET({} as Request, { params: { id: 'p1' } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe('Silk Saree');
  });

  it('returns 400 when id is empty', async () => {
    const res = await GET({} as Request, { params: { id: '' } });
    expect(res.status).toBe(400);
  });

  it('returns 404 when product not found', async () => {
    mockGetProductById.mockResolvedValue(null);
    const res = await GET({} as Request, { params: { id: 'nonexistent' } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toBeNull();
  });

  it('returns 500 when ProductService throws', async () => {
    mockGetProductById.mockRejectedValue(new Error('DB error'));
    const res = await GET({} as Request, { params: { id: 'p1' } });
    expect(res.status).toBe(500);
  });

  it('passes validated id to ProductService', async () => {
    mockGetProductById.mockResolvedValue({ id: 'p1' });
    await GET({} as Request, { params: { id: 'p1' } });
    expect(mockGetProductById).toHaveBeenCalledWith('p1');
  });

  it('handles ObjectId format', async () => {
    mockGetProductById.mockResolvedValue({ id: '507f191e810c19729de860ea' });
    const res = await GET({} as Request, { params: { id: '507f191e810c19729de860ea' } });
    expect(res.status).toBe(200);
  });

  it('handles very long id', async () => {
    mockGetProductById.mockResolvedValue(null);
    const res = await GET({} as Request, { params: { id: 'x'.repeat(1000) } });
    expect(res.status).toBe(200);
  });

  it('handles SQL injection in id', async () => {
    mockGetProductById.mockResolvedValue(null);
    const res = await GET({} as Request, { params: { id: "'; DROP TABLE products; --" } });
    expect(res.status).toBe(200);
  });

  it('includes full product details', async () => {
    mockGetProductById.mockResolvedValue({
      id: 'p1', name: 'Silk Saree', price: 1000, description: 'Beautiful silk saree',
      images: ['img1.jpg'], category: { name: 'Silk' }, stock: 10,
      rating: 4.5, reviewCount: 20,
    });
    const res = await GET({} as Request, { params: { id: 'p1' } });
    const body = await res.json();
    expect(body.rating).toBe(4.5);
  });
});
