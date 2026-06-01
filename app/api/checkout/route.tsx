// /app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { getUserFromToken } from '@lib/getUserFromToken';
import { CheckoutSchema } from '@lib/validators';
import { OrderService, calculateDeliveryCharge, CheckoutAddress } from '@/lib/services/orderService';
import { handleApiError } from '@/lib/errors';

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const decodedUser = await getUserFromToken(req);
    if (!decodedUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = CheckoutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { address, buyNowItem } = validation.data;
    const deliveryCharge = await calculateDeliveryCharge(address.state);

    const checkoutAddress: CheckoutAddress = {
      houseNumber: 'N/A', // Frontend form doesn't support this yet
      buildingName: null,
      area: address.streetAddress,
      city: address.city,
      state: address.state,
      pincode: address.zipCode,
    };

    const result = await OrderService.createOrder(
      decodedUser.id,
      checkoutAddress,
      deliveryCharge,
      buyNowItem
    );

    // Queue order confirmation email
    try {
      const { emailQueue } = await import('@/lib/email/emailQueue');
      const orderWithUser = await prisma.order.findUnique({
        where: { id: result.orderId },
        include: { user: true, orderItems: true },
      });
      if (orderWithUser && orderWithUser.user?.email) {
        await emailQueue.add('order_confirmation', {
          type: 'order_confirmation',
          data: { to: orderWithUser.user.email, order: orderWithUser },
        });
      }
    } catch (err) {
      console.error('[ORDER_CONFIRMATION_EMAIL_QUEUE_ERROR]', err);
    }

    return NextResponse.json({
      message: 'Order placed successfully!',
      orderId: result.orderId,
      totalAmount: result.totalAmount,
    });
  } catch (error: any) {
    console.error('[CHECKOUT_ERROR]', error);
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

