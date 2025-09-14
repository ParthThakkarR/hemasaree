// import { NextResponse } from "next/server";
// import { PrismaClient } from "@/app/generated/prisma";
// import jwt from "jsonwebtoken";

// const prisma = new PrismaClient();

// // --- Helper: Verify JWT token from cookies ---
// async function getUserIdFromToken(req: Request): Promise<string | null> {
//   try {
//     const cookieHeader = req.headers.get("cookie") || "";
//     const token = cookieHeader
//       .split(";")
//       .map((c) => c.trim())
//       .find((c) => c.startsWith("token="))
//       ?.split("=")[1];

//     if (!token) return null;

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET as string
//     ) as { id: string };

//     return decoded.id;
//   } catch (error) {
//     return null;
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const userId = await getUserIdFromToken(req);
//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const body = await req.json();
//     const { cart, address, totalAmount } = body;

//     // --- Robust Validation ---
//     if (!cart || !cart.items || cart.items.length === 0) {
//       return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
//     }
//     if (!address || !address.streetAddress || !address.city || !address.state || !address.zipCode) {
//       return NextResponse.json({ error: "A complete shipping address is required." }, { status: 400 });
//     }
//     if (typeof totalAmount !== 'number') {
//       return NextResponse.json({ error: "Invalid total amount." }, { status: 400 });
//     }
    
//     // Format the address into a single string for storage
//     const formattedAddress = `${address.streetAddress}, ${address.city}, ${address.state} - ${address.zipCode}, ${address.country || 'India'}`;

//     // --- Create the Order in the database ---
//     const newOrder = await prisma.order.create({
//       data: {
//         userId,
//         totalAmount,
//         deliveryCharge: totalAmount - cart.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
//         shippingAddress: formattedAddress,
//         status: "PENDING",
//         orderItems: {
//           create: cart.items.map((item: any) => ({
//             productId: item.productId,
//             productName: item.productName,
//             productImage: item.productImage,
//             price: item.price,
//             quantity: item.quantity,
//             // --- THIS IS THE KEY LOGIC ---
//             // It saves the user's choice and sets the return eligibility.
//             withPolish: !!item.withPolish, // Ensures value is a boolean (defaults to false)
//             isReturnable: !item.withPolish, // Sets true ONLY IF withPolish is false
//           })),
//         },
//       },
//       include: { orderItems: true },
//     });

//     // --- Clear the user's cart ---
//     const userCart = await prisma.cart.findFirst({ where: { userId } });
//     if (userCart) {
//         // First delete items associated with the cart
//         await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
//         // Then, update the cart itself to reset the total
//         await prisma.cart.update({
//             where: { id: userCart.id },
//             data: { totalPrice: 0 },
//         });
//     }

//     return NextResponse.json({
//       message: "Order placed successfully!",
//       order: newOrder,
//     });

//   } catch (error) {
//     console.error("❌ Checkout API Error:", error);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

  







import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// --- Helper to extract user ID from JWT token ---
async function getUserIdFromToken(req: Request): Promise<string | null> {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const token = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
}

// --- Checkout API ---
export async function POST(req: Request) {
  const userId = await getUserIdFromToken(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { cart, address, totalAmount } = body;

    // --- Validations ---
    if (!cart?.items?.length)
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });

    if (!address?.streetAddress || !address?.city || !address?.state || !address?.zipCode)
      return NextResponse.json(
        { error: "A complete shipping address is required." },
        { status: 400 }
      );

    if (typeof totalAmount !== "number" || totalAmount <= 0)
      return NextResponse.json({ error: "Invalid total amount." }, { status: 400 });

    // --- Format Shipping Address ---
    const formattedAddress = `${address.streetAddress}, ${address.city}, ${address.state} - ${address.zipCode}, ${address.country || "India"}`;

    // --- Prepare Stock Updates ---
    const stockUpdates = cart.items.map((item: any) =>
      prisma.product.updateMany({
        where: {
          id: item.productId,
          stock: { gte: item.quantity },
        },
        data: { stock: { decrement: item.quantity } },
      })
    );

    // --- Prepare Order Creation ---
    const orderCreation = prisma.order.create({
      data: {
        userId,
        totalAmount,
        deliveryCharge:
          totalAmount -
          cart.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
        shippingAddress: formattedAddress,
        status: "PENDING",
        orderItems: {
          create: cart.items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            price: item.price,
            quantity: item.quantity,
            withPolish: !!item.withPolish,
            isReturnable: !item.withPolish,
          })),
        },
      },
      include: { orderItems: true },
    });

    // --- Execute Transaction ---
    const [_, newOrder] = await prisma.$transaction([...stockUpdates, orderCreation]);

    // --- Clear User Cart ---
    const userCart = await prisma.cart.findFirst({ where: { userId } });
    if (userCart) {
      await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
      await prisma.cart.update({
        where: { id: userCart.id },
        data: { totalPrice: 0 },
      });
    }

    return NextResponse.json({ message: "Order placed successfully!", order: newOrder });
  } catch (error: any) {
    console.error("❌ Checkout API Error:", error);

    if (error.code === "P2025" || error.code === "P2034") {
      // Prisma updateMany failed (stock insufficient)
      return NextResponse.json(
        { error: "One or more items in your cart are out of stock." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Server error during checkout. Please try again later." },
      { status: 500 }
    );
  }
}
