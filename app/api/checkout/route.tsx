import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma"; // ✅ use prisma client directly
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// --- Helper: Verify JWT token from cookies ---
async function verifyToken(req: Request): Promise<string | null> {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const token = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) return null;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: string };

    return decoded.id;
  } catch (error) {
    console.error("❌ JWT Verification Failed:", error);
    return null;
  }
}

// --- Delivery Charge Calculator ---
function getDeliveryCharge(city: string): number {
  const cityLower = city.toLowerCase().trim();
  switch (cityLower) {
    case "rajkot":
      return 40;
    case "ahmedabad":
    case "surat":
      return 60;
    case "mumbai":
    case "delhi":
      return 100;
    default:
      return 80; // Default charge for other cities
  }
}

// --- POST /api/checkout (Cash on Delivery) ---
export async function POST(req: Request) {
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { city } = body;

    if (!city || typeof city !== "string") {
      return NextResponse.json(
        { error: "City is required for delivery" },
        { status: 400 }
      );
    }

    // 1. Fetch the user's cart
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 2. Calculate delivery charge & final total
    const deliveryCharge = getDeliveryCharge(city);
    const finalTotal = (cart.totalPrice || 0) + deliveryCharge;

    // 3. Create Order
    const newOrder = await prisma.order.create({
      data: {
        userId,
        totalAmount: finalTotal,
        deliveryCharge,
        status: "Pending", // COD starts as pending
        orderItems: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { orderItems: true },
    });

    // 4. Clear Cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    await prisma.cart.update({
      where: { id: cart.id },
      data: { totalPrice: 0 },
    });

    // 5. Return Success Response
    return NextResponse.json({
      message: "Order placed successfully!",
      order: newOrder,
    });
  } catch (error) {
    console.error("❌ Checkout API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
