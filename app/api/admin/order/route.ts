// /app/api/admin/orders/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { OrderStatus, OrderItemStatus } from '@prisma/client';
import { verifyAdminToken } from '@/app/utils/auth';
import { AdminOrderUpdateSchema } from '@/app/lib/validators';

// --------------------------------------------------
// GET /api/admin/orders → Fetch all orders
// --------------------------------------------------
export async function GET(req: Request) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin access required' },
      { status: 401 }
    );
  }

  try {
    const ordersFromDb = await prisma.order.findMany({
      include: {
        user: { select: { firstName: true, email: true } },
        orderItems: {
          include: { product: { select: { name: true, images: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedOrders = ordersFromDb.map((order) => ({
      ...order,
      orderItems: order.orderItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        status: item.status,
        returnReason: item.returnReason,
        returnNotes: item.returnNotes,
        returnImage: item.returnImage,
        productName: item.product?.name || item.productName,
        productImage: item.product?.images?.[0] || item.productImage,
      })),
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error('[ADMIN_ORDERS_GET_ERROR]', error);
    return NextResponse.json(
      { error: 'Server error while fetching orders' },
      { status: 500 }
    );
  }
}

// --------------------------------------------------
// PUT /api/admin/orders → Update order or return status
// --------------------------------------------------
export async function PUT(req: Request) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin access required' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const validation = AdminOrderUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // --------------------------------------------------
    // Case 1: Update entire order status
    // --------------------------------------------------
    if (data.action === 'UPDATE_ORDER_STATUS') {
      const { orderId, status } = data;

      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { status },
        }),
        prisma.orderItem.updateMany({
          where: {
            orderId,
            status: {
              notIn: [
                OrderItemStatus.RETURN_REQUESTED,
                OrderItemStatus.RETURN_APPROVED,
                OrderItemStatus.RETURNED,
                OrderItemStatus.RETURN_DECLINED,
              ],
            },
          },
          data: { status: status as OrderItemStatus },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: `Order ${orderId} updated to ${status}`,
      });
    }

    // --------------------------------------------------
    // Case 2: Update specific item's return status
    // --------------------------------------------------
    if (data.action === 'UPDATE_RETURN_STATUS') {
      const { orderItemId, newStatus } = data;

      const orderItem = await prisma.orderItem.findUnique({
        where: { id: orderItemId },
        include: { product: true, order: true },
      });

      if (!orderItem) {
        return NextResponse.json({ error: 'Order item not found' }, { status: 404 });
      }

      // ✅ Use a transaction for atomic update + stock restoration
      const updatedItem = await prisma.$transaction(async (tx) => {
        // 1️⃣ If admin approved return → restore stock
        if (newStatus === OrderItemStatus.RETURN_APPROVED) {
          await tx.product.update({
            where: { id: orderItem.productId },
            data: { stock: { increment: orderItem.quantity } },
          });
        }

        // 2️⃣ Update item status
        const updated = await tx.orderItem.update({
          where: { id: orderItemId },
          data: { status: newStatus },
        });

        // 3️⃣ If all items in order are now RETURN_APPROVED or RETURNED → mark order RETURNED
        const allItems = await tx.orderItem.findMany({
          where: { orderId: orderItem.orderId },
        });

        const allReturned = allItems.every(
          (item) =>
            item.status === OrderItemStatus.RETURN_APPROVED ||
            item.status === OrderItemStatus.RETURNED
        );

        if (allReturned) {
          await tx.order.update({
            where: { id: orderItem.orderId },
            data: { status: OrderStatus.RETURNED },
          });
        }

        return updated;
      });

      return NextResponse.json({
        success: true,
        message:
          newStatus === OrderItemStatus.RETURN_APPROVED
            ? 'Return approved and stock restored'
            : `Item return status updated to ${newStatus}`,
        item: updatedItem,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[ADMIN_ORDERS_PUT_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to perform update' },
      { status: 500 }
    );
  }
}
