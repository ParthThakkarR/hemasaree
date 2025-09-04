import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// --- Helper: Verify JWT token from cookies ---
async function getUserIdFromToken(req: Request): Promise<string | null> {
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
    return null;
  }
}

// --- Delivery Charge Calculator ---
function getDeliveryCharge(city: string): number {
  const cityLower = city.toLowerCase().trim();
  switch (cityLower) {
    case "rajkot": return 40;
    case "ahmedabad":
    case "surat": return 60;
    case "mumbai":
    case "delhi": return 100;
    default: return 80;
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 👇 MODIFIED: Expect the new, detailed body from the cart page
    const body = await req.json();
    const { cart, address, totalAmount } = body;

    // --- New, Robust Validation ---
    if (!cart || !cart.items || cart.items.length === 0) {
        return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }
    if (!address || !address.streetAddress || !address.city || !address.state || !address.zipCode) {
        return NextResponse.json({ error: "A complete shipping address is required." }, { status: 400 });
    }
    if (typeof totalAmount !== 'number') {
        return NextResponse.json({ error: "Invalid total amount." }, { status: 400 });
    }
    
    // Format the address into a single string for storage
    const formattedAddress = `${address.streetAddress}, ${address.city}, ${address.state} - ${address.zipCode}, ${address.country || 'India'}`;

    // 3. Create the Order in the database
    const newOrder = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        deliveryCharge: totalAmount - cart.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
        shippingAddress: formattedAddress, // 👈 NEW: Save the full address
        status: "Pending",
        orderItems: {
          create: cart.items.map((item: any) => ({
            productId: item.productId, // Make sure your cart items have productId
            productName: item.productName,
            productImage: item.productImage,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { orderItems: true },
    });

    // 4. Clear the user's cart
    const userCart = await prisma.cart.findFirst({ where: { userId } });
    if (userCart) {
        await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
        await prisma.cart.update({
            where: { id: userCart.id },
            data: { totalPrice: 0 },
        });
    }

    return NextResponse.json({
      message: "Order placed successfully!",
      order: newOrder,
    });

  } catch (error) {
    console.error("❌ Checkout API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
