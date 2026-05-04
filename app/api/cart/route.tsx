import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

import { getUserFromToken } from "@/app/lib/getUserFromToken";
import { CartAddSchema, CartUpdateSchema, CartDeleteSchema } from "@/app/lib/validators";

/* ---------------------------------------------
   🔧 Helper: Always recalculate total cart price
---------------------------------------------- */
async function recalcCartTotal(cartId: string) {
  const items = await prisma.cartItem.findMany({ where: { cartId } });
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return prisma.cart.update({
    where: { id: cartId },
    data: { totalPrice },
    include: {
      items: {
        include: { product: { select: { stock: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

/* ---------------------------------------------
   ✅ GET - Fetch User's Cart
---------------------------------------------- */
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const cart = await prisma.cart.findFirst({
      where: { userId: user.id },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({ cart });
  } catch (err) {
    console.error("[CART_GET_ERROR]", err);
    return NextResponse.json({ error: "Failed to load cart" }, { status: 500 });
  }
}

/* ---------------------------------------------
   🛒 POST - Add Item to Cart
---------------------------------------------- */
export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const valid = CartAddSchema.safeParse(body);
    if (!valid.success) {
      return NextResponse.json({ error: valid.error.issues[0].message }, { status: 400 });
    }

    const { productId, quantity, productName, productImage, price, withPolish } = valid.data;

    // 🧩 Find product
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // 🧮 Compute available stock safely
    const availableStock = typeof product.stock === "number" && product.stock > 0 ? product.stock : Infinity;

    // 🧺 Find or create user's cart
    let cart = await prisma.cart.findFirst({ where: { userId: user.id } });
    if (!cart) cart = await prisma.cart.create({ data: { userId: user.id } });

    // 🔍 Find all existing cart items for this product
    const allItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id, productId },
    });

    const totalQuantityInCart = allItems.reduce((sum, i) => sum + i.quantity, 0);

    // ✅ Stock check (only if stock is finite)
    if (availableStock !== Infinity && totalQuantityInCart + quantity > availableStock) {
      const remaining = Math.max(availableStock - totalQuantityInCart, 0);
      return NextResponse.json(
        { error: `Only ${remaining} item(s) available in stock.` },
        { status: 400 }
      );
    }

    // 🧩 Merge with same variant (polish)
    const existingVariant = allItems.find(i => i.withPolish === withPolish);

    if (existingVariant) {
      await prisma.cartItem.update({
        where: { id: existingVariant.id },
        data: { quantity: existingVariant.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          productName,
          productImage,
          price,
          quantity,
          withPolish,
        },
      });
    }

    const updatedCart = await recalcCartTotal(cart.id);
    return NextResponse.json({ message: "Item added to cart", cart: updatedCart });
  } catch (err) {
    console.error("[CART_POST_ERROR]", err);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}

/* ---------------------------------------------
   ✏️ PUT - Update Quantity
---------------------------------------------- */
export async function PUT(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const valid = CartUpdateSchema.safeParse(body);
    if (!valid.success) {
      return NextResponse.json({ error: valid.error.issues[0].message }, { status: 400 });
    }

    const { cartItemId, quantity } = valid.data;

    const item = await prisma.cartItem.findFirst({
      where: { id: cartItemId, cart: { userId: user.id } },
      include: { product: true },
    });

    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    const availableStock = typeof item.product.stock === "number" && item.product.stock > 0
      ? item.product.stock
      : Infinity;

    // 🧮 Total quantity of this product across cart (excluding this variant)
    const siblings = await prisma.cartItem.findMany({
      where: {
        cartId: item.cartId,
        productId: item.productId,
        NOT: { id: cartItemId },
      },
    });

    const otherQty = siblings.reduce((s, i) => s + i.quantity, 0);

    // ✅ Allow decreasing freely, block increase beyond stock
    if (availableStock !== Infinity && quantity + otherQty > availableStock) {
      const remaining = Math.max(availableStock - otherQty, 0);
      return NextResponse.json(
        { error: `Only ${remaining} item(s) available in stock.` },
        { status: 400 }
      );
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    const updatedCart = await recalcCartTotal(item.cartId);
    return NextResponse.json({ message: "Quantity updated", cart: updatedCart });
  } catch (err) {
    console.error("[CART_PUT_ERROR]", err);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

/* ---------------------------------------------
   ❌ DELETE - Remove Item
---------------------------------------------- */
export async function DELETE(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const valid = CartDeleteSchema.safeParse(body);
    if (!valid.success) {
      return NextResponse.json({ error: valid.error.issues[0].message }, { status: 400 });
    }

    const { cartItemId } = valid.data;

    const item = await prisma.cartItem.findFirst({
      where: { id: cartItemId, cart: { userId: user.id } },
    });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    await prisma.cartItem.delete({ where: { id: cartItemId } });

    const updatedCart = await recalcCartTotal(item.cartId);
    return NextResponse.json({ message: "Item removed", cart: updatedCart });
  } catch (err) {
    console.error("[CART_DELETE_ERROR]", err);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
