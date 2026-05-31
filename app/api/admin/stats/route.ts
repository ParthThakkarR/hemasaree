import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { verifyAdminToken } from "@utils/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const adminId = await verifyAdminToken(req);
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Basic Counts
    const totalProducts = await prisma.product.count({ where: { isDeleted: false } });
    const lowStockCount = await prisma.product.count({
      where: { stock: { lt: 5 }, isDeleted: false }
    });

    // 2. Revenue & Orders
    const revenueAggregate = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      _count: true,
      where: { status: { not: "CANCELLED" } }
    });
    const totalRevenue = revenueAggregate._sum.totalAmount || 0;
    const totalOrders = revenueAggregate._count;

    // 3. Inventory Value
    const inventoryAggregate = await prisma.product.aggregate({
      _sum: { price: true },
      where: { isDeleted: false }
    });
    const allProducts = await prisma.product.findMany({
      where: { isDeleted: false },
      select: { price: true, stock: true }
    });
    const inventoryValue = allProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);

    // 4. Visitors (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const visitorCount = await prisma.analyticsEvent.count({
      where: {
        eventName: "page_view",
        createdAt: { gte: sevenDaysAgo }
      }
    });

    // 5. Recent Orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, email: true } }
      }
    });

    // 6. Top Products
    const topProductsAggregate = await prisma.orderItem.groupBy({
      by: ['productId', 'productName'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const topProducts = topProductsAggregate.map(item => ({
      name: item.productName,
      count: item._sum.quantity || 0,
    }));

    return NextResponse.json({
      totalProducts,
      lowStockCount,
      totalRevenue,
      totalOrders,
      inventoryValue,
      visitorCount,
      recentOrders,
      topProducts
    });
  } catch (error) {
    console.error("[ADMIN_STATS_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}


