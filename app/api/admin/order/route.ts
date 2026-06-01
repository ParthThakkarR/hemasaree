// /app/api/admin/orders/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { OrderStatus } from '@prisma/client';
import { verifyAdminToken } from '@utils/auth';
import { AdminOrderUpdateSchema } from '@lib/validators';
import { OrderService } from '@/lib/services/orderService';
import { handleApiError } from '@/lib/errors';

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

     if (data.action === 'UPDATE_ORDER_STATUS') {
       const { orderId, status } = data;
       await OrderService.updateOrderStatus(orderId, status);

       // Queue order status email
       try {
         const { emailQueue } = await import('@/lib/email/emailQueue');
         const order = await prisma.order.findUnique({
           where: { id: orderId },
           include: { user: true },
         });
         if (order && order.user?.email) {
           if (status === 'SHIPPED') {
             await emailQueue.add('order_shipped', {
               type: 'order_shipped',
               data: { to: order.user.email, order, trackingInfo: 'Available in your orders' },
             });
           } else if (status === 'DELIVERED') {
             await emailQueue.add('order_delivered', {
               type: 'order_delivered',
               data: { to: order.user.email, order },
             });
           }
         }
       } catch (err) {
         console.error('[ORDER_STATUS_EMAIL_QUEUE_ERROR]', err);
       }

       return NextResponse.json({
         success: true,
         message: `Order ${orderId} updated to ${status}`,
       });
     }

     return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[ADMIN_ORDERS_PUT_ERROR]', error);
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}


