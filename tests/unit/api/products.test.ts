import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as productsRoute } from '@/app/api/products/route';
import { ProductService } from '@/lib/services/productService';
import { ProductQuerySchema } from '@/app/lib/validators';
import { NextRequest } from 'next/server';

vi.mock('@/lib/services/productService', () => ({
  ProductService: {
    getProducts: vi.fn(),
  },
}));

vi.mock('@/app/lib/validators', () => ({
  ProductQuerySchema: {
    safeParse: vi.fn(),
  },
}));

describe('Products API Route', () => {
  const mockGetProducts = vi.mocked(ProductService.getProducts);
  const mockSafeParse = vi.mocked(ProductQuerySchema.safeParse);

  let mockReq: NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {
      nextUrl: new URL('http://localhost:3000/api/products'),
    } as unknown as NextRequest;
  });

  it('should fetch from service with valid params', async () => {
    mockGetProducts.mockResolvedValue({
      products: [{ id: 'p1', name: 'Test Product' }],
      total: 1,
      pages: 1,
    });
    mockSafeParse.mockReturnValue({
      success: true,
      data: { page: 1, limit: 12 },
    });

    const res = await productsRoute(mockReq);

    expect(mockGetProducts).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it('should validate pagination parameters', async () => {
    mockSafeParse.mockReturnValue({
      success: false,
      error: { issues: [{ message: 'Invalid page' }] },
    } as any);

    const res = await productsRoute(mockReq);

    expect(mockGetProducts).not.toHaveBeenCalled();
    expect(res.status).toBe(400);
  });

  it('should extract filters from query parameters', async () => {
    mockSafeParse.mockReturnValue({
      success: true,
      data: { page: 1, limit: 12 },
    });
    mockGetProducts.mockResolvedValue({ products: [], total: 0, pages: 0 });

    const reqWithFilters = {
      nextUrl: new URL('http://localhost:3000/api/products?category=sarees&search=cotton&minPrice=100&maxPrice=2000&sortPrice=low'),
    } as unknown as NextRequest;

    const res = await productsRoute(reqWithFilters);

    expect(mockGetProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: 'sarees',
        search: 'cotton',
        minPrice: 100,
        maxPrice: 2000,
      }),
      expect.objectContaining({
        page: 1,
        limit: 12,
        sortBy: 'price',
        sortOrder: 'asc',
      })
    );
    expect(res.status).toBe(200);
  });

  it('should handle errors gracefully', async () => {
    mockSafeParse.mockReturnValue({
      success: true,
      data: { page: 1, limit: 12 },
    });
    mockGetProducts.mockRejectedValue(new Error('Database error'));

    const res = await productsRoute(mockReq);

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Failed to fetch products. Check query parameters.');
  });
});

