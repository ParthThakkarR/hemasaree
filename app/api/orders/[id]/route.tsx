// /app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { getUserFromToken } from '@lib/getUserFromToken';
import { IdParamSchema } from '@lib/validators';

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1️⃣ Decode and verify JWT
    const decodedUser = await getUserFromToken(req);
    if (!decodedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2️⃣ Extract actual user ID
    const userId = decodedUser.id;

    // 3️⃣ Validate the order ID from URL
    const validation = IdParamSchema.safeParse({ id: params.id });
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { id: orderId } = validation.data;

    // 4️⃣ Fetch order with ownership check
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId, // ✅ Now a string, not an object
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
              },
            },
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 5️⃣ Success
    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (error) {
    console.error('[ORDER_GET_BY_ID_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
