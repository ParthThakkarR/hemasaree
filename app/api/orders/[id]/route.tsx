// import { NextResponse } from 'next/server';
// import { PrismaClient, OrderItemStatus } from '@/app/generated/prisma';
// import jwt from 'jsonwebtoken';

// const prisma = new PrismaClient();

// // Helper to get user ID from token
// const getUserIdFromRequest = (req: Request): string | null => {
//   try {
//     const cookieHeader = req.headers.get("cookie") || "";
//     const token = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('token='))?.split('=')[1];
//     if (!token) return null;
//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
//     return decoded.id;
//   } catch (error) {
//     return null;
//   }
// };
// export async function GET(req: Request, { params }: { params: { id: string } }) {
//   const userId = getUserIdFromRequest(req);
//   if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   try {
//     const order = await prisma.order.findFirst({
//       where: { id: params.id, userId },
//       include: { orderItems: true, payment: true },
//     });
//     if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
//     return NextResponse.json({ order });
//   } catch (error) {
//     console.error("❌ Order details error:", error);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }





import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Helper to get user ID from token
const getUserIdFromRequest = (req: Request): string | null => {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const token = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('token='))?.split('=')[1];
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    return decoded.id;
  } catch (error) {
    return null;
  }
};

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: orderId } = params;

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId, // Security: Ensure the user owns this order
      },
      include: {
        orderItems: true,
        user: { // Include user details for the invoice
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // The frontend expects the data inside an 'order' property
    return NextResponse.json({ order });
  } catch (error) {
    console.error(`❌ Error fetching order ${orderId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}