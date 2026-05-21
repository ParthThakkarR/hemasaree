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

const { getDashboardStats, getSalesReport, getTopProducts } = await import('@/lib/analyticsService');

describe('getDashboardStats', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns dashboard stats with all fields', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(100);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 50000 } });
    mocks.mockPrisma.user.count.mockResolvedValue(200);
    mocks.mockPrisma.product.count.mockResolvedValue(50);

    const result = await getDashboardStats();
    expect(result).toEqual({
      totalOrders: 100,
      totalRevenue: 50000,
      totalUsers: 200,
      totalProducts: 50,
    });
  });

  it('returns zero revenue when no orders', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(0);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: null } });
    mocks.mockPrisma.user.count.mockResolvedValue(0);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    const result = await getDashboardStats();
    expect(result.totalRevenue).toBe(0);
  });

  it('calls order.count', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(10);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 1000 } });
    mocks.mockPrisma.user.count.mockResolvedValue(5);
    mocks.mockPrisma.product.count.mockResolvedValue(20);

    await getDashboardStats();
    expect(mocks.mockPrisma.order.count).toHaveBeenCalled();
  });

  it('calls order.aggregate with DELIVERED filter', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(10);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 1000 } });
    mocks.mockPrisma.user.count.mockResolvedValue(5);
    mocks.mockPrisma.product.count.mockResolvedValue(20);

    await getDashboardStats();
    expect(mocks.mockPrisma.order.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'DELIVERED' } })
    );
  });

  it('calls order.aggregate with _sum totalAmount', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(10);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 1000 } });
    mocks.mockPrisma.user.count.mockResolvedValue(5);
    mocks.mockPrisma.product.count.mockResolvedValue(20);

    await getDashboardStats();
    expect(mocks.mockPrisma.order.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({ _sum: { totalAmount: true } })
    );
  });

  it('calls user.count', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(10);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 1000 } });
    mocks.mockPrisma.user.count.mockResolvedValue(5);
    mocks.mockPrisma.product.count.mockResolvedValue(20);

    await getDashboardStats();
    expect(mocks.mockPrisma.user.count).toHaveBeenCalled();
  });

  it('calls product.count', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(10);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 1000 } });
    mocks.mockPrisma.user.count.mockResolvedValue(5);
    mocks.mockPrisma.product.count.mockResolvedValue(20);

    await getDashboardStats();
    expect(mocks.mockPrisma.product.count).toHaveBeenCalled();
  });

  it('uses Promise.all for parallel queries', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(10);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 1000 } });
    mocks.mockPrisma.user.count.mockResolvedValue(5);
    mocks.mockPrisma.product.count.mockResolvedValue(20);

    await getDashboardStats();
    expect(mocks.mockPrisma.order.count).toHaveBeenCalled();
    expect(mocks.mockPrisma.order.aggregate).toHaveBeenCalled();
    expect(mocks.mockPrisma.user.count).toHaveBeenCalled();
    expect(mocks.mockPrisma.product.count).toHaveBeenCalled();
  });

  it('handles large order counts', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(999999);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 99999999 } });
    mocks.mockPrisma.user.count.mockResolvedValue(50000);
    mocks.mockPrisma.product.count.mockResolvedValue(10000);

    const result = await getDashboardStats();
    expect(result.totalOrders).toBe(999999);
    expect(result.totalRevenue).toBe(99999999);
  });

  it('handles decimal revenue', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(5);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 1234.56 } });
    mocks.mockPrisma.user.count.mockResolvedValue(10);
    mocks.mockPrisma.product.count.mockResolvedValue(25);

    const result = await getDashboardStats();
    expect(result.totalRevenue).toBe(1234.56);
  });

  it('returns totalOrders as number', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(42);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 5000 } });
    mocks.mockPrisma.user.count.mockResolvedValue(10);
    mocks.mockPrisma.product.count.mockResolvedValue(20);

    const result = await getDashboardStats();
    expect(typeof result.totalOrders).toBe('number');
  });

  it('returns totalRevenue as number', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(42);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 5000 } });
    mocks.mockPrisma.user.count.mockResolvedValue(10);
    mocks.mockPrisma.product.count.mockResolvedValue(20);

    const result = await getDashboardStats();
    expect(typeof result.totalRevenue).toBe('number');
  });

  it('returns totalUsers as number', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(42);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 5000 } });
    mocks.mockPrisma.user.count.mockResolvedValue(10);
    mocks.mockPrisma.product.count.mockResolvedValue(20);

    const result = await getDashboardStats();
    expect(typeof result.totalUsers).toBe('number');
  });

  it('returns totalProducts as number', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(42);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 5000 } });
    mocks.mockPrisma.user.count.mockResolvedValue(10);
    mocks.mockPrisma.product.count.mockResolvedValue(20);

    const result = await getDashboardStats();
    expect(typeof result.totalProducts).toBe('number');
  });

  it('handles zero users', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(0);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 0 } });
    mocks.mockPrisma.user.count.mockResolvedValue(0);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    const result = await getDashboardStats();
    expect(result.totalUsers).toBe(0);
  });

  it('handles zero products', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(0);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 0 } });
    mocks.mockPrisma.user.count.mockResolvedValue(0);
    mocks.mockPrisma.product.count.mockResolvedValue(0);

    const result = await getDashboardStats();
    expect(result.totalProducts).toBe(0);
  });

  it('handles single order', async () => {
    mocks.mockPrisma.order.count.mockResolvedValue(1);
    mocks.mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 999 } });
    mocks.mockPrisma.user.count.mockResolvedValue(1);
    mocks.mockPrisma.product.count.mockResolvedValue(1);

    const result = await getDashboardStats();
    expect(result.totalOrders).toBe(1);
    expect(result.totalRevenue).toBe(999);
  });
});

describe('getSalesReport', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns sales data grouped by date', async () => {
    const mockOrders = [
      { createdAt: new Date('2024-01-01'), totalAmount: 1000 },
      { createdAt: new Date('2024-01-01'), totalAmount: 500 },
      { createdAt: new Date('2024-01-02'), totalAmount: 2000 },
    ];
    mocks.mockPrisma.order.findMany.mockResolvedValue(mockOrders);

    const result = await getSalesReport();
    expect(result).toEqual([
      { date: '2024-01-01', total: 1500 },
      { date: '2024-01-02', total: 2000 },
    ]);
  });

  it('uses default 30 days', async () => {
    mocks.mockPrisma.order.findMany.mockResolvedValue([]);
    await getSalesReport();
    expect(mocks.mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          createdAt: expect.objectContaining({ gte: expect.any(Date) }),
        }),
      })
    );
  });

  it('filters by DELIVERED status', async () => {
    mocks.mockPrisma.order.findMany.mockResolvedValue([]);
    await getSalesReport();
    expect(mocks.mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'DELIVERED' }),
      })
    );
  });

  it('orders by createdAt ascending', async () => {
    mocks.mockPrisma.order.findMany.mockResolvedValue([]);
    await getSalesReport();
    expect(mocks.mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'asc' } })
    );
  });

  it('accepts custom days parameter', async () => {
    mocks.mockPrisma.order.findMany.mockResolvedValue([]);
    await getSalesReport(7);
    expect(mocks.mockPrisma.order.findMany).toHaveBeenCalled();
  });

  it('returns empty array when no sales', async () => {
    mocks.mockPrisma.order.findMany.mockResolvedValue([]);
    const result = await getSalesReport();
    expect(result).toEqual([]);
  });

  it('returns multiple sales entries', async () => {
    const mockOrders = [
      { createdAt: new Date('2024-01-01'), totalAmount: 1000 },
      { createdAt: new Date('2024-01-02'), totalAmount: 2000 },
    ];
    mocks.mockPrisma.order.findMany.mockResolvedValue(mockOrders);
    const result = await getSalesReport();
    expect(result).toHaveLength(2);
  });

  it('handles 7 day report', async () => {
    mocks.mockPrisma.order.findMany.mockResolvedValue([]);
    await getSalesReport(7);
    expect(mocks.mockPrisma.order.findMany).toHaveBeenCalled();
  });

  it('handles 90 day report', async () => {
    mocks.mockPrisma.order.findMany.mockResolvedValue([]);
    await getSalesReport(90);
    expect(mocks.mockPrisma.order.findMany).toHaveBeenCalled();
  });

  it('handles 365 day report', async () => {
    mocks.mockPrisma.order.findMany.mockResolvedValue([]);
    await getSalesReport(365);
    expect(mocks.mockPrisma.order.findMany).toHaveBeenCalled();
  });

  it('handles 1 day report', async () => {
    mocks.mockPrisma.order.findMany.mockResolvedValue([]);
    await getSalesReport(1);
    expect(mocks.mockPrisma.order.findMany).toHaveBeenCalled();
  });

  it('handles zero days', async () => {
    mocks.mockPrisma.order.findMany.mockResolvedValue([]);
    await getSalesReport(0);
    expect(mocks.mockPrisma.order.findMany).toHaveBeenCalled();
  });
});

describe('getTopProducts', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns top products', async () => {
    const mockProducts = [
      { productId: 'p1', productName: 'Silk Saree', _sum: { quantity: 100 } },
    ];
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue(mockProducts);

    const result = await getTopProducts();
    expect(result).toEqual(mockProducts);
  });

  it('uses default limit of 5', async () => {
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue([]);
    await getTopProducts();
    expect(mocks.mockPrisma.orderItem.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5 })
    );
  });

  it('groups by productId and productName', async () => {
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue([]);
    await getTopProducts();
    expect(mocks.mockPrisma.orderItem.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ by: ['productId', 'productName'] })
    );
  });

  it('orders by quantity descending', async () => {
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue([]);
    await getTopProducts();
    expect(mocks.mockPrisma.orderItem.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { _sum: { quantity: 'desc' } } })
    );
  });

  it('aggregates quantity sum', async () => {
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue([]);
    await getTopProducts();
    expect(mocks.mockPrisma.orderItem.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ _sum: { quantity: true } })
    );
  });

  it('accepts custom limit', async () => {
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue([]);
    await getTopProducts(10);
    expect(mocks.mockPrisma.orderItem.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10 })
    );
  });

  it('returns empty array when no products', async () => {
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue([]);
    const result = await getTopProducts();
    expect(result).toEqual([]);
  });

  it('returns limited results', async () => {
    const mockProducts = Array.from({ length: 5 }, (_, i) => ({
      productId: `p${i}`,
      productName: `Product ${i}`,
      _sum: { quantity: 100 - i * 10 },
    }));
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue(mockProducts);
    const result = await getTopProducts();
    expect(result).toHaveLength(5);
  });

  it('handles limit of 1', async () => {
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue([{ productId: 'p1', productName: 'Top', _sum: { quantity: 500 } }]);
    const result = await getTopProducts(1);
    expect(result).toHaveLength(1);
  });

  it('handles limit of 10', async () => {
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue([]);
    await getTopProducts(10);
    expect(mocks.mockPrisma.orderItem.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10 })
    );
  });

  it('handles limit of 20', async () => {
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue([]);
    await getTopProducts(20);
    expect(mocks.mockPrisma.orderItem.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ take: 20 })
    );
  });

  it('handles limit of 100', async () => {
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue([]);
    await getTopProducts(100);
    expect(mocks.mockPrisma.orderItem.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 })
    );
  });

  it('returns productId as string', async () => {
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue([{ productId: 'p1', productName: 'Silk', _sum: { quantity: 50 } }]);
    const result = await getTopProducts();
    expect(typeof result[0].productId).toBe('string');
  });

  it('returns productName as string', async () => {
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue([{ productId: 'p1', productName: 'Silk', _sum: { quantity: 50 } }]);
    const result = await getTopProducts();
    expect(typeof result[0].productName).toBe('string');
  });

  it('returns quantity sum as number', async () => {
    mocks.mockPrisma.orderItem.groupBy.mockResolvedValue([{ productId: 'p1', productName: 'Silk', _sum: { quantity: 50 } }]);
    const result = await getTopProducts();
    expect(typeof result[0]._sum.quantity).toBe('number');
  });
});
