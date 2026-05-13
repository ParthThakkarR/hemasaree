import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { subDays, format } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const today = new Date();
    const startDate = subDays(today, 29); // last 30 days

    // Fetch orders from last 30 days
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: today,
        },
        status: { not: "CANCELLED" },
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
    });

    // Aggregate by day
    const dailyTotals: Record<string, { revenue: number; count: number }> = {};

    for (let i = 0; i < 30; i++) {
      const date = format(subDays(today, i), "yyyy-MM-dd");
      dailyTotals[date] = { revenue: 0, count: 0 };
    }

    orders.forEach((order) => {
      const date = format(order.createdAt, "yyyy-MM-dd");
      if (!dailyTotals[date]) dailyTotals[date] = { revenue: 0, count: 0 };
      dailyTotals[date].revenue += order.totalAmount;
      dailyTotals[date].count += 1;
    });

    // Prepare chart data
    const labels = Object.keys(dailyTotals).reverse();
    const revenueData = labels.map((d) => dailyTotals[d].revenue);
    const orderData = labels.map((d) => dailyTotals[d].count);

    return NextResponse.json({
      labels,
      revenueData,
      orderData,
    });
  } catch (err) {
    console.error("[SALES_ANALYTICS_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to fetch sales analytics" },
      { status: 500 }
    );
  }
}

