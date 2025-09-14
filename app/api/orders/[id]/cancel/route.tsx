import { NextResponse } from "next/server";
import { PrismaClient, OrderStatus, OrderItemStatus } from "@/app/generated/prisma";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Helper to get user ID from token
async function getUserIdFromToken(req: Request): Promise<string | null> {
    try {
        const cookieHeader = req.headers.get("cookie") || "";
        const token = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('token='))?.split('=')[1];
        if (!token) return null;
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
        return decoded.id;
    } catch (error) {
        return null;
    }
}

// POST /api/orders/[id]/cancel
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = params.id;

    try {
        // 1. Find the order and verify it belongs to the user AND is still pending
        const orderToCancel = await prisma.order.findFirst({
            where: {
                id: orderId,
                userId: userId,
                status: OrderStatus.PENDING // Crucial check
            }
        });

        if (!orderToCancel) {
            return NextResponse.json({ error: "Order not found or cannot be cancelled." }, { status: 404 });
        }

        // 2. Use a transaction to update the status of the order and all its items
        await prisma.$transaction([
            prisma.order.update({
                where: { id: orderId },
                data: { status: OrderStatus.CANCELLED }
            }),
            prisma.orderItem.updateMany({
                where: { orderId: orderId },
                data: { status: OrderItemStatus.CANCELLED }
            })
        ]);
        
        return NextResponse.json({ message: "Order successfully cancelled." });

    } catch (error) {
        console.error(`Failed to cancel order ${orderId}:`, error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
