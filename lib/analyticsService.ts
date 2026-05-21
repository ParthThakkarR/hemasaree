import { prisma } from '@lib/prisma';

export const getDashboardStats = async () => {
  const [totalOrders, totalRevenue, totalUsers, totalProducts] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: 'DELIVERED' },
    }),
    prisma.user.count(),
    prisma.product.count(),
  ]);

  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    totalUsers,
    totalProducts,
  };
};

export const getSalesReport = async (days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate },
      status: 'DELIVERED',
    },
    select: {
      createdAt: true,
      totalAmount: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const dailySales: Record<string, number> = {};
  orders.forEach(order => {
    const dateKey = order.createdAt.toISOString().split('T')[0];
    dailySales[dateKey] = (dailySales[dateKey] || 0) + order.totalAmount;
  });

  return Object.entries(dailySales).map(([date, total]) => ({ date, total }));
};

export const getTopProducts = async (limit = 5) => {
  const topItems = await prisma.orderItem.groupBy({
    by: ['productId', 'productName'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: limit,
  });

  return topItems;
};

