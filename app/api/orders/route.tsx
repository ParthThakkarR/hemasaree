import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { getUserFromToken } from "@lib/getUserFromToken";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getUserFromToken(req);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
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

    const enrichedOrders = orders.map((order) => ({
      ...order,
      user: { firstName: user.firstName, email: user.email },
    }));

    return NextResponse.json({ orders: enrichedOrders });
  } catch (error: any) {
    console.error("[GET_ORDERS_ERROR]", error.message);
    return NextResponse.json(
      { error: error.message || "Server error while fetching orders" },
      { status: 500 }
    );
  }
}

