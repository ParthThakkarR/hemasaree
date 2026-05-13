import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { verifyAdminToken } from "@/app/utils/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const adminId = await verifyAdminToken(req);
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Basic Counts
    const totalProducts = await prisma.product.count();
    const lowStockCount = await prisma.product.count({
      where: { stock: { lt: 5 } }
    });

    // 2. Revenue & Orders
    const orders = await prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { totalAmount: true }
    });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;

    // 3. Inventory Value
    const products = await prisma.product.findMany({
      select: { price: true, stock: true }
    });
    const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

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
    const orderItems = await prisma.orderItem.findMany({
       select: { productId: true, quantity: true, productName: true }
    });
    
    const productSales: Record<string, { name: string, count: number }> = {};
    orderItems.forEach(item => {
        if (!productSales[item.productId]) {
            productSales[item.productId] = { name: item.productName, count: 0 };
        }
        productSales[item.productId].count += item.quantity;
    });

    const topProducts = Object.values(productSales)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

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

