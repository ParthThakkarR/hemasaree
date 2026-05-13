import { NextRequest, NextResponse } from 'next/server';
import { emailQueue } from '@/lib/email/emailQueue';
import { prisma } from '@lib/prisma';

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        orderItems: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await emailQueue.add('order_confirmation', {
      type: 'order_confirmation',
      data: { to: order.user.email, order },
    });

    return NextResponse.json({ message: 'Order confirmation email queued successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

