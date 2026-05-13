import { prisma } from '@app/lib/prisma';

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

  const sales = await prisma.order.groupBy({
    by: ['createdAt'],
    _sum: { totalAmount: true },
    where: {
      createdAt: { gte: startDate },
      status: 'DELIVERED',
    },
    orderBy: { createdAt: 'asc' },
  });

  return sales;
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

