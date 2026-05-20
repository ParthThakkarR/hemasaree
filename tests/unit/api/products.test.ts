import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockCacheGet, mockCacheSet, mockNextResponseJson, mockSafeParse, mockGetProducts } = vi.hoisted(() => ({
  mockCacheGet: vi.fn(),
  mockCacheSet: vi.fn(),
  mockNextResponseJson: vi.fn((data, init) => ({
    data,
    status: init?.status || 200,
    json: async () => data,
  })),
  mockSafeParse: vi.fn(),
  mockGetProducts: vi.fn(),
}));

// Mock all dependencies at the top level (hoisted)
vi.mock('@lib/validators', () => ({
  ProductQuerySchema: {
    safeParse: mockSafeParse,
  },
}));

vi.mock('@/lib/services/productService', () => ({
  ProductService: {
    getProducts: mockGetProducts,
  },
}));

vi.mock('@/app/lib/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

vi.mock('@/lib/cache', () => ({
  cache: {
    get: mockCacheGet,
    set: mockCacheSet,
  },
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: mockNextResponseJson,
  },
}));

// Import the route handler after mocking
import { GET as productsRoute } from '@/app/api/products/route';

describe('Products API Route', () => {
  const mockReq = {
    nextUrl: new URL('http://localhost:3000/api/products'),
  } as unknown as import('next/server').NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCacheGet.mockReset();
    mockCacheSet.mockReset();
    mockSafeParse.mockReset();
    mockGetProducts.mockReset();
  });

  it('should return cached data when available', async () => {
    const cachedData = { products: [], pagination: { totalProducts: 0 } };
    mockCacheGet.mockResolvedValue(cachedData);

    const res = await productsRoute(mockReq);

    expect(mockCacheGet).toHaveBeenCalledWith('products:' + mockReq.nextUrl.search);
    expect(res.status).toBe(200);
  });

  it('should fetch from database when cache miss', async () => {
    mockCacheGet.mockResolvedValue(null);
    mockGetProducts.mockResolvedValue({
      products: [{ id: 'p1', name: 'Test Product' }],
      total: 1,
      pages: 1,
    });
    mockSafeParse.mockReturnValue({
      success: true,
      data: { page: '1', limit: '12' },
    });

    const res = await productsRoute(mockReq);

    expect(mockGetProducts).toHaveBeenCalled();
    expect(mockCacheSet).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it('should validate pagination parameters', async () => {
    mockCacheGet.mockResolvedValue(null);
    mockSafeParse.mockReturnValue({
      success: false,
      error: { issues: [{ message: 'Invalid page' }] },
    });

    const res = await productsRoute(mockReq);

    expect(mockGetProducts).not.toHaveBeenCalled();
    expect(res.status).toBe(400);
  });

  it('should extract filters from query parameters', async () => {
    mockCacheGet.mockResolvedValue(null);
    mockSafeParse.mockReturnValue({
      success: true,
      data: { page: 1, limit: 12 },
    });
    mockGetProducts.mockResolvedValue({ products: [], total: 0, pages: 0 });

    const reqWithFilters = {
      nextUrl: new URL('http://localhost:3000/api/products?category=sarees&search=cotton&minPrice=100&maxPrice=2000&sortPrice=asc'),
    } as unknown as import('next/server').NextRequest;

    const res = await productsRoute(reqWithFilters);

    expect(mockGetProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: 'sarees',
        search: 'cotton',
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

  it('should handle cache storage after fetch', async () => {
    mockCacheGet.mockResolvedValue(null);
    mockGetProducts.mockResolvedValue({
      products: [{ id: 'p1' }],
      total: 1,
      pages: 1,
    });
    mockSafeParse.mockReturnValue({
      success: true,
      data: { page: '1', limit: '12' },
    });

    const res = await productsRoute(mockReq);

    expect(mockCacheSet).toHaveBeenCalledWith(
      'products:' + mockReq.nextUrl.search,
      expect.objectContaining({
        products: [{ id: 'p1' }],
        pagination: expect.any(Object),
        updatedAt: expect.any(String),
      }),
      expect.any(Number)
    );
    expect(res.status).toBe(200);
  });

  it('should handle errors gracefully', async () => {
    mockCacheGet.mockResolvedValue(null);
    mockGetProducts.mockRejectedValue(new Error('Database error'));
    mockSafeParse.mockReturnValue({
      success: true,
      data: { page: '1', limit: '12' },
    });

    const res = await productsRoute(mockReq);

    expect(res.status).toBe(500);
  });
});
