import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        payment: true,
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                category: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    // Manually attach user info (optional) — prevents Prisma crash
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        let user = null;
        try {
          user = await prisma.user.findUnique({
            where: { id: order.userId },
            select: { firstName: true, email: true },
          });
        } catch {
          user = null;
        }
        return { ...order, user };
      })
    );

    return NextResponse.json({ orders: enrichedOrders });
  } catch (error: any) {
    console.error("[GET_ORDERS_ERROR]", error.message);
    return NextResponse.json(
      { error: error.message || "Server error while fetching orders" },
      { status: 500 }
    );
  }
}
