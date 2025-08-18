// app/api/cart/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ObjectId } from "bson"; // npm i bson
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

async function verifyToken(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader
      .split("; ")
      .filter(Boolean)
      .map((c) => {
        const [key, ...v] = c.split("=");
        return [key, decodeURIComponent(v.join("="))];
      })
  );

  const token = cookies["token"];
  if (!token) {
    throw new Error("Unauthorized: No token provided");
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    if (!decoded?.id) throw new Error("Unauthorized: Invalid token data");
    return decoded.id;
  } catch {
    throw new Error("Unauthorized: Invalid token");
  }
}

export async function GET(req: Request) {
  try {
    const userId = await verifyToken(req);

    // Fetch cart with items for this user
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });

    return NextResponse.json({ cart });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.startsWith("Unauthorized") ? 401 : 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await verifyToken(req);

    const body = await req.json();
    const { productId, productName, productImage, price, quantity } = body;

    if (!productId || !productName || !price || !quantity) {
      return NextResponse.json({ error: "Missing product data" }, { status: 400 });
    }

    // You can optionally convert IDs to ObjectId if your Prisma schema expects them
    // const userObjectId = new ObjectId(userId);
    // const productObjectId = new ObjectId(productId);

    let cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          totalPrice: 0,
        },
        include: { items: true },
      });
      // Ensure cart.items is always present (should be [] after creation)
      if (!cart.items) {
        cart.items = [];
      }
    }

    const existingItem = cart.items.find((item) => item.productId === productId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });

      const newTotalPrice = cart.totalPrice + price * quantity;
      await prisma.cart.update({
        where: { id: cart.id },
        data: { totalPrice: newTotalPrice },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          productName,
          productImage: productImage || null,
          price,
          quantity,
        },
      });

      const newTotalPrice = cart.totalPrice + price * quantity;
      await prisma.cart.update({
        where: { id: cart.id },
        data: { totalPrice: newTotalPrice },
      });
    }

    return NextResponse.json({ message: "Product added to cart" });
  } catch (error: any) {
    console.error("Add to Cart API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.startsWith("Unauthorized") ? 401 : 500 }
    );
  }
}
