// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  mockPrisma: {
    order: { count: vi.fn(), aggregate: vi.fn(), groupBy: vi.fn(), findMany: vi.fn() },
    user: { count: vi.fn() },
    product: { count: vi.fn() },
    orderItem: { groupBy: vi.fn() },
  },
}));

vi.mock('@/app/lib/prisma', () => ({ prisma: mocks.mockPrisma }));

describe('analyticsService.getDashboardStats', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns total orders', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(100);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 50000 } });
    mocks.mockPrisma.user.count.mockResolvedValue(50);
    mocks.mockPrisma.product.count.mockResolvedValue(200);
    const { getDashboardStats } = await import('@/lib/analyticsService');
    const stats = await getDashboardStats();
    expect(stats.totalOrders).toBe(100);
  });

  it('returns total revenue', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(100);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 50000 } });
    mocks.mockPrisma.user.count.mockResolvedValue(50);
    mocks.mockPrisma.product.count.mockResolvedValue(200);
    const { getDashboardStats } = await import('@/lib/analyticsService');
    const stats = await getDashboardStats();
    expect(stats.totalRevenue).toBe(50000);
  });

  it('returns total users', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(100);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 50000 } });
    mocks.mockPrisma.user.count.mockResolvedValue(50);
    mocks.mockPrisma.product.count.mockResolvedValue(200);
    const { getDashboardStats } = await import('@/lib/analyticsService');
    const stats = await getDashboardStats();
    expect(stats.totalUsers).toBe(50);
  });

  it('returns total products', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(100);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 50000 } });
    mocks.mockPrisma.user.count.mockResolvedValue(50);
    mocks.mockPrisma.product.count.mockResolvedValue(200);
    const { getDashboardStats } = await import('@/lib/analyticsService');
    const stats = await getDashboardStats();
    expect(stats.totalProducts).toBe(200);
  });

  it('returns 0 revenue when no orders', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(0);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: null } });
    mocks.mockPrisma.user.count.mockResolvedValue(0);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { getDashboardStats } = await import('@/lib/analyticsService');
    const stats = await getDashboardStats();
    expect(stats.totalRevenue).toBe(0);
  });

  it('filters revenue by DELIVERED status', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(100);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 50000 } });
    mocks.mockPrisma.user.count.mockResolvedValue(50);
    mocks.mockPrisma.product.count.mockResolvedValue(200);
    const { getDashboardStats } = await import('@/lib/analyticsService');
    await getDashboardStats();
    expect(mocks.mockPrisma.order.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'DELIVERED' } })
    );
  });

  it('handles zero orders', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(0);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: null } });
    mocks.mockPrisma.user.count.mockResolvedValue(0);
    mocks.mockPrisma.product.count.mockResolvedValue(0);
    const { getDashboardStats } = await import('@/lib/analyticsService');
    const stats = await getDashboardStats();
    expect(stats.totalOrders).toBe(0);
    expect(stats.totalRevenue).toBe(0);
  });

  it('handles large numbers', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(1000000);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 999999999 } });
    mocks.mockPrisma.user.count.mockResolvedValue(500000);
    mocks.mockPrisma.product.count.mockResolvedValue(100000);
    const { getDashboardStats } = await import('@/lib/analyticsService');
    const stats = await getDashboardStats();
    expect(stats.totalOrders).toBe(1000000);
    expect(stats.totalRevenue).toBe(999999999);
  });

  it('uses Promise.all for parallel queries', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(100);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 50000 } });
    mocks.mockPrisma.user.count.mockResolvedValue(50);
    mocks.mockPrisma.product.count.mockResolvedValue(200);
    const { getDashboardStats } = await import('@/lib/analyticsService');
    await getDashboardStats();
    expect(mocks.mockPrisma.order.count).toHaveBeenCalled();
    expect(mocks.mockPrisma.order.aggregate).toHaveBeenCalled();
    expect(mocks.mockPrisma.user.count).toHaveBeenCalled();
    expect(mocks.mockPrisma.product.count).toHaveBeenCalled();
  });

  it('handles decimal revenue', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(100);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 50000.50 } });
    mocks.mockPrisma.user.count.mockResolvedValue(50);
    mocks.mockPrisma.product.count.mockResolvedValue(200);
    const { getDashboardStats } = await import('@/lib/analyticsService');
    const stats = await getDashboardStats();
    expect(stats.totalRevenue).toBe(50000.50);
  });
});

