// /app/api/orders/[id]/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { OrderStatus, OrderItemStatus } from "@prisma/client";
import { getUserFromToken } from "@/app/lib/getUserFromToken";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1️⃣ Authenticate the user
    const decodedUser = await getUserFromToken(req);
    if (!decodedUser) {
      console.log("❌ [CANCEL_ORDER] Unauthorized attempt.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = decodedUser.id;
    const orderId = params.id;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is missing." }, { status: 400 });
    }

    // 2️⃣ Find order with orderItems (for restocking)
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        status: OrderStatus.PENDING, // can only cancel pending orders
      },
      include: {
        orderItems: true, // needed for stock update
      },
    });

    if (!order) {
      console.log(`⚠️ [CANCEL_ORDER] Order ${orderId} not found or cannot be cancelled.`);
      return NextResponse.json(
        { error: "Order not found or cannot be cancelled." },
        { status: 404 }
      );
    }

    // 3️⃣ Perform transaction: cancel order + restore stock
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Restore stock for each product in this order
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // Update order status
      const cancelledOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
        },
        include: {
          orderItems: true,
        },
      });

      // Update each order item status
      await tx.orderItem.updateMany({
        where: { orderId },
        data: { status: OrderItemStatus.CANCELLED },
      });

      return cancelledOrder;
    });

    console.log(`✅ [CANCEL_ORDER] Order ${orderId} cancelled successfully and stock restored.`);
    return NextResponse.json({
      success: true,
      message: "Order cancelled and product stock restored.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("❌ [CANCEL_ORDER_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error while cancelling order." },
      { status: 500 }
    );
  }
}
