import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Helper to verify token
async function verifyToken(req: Request) {
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

// GET /api/orders -> Fetch all orders for the logged-in user
export async function GET(req: Request) {
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: true, // Include the items for each order
      },
      // 👇 REMOVED: The orderBy clause that was causing the error.
      // We will now sort this on the client-side.
    });

    return NextResponse.json({ orders });

  } catch (error) {
    console.error("❌ Get Orders API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
