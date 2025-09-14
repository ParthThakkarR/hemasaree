    // import { NextResponse } from "next/server";
    // import { PrismaClient } from "@/app/generated/prisma";
    // import jwt from "jsonwebtoken";

    // const prisma = new PrismaClient();

    // // Helper to verify token
    // async function verifyToken(req: Request) {
    //     try {
    //         const cookieHeader = req.headers.get("cookie") || "";
    //         const token = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('token='))?.split('=')[1];
    //         if (!token) return null;
    //         const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    //         return decoded.id;
    //     } catch (error) {
    //         return null;
    //     }
    // }

    // // GET /api/orders -> Fetch all orders for the logged-in user
    // export async function GET(req: Request) {
    //     try {
    //         const userId = await verifyToken(req);
    //         if (!userId) {
    //             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    //         }

    //         const orders = await prisma.order.findMany({
    //             where: { userId },
    //             include: {
    //                 orderItems: true, // Include the items for each order
    //             },
    //             orderBy: {
    //                 createdAt: 'desc'
    //             }
    //         });

    //         // Return the orders wrapped in an object, as the frontend expects
    //         return NextResponse.json({ orders });

    //     } catch (error) {
    //         console.error("❌ Get All Orders API Error:", error);
    //         return NextResponse.json({ error: "Server error" }, { status: 500 });
    //     }
    // }

import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import jwt from "jsonwebtoken";

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

// GET /api/orders -> Fetch all orders for the currently logged-in user
export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        // This is crucial: we must include the orderItems to get their status and isReturnable flag
        orderItems: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // The frontend expects the data inside an 'orders' property
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("❌ Get Orders API Error:", error);
    return NextResponse.json({ error: 'Server error while fetching orders' }, { status: 500 });
  }
}