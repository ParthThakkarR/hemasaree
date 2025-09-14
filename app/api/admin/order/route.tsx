// // import { NextResponse } from "next/server";
// // import { PrismaClient } from "@/app/generated/prisma";
// // import jwt from "jsonwebtoken";

// // const prisma = new PrismaClient();

// // // --- Helper: Verify ADMIN JWT token ---
// // async function verifyAdminToken(req: Request): Promise<string | null> {
// //   try {
// //      const cookieHeader = req.headers.get("cookie") || "";
// //     const token = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('token='))?.split('=')[1];

// //     if (!token) return null;

// //     const decoded = jwt.verify(
// //       token,
// //       process.env.JWT_SECRET as string
// //     ) as { id: string; isAdmin?: boolean };

// //     // CRITICAL: Check if the user is an admin
// //     if (decoded.isAdmin !== true) {
// //         return null; // Not an admin
// //     }
// //     return decoded.id;

// //   } catch (error) {
// //     return null;
// //   }
// // }


// // // --- GET /api/admin/orders ---
// // // Fetches all orders for the admin dashboard
// // export async function GET(req: Request) {
// //     const adminId = await verifyAdminToken(req);
// //     if (!adminId) {
// //         return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
// //     }

// //     try {
// //         const orders = await prisma.order.findMany({
// //             include: {
// //                 user: { select: { firstName: true, email: true } }, // Get customer name
// //                 orderItems: true,
// //             },
// //             orderBy: { createdAt: 'desc' }
// //         });
// //         return NextResponse.json(orders);
// //     } catch (error) {
// //         return NextResponse.json({ error: "Server error while fetching orders" }, { status: 500 });
// //     }
// // }


// // // --- PUT /api/admin/orders ---
// // // Updates the status of a specific order
// // export async function PUT(req: Request) {
// //     const adminId = await verifyAdminToken(req);
// //     if (!adminId) {
// //         return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
// //     }

// //     try {
// //         const { orderId, status } = await req.json();
// //         if (!orderId || !status) {
// //             return NextResponse.json({ error: "Order ID and new status are required" }, { status: 400 });
// //         }

// //         const updatedOrder = await prisma.order.update({
// //             where: { id: orderId },
// //             data: { status: status },
// //         });

// //         return NextResponse.json(updatedOrder);

// //     } catch (error) {
// //         return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
// //     }
// // }
// import { NextResponse } from "next/server";
// import { PrismaClient, OrderStatus } from "@/app/generated/prisma";
// import jwt from "jsonwebtoken";

// const prisma = new PrismaClient();

// // --- Helper: Verify ADMIN JWT token ---
// async function verifyAdminToken(req: Request): Promise<string | null> {
//   try {
//     const cookieHeader = req.headers.get("cookie") || "";
//     const token = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('token='))?.split('=')[1];

//     if (!token) return null;

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET as string
//     ) as { id: string; isAdmin?: boolean };

//     // CRITICAL: Check if the user is an admin
//     if (decoded.isAdmin !== true) {
//       return null; // Not an admin
//     }
//     return decoded.id;

//   } catch (error) {
//     console.error("Admin token verification failed:", error);
//     return null;
//   }
// }


// // --- GET /api/admin/orders ---
// // Fetches all orders for the admin dashboard
// export async function GET(req: Request) {
//   const adminId = await verifyAdminToken(req);
//   if (!adminId) {
//     return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
//   }

//   try {
//     const orders = await prisma.order.findMany({
//       include: {
//         user: { select: { firstName: true, email: true } }, // Get customer name
//         orderItems: true,
//       },
//       orderBy: { createdAt: 'desc' }
//     });
//     return NextResponse.json(orders);
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     return NextResponse.json({ error: "Server error while fetching orders" }, { status: 500 });
//   }
// }


// // --- PUT /api/admin/orders ---
// // Updates the status of a specific order
// export async function PUT(req: Request) {
//   const adminId = await verifyAdminToken(req);
//   if (!adminId) {
//     return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
//   }

//   try {
//     const { orderId, status } = await req.json();

//     if (!orderId || !status) {
//       return NextResponse.json(
//         { error: "Order ID and new status are required" },
//         { status: 400 }
//       );
//     }

//     // --- Type-Safe Validation ---
//     // Check if the provided status is one of the allowed enum values from your schema
//     if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
//       return NextResponse.json(
//         { error: `Invalid status: '${status}'. Must be one of: ${Object.values(OrderStatus).join(', ')}` },
//         { status: 400 }
//       );
//     }

//     const updatedOrder = await prisma.order.update({
//       where: { id: orderId },
//       data: { status: status },
//     });

//     return NextResponse.json(updatedOrder);

//   } catch (error) {
//     console.error("Error updating order status:", error);
//     return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import { PrismaClient, OrderStatus, OrderItemStatus } from "@/app/generated/prisma";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// ✅ Helper: Verify admin token
async function verifyAdminToken(req: Request): Promise<string | null> {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const token = cookieHeader
      .split(";")
      .map(c => c.trim())
      .find(c => c.startsWith("token="))
      ?.split("=")[1];
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; isAdmin?: boolean };
    if (decoded.isAdmin !== true) return null;

    return decoded.id;
  } catch {
    return null;
  }
}

// ✅ GET /api/admin/orders → Fetch all orders with user + product info
export async function GET(req: Request) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
  }

  try {
    const ordersFromDb = await prisma.order.findMany({
      include: {
        user: { select: { firstName: true, email: true } },
        orderItems: {
          include: { product: { select: { name: true, images: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format response for frontend
    const formattedOrders = ordersFromDb.map(order => ({
      ...order,
      orderItems: order.orderItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        status: item.status,
        returnReason: item.returnReason,
        returnNotes: item.returnNotes,
        returnImage: item.returnImage,
        productName: item.product?.name || item.productName, // fallback to stored name
        productImage: item.product?.images?.[0] || item.productImage,
      })),
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("❌ Error fetching admin orders:", error);
    return NextResponse.json({ error: "Server error while fetching orders" }, { status: 500 });
  }
}

// ✅ PUT /api/admin/orders → Update order or return status
export async function PUT(req: Request) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // 🔹 Case 1: Update entire order status
    if (body.action === "UPDATE_ORDER_STATUS") {
      const { orderId, status } = body;
      if (!orderId || !status || !Object.values(OrderStatus).includes(status)) {
        return NextResponse.json({ error: "Invalid data for order status update" }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { status: status as OrderStatus },
        }),
        prisma.orderItem.updateMany({
          where: {
            orderId,
            status: {
              notIn: [
                OrderItemStatus.RETURN_REQUESTED,
                OrderItemStatus.RETURN_APPROVED,
                OrderItemStatus.RETURNED,
                OrderItemStatus.RETURN_DECLINED, // <-- locked
              ],
            },
          },
          data: { status: status as OrderItemStatus },
        }),
      ]);

      return NextResponse.json({ success: true, message: `Order ${orderId} updated to ${status}` });
    }

    // 🔹 Case 2: Update a specific item’s return status
    if (body.action === "UPDATE_RETURN_STATUS") {
      const { orderItemId, newStatus } = body;
      if (!orderItemId || !newStatus || !Object.values(OrderItemStatus).includes(newStatus)) {
        return NextResponse.json({ error: "Invalid data for return status update" }, { status: 400 });
      }

      const updatedItem = await prisma.orderItem.update({
        where: { id: orderItemId },
        data: { status: newStatus as OrderItemStatus },
      });

      return NextResponse.json(updatedItem);
    }

    return NextResponse.json({ error: "Invalid action specified" }, { status: 400 });
  } catch (error) {
    console.error("❌ Error updating admin order:", error);
    return NextResponse.json({ error: "Failed to perform update" }, { status: 500 });
  }
}