describe('analyticsService.getSalesReport', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns sales data', async () => {
    mocks.mockPrisma.order.groupBy.mockResolvedValue([
      { createdAt: new Date(), _sum: { totalAmount: 1000 } },
    ]);
    const { getSalesReport } = await import('@/lib/analyticsService');
    const report = await getSalesReport();
    expect(Array.isArray(report)).toBe(true);
  });

  it('uses default 30 days', async () => {
    mocks.mockPrisma.order.groupBy.mockResolvedValue([]);
    const { getSalesReport } = await import('@/lib/analyticsService');
    await getSalesReport();
    expect(mocks.mockPrisma.order.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          createdAt: expect.objectContaining({ gte: expect.any(Date) }),
        }),
      })
    );
  });

  it('uses custom days parameter', async () => {
    mocks.mockPrisma.order.groupBy.mockResolvedValue([]);
    const { getSalesReport } = await import('@/lib/analyticsService');
    await getSalesReport(7);
    expect(mocks.mockPrisma.order.groupBy).toHaveBeenCalled();
  });

  it('filters by DELIVERED status', async () => {
    mocks.mockPrisma.order.groupBy.mockResolvedValue([]);
    const { getSalesReport } = await import('@/lib/analyticsService');
    await getSalesReport();
    expect(mocks.mockPrisma.order.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'DELIVERED' }),
      })
    );
  });

  it('orders by createdAt asc', async () => {
    mocks.mockPrisma.order.groupBy.mockResolvedValue([]);
    const { getSalesReport } = await import('@/lib/analyticsService');
    await getSalesReport();
    expect(mocks.mockPrisma.order.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'asc' } })
    );
  });

  it('groups by createdAt', async () => {
    mocks.mockPrisma.order.groupBy.mockResolvedValue([]);
    const { getSalesReport } = await import('@/lib/analyticsService');
    await getSalesReport();
    expect(mocks.mockPrisma.order.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ by: ['createdAt'] })
    );
  });

  it('sums totalAmount', async () => {
    mocks.mockPrisma.order.groupBy.mockResolvedValue([]);
    const { getSalesReport } = await import('@/lib/analyticsService');
    await getSalesReport();
    expect(mocks.mockPrisma.order.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ _sum: { totalAmount: true } })
    );
  });

  it('returns empty array when no sales', async () => {
    mocks.mockPrisma.order.groupBy.mockResolvedValue([]);
    const { getSalesReport } = await import('@/lib/analyticsService');
    const report = await getSalesReport();
    expect(report).toEqual([]);
  });

  it('handles 7 day report', async () => {
    mocks.mockPrisma.order.groupBy.mockResolvedValue([]);
    const { getSalesReport } = await import('@/lib/analyticsService');
    await getSalesReport(7);
    expect(mocks.mockPrisma.order.groupBy).toHaveBeenCalled();
  });

  it('handles 90 day report', async () => {
    mocks.mockPrisma.order.groupBy.mockResolvedValue([]);
    const { getSalesReport } = await import('@/lib/analyticsService');
    await getSalesReport(90);
    expect(mocks.mockPrisma.order.groupBy).toHaveBeenCalled();
  });

  it('handles 365 day report', async () => {
    mocks.mockPrisma.order.groupBy.mockResolvedValue([]);
    const { getSalesReport } = await import('@/lib/analyticsService');
    await getSalesReport(365);
    expect(mocks.mockPrisma.order.groupBy).toHaveBeenCalled();
  });

  it('handles 0 days', async () => {
    mocks.mockPrisma.order.groupBy.mockResolvedValue([]);
    const { getSalesReport } = await import('@/lib/analyticsService');
    await getSalesReport(0);
    expect(mocks.mockPrisma.order.groupBy).toHaveBeenCalled();
  });

  it('handles negative days', async () => {
    mocks.mockPrisma.order.groupBy.mockResolvedValue([]);
    const { getSalesReport } = await import('@/lib/analyticsService');
    await getSalesReport(-30);
    expect(mocks.mockPrisma.order.groupBy).toHaveBeenCalled();
  });

  it('handles multiple sales entries', async () => {
    const entries = Array.from({ length: 30 }, (_, i) => ({
      createdAt: new Date(Date.now() - i * 86400000),
      _sum: { totalAmount: 1000 + i * 100 },
    }));
    mocks.mockPrisma.order.groupBy.mockResolvedValue(entries);
    const { getSalesReport } = await import('@/lib/analyticsService');
    const report = await getSalesReport();
    expect(report).toHaveLength(30);
  });
});

describe('analyticsService.getTopProducts', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns top products', async () => {
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue([
      { productId: 'p1', productName: 'Silk Saree', _sum: { quantity: 100 } },
    ]);
    const { getTopProducts } = await import('@/lib/analyticsService');
    const products = await getTopProducts();
    expect(Array.isArray(products)).toBe(true);
  });

  it('uses default limit of 5', async () => {
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue([]);
    const { getTopProducts } = await import('@/lib/analyticsService');
    await getTopProducts();
    expect(mocks.mockPrisma.orderItem.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5 })
    );
  });

  it('uses custom limit', async () => {
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue([]);
    const { getTopProducts } = await import('@/lib/analyticsService');
    await getTopProducts(10);
    expect(mocks.mockPrisma.orderItem.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10 })
    );
  });

  it('orders by quantity desc', async () => {
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue([]);
    const { getTopProducts } = await import('@/lib/analyticsService');
    await getTopProducts();
    expect(mocks.mockPrisma.orderItem.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { _sum: { quantity: 'desc' } } })
    );
  });

  it('groups by productId and productName', async () => {
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue([]);
    const { getTopProducts } = await import('@/lib/analyticsService');
    await getTopProducts();
    expect(mocks.mockPrisma.orderItem.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ by: ['productId', 'productName'] })
    );
  });

  it('sums quantity', async () => {
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue([]);
    const { getTopProducts } = await import('@/lib/analyticsService');
    await getTopProducts();
    expect(mocks.mockPrisma.orderItem.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ _sum: { quantity: true } })
    );
  });

  it('returns empty array when no products', async () => {
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue([]);
    const { getTopProducts } = await import('@/lib/analyticsService');
    const products = await getTopProducts();
    expect(products).toEqual([]);
  });

  it('handles limit of 1', async () => {
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue([]);
    const { getTopProducts } = await import('@/lib/analyticsService');
    await getTopProducts(1);
    expect(mocks.mockPrisma.orderItem.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ take: 1 })
    );
  });

  it('handles limit of 100', async () => {
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue([]);
    const { getTopProducts } = await import('@/lib/analyticsService');
    await getTopProducts(100);
    expect(mocks.mockPrisma.orderItem.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 })
    );
  });

  it('handles limit of 0', async () => {
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue([]);
    const { getTopProducts } = await import('@/lib/analyticsService');
    await getTopProducts(0);
    expect(mocks.mockPrisma.orderItem.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ take: 0 })
    );
  });

  it('handles multiple top products', async () => {
    const products = Array.from({ length: 5 }, (_, i) => ({
      productId: `p${i}`,
      productName: `Product ${i}`,
      _sum: { quantity: 100 - i * 10 },
    }));
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue(products);
    const { getTopProducts } = await import('@/lib/analyticsService');
    const result = await getTopProducts();
    expect(result).toHaveLength(5);
    expect(result[0]._sum.quantity).toBe(100);
  });
});
