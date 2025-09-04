import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// --- Helper: Verify ADMIN JWT token ---
async function verifyAdminToken(req: Request): Promise<string | null> {
  try {
     const cookieHeader = req.headers.get("cookie") || "";
    const token = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('token='))?.split('=')[1];

    if (!token) return null;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: string; isAdmin?: boolean };

    // CRITICAL: Check if the user is an admin
    if (decoded.isAdmin !== true) {
        return null; // Not an admin
    }
    return decoded.id;

  } catch (error) {
    return null;
  }
}


// --- GET /api/admin/orders ---
// Fetches all orders for the admin dashboard
export async function GET(req: Request) {
    const adminId = await verifyAdminToken(req);
    if (!adminId) {
        return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    try {
        const orders = await prisma.order.findMany({
            include: {
                user: { select: { firstName: true, email: true } }, // Get customer name
                orderItems: true,
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error: "Server error while fetching orders" }, { status: 500 });
    }
}


// --- PUT /api/admin/orders ---
// Updates the status of a specific order
export async function PUT(req: Request) {
    const adminId = await verifyAdminToken(req);
    if (!adminId) {
        return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    try {
        const { orderId, status } = await req.json();
        if (!orderId || !status) {
            return NextResponse.json({ error: "Order ID and new status are required" }, { status: 400 });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: status },
        });

        return NextResponse.json(updatedOrder);

    } catch (error) {
        return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
    }
}
