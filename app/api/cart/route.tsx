import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// --- Helper: Verify JWT token and get User ID ---
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

// --- Helper: Recalculate and update the cart's total price ---
async function updateCartTotal(cartId: string) {
    const cartItems = await prisma.cartItem.findMany({ 
        where: { cartId },
        include: { product: { select: { stock: true }}}
    });
    const newTotalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    return prisma.cart.update({
        where: { id: cartId },
        data: { totalPrice: newTotalPrice },
        include: { items: { include: { product: { select: { stock: true }}}}}
    });
}

// --- GET /api/cart ---
// Fetches the user's current cart with product stock information
export async function GET(req: Request) {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await prisma.cart.findFirst({
        where: { userId },
        include: {
            items: {
                include: { product: { select: { stock: true }}}
            }
        }
    });

    return NextResponse.json({ cart });
}

// --- POST /api/cart ---
// Adds a new item to the cart or updates the quantity if it already exists
export async function POST(req: Request) {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, productName, productImage, price, quantity } = await req.json();

    if (!productId || !productName || !price || !quantity) {
        return NextResponse.json({ error: "Missing product data" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId }});
    if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) {
        cart = await prisma.cart.create({ data: { userId } });
    }

    const existingItem = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId: productId }
    });

    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
            return NextResponse.json({ error: `Only ${product.stock} items available.` }, { status: 400 });
        }
        await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: newQuantity },
        });
    } else {
        if (quantity > product.stock) {
            return NextResponse.json({ error: `Only ${product.stock} items available.` }, { status: 400 });
        }
        await prisma.cartItem.create({
            data: { cartId: cart.id, productId, productName, productImage, price, quantity },
        });
    }

    const finalCart = await updateCartTotal(cart.id);
    return NextResponse.json({ message: "Cart updated", cart: finalCart });
}


// --- PUT /api/cart ---
// Updates the quantity of a specific item in the cart
export async function PUT(req: Request) {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cartItemId, quantity } = await req.json();
    const newQuantity = Math.max(1, Number(quantity));

    const cartItem = await prisma.cartItem.findFirst({
        where: { id: cartItemId, cart: { userId } }, // Security check: user owns this cart item
        include: { product: true }
    });

    if (!cartItem) {
        return NextResponse.json({ error: "Item not found in your cart" }, { status: 404 });
    }

    if (newQuantity > cartItem.product.stock) {
        return NextResponse.json({ error: `Only ${cartItem.product.stock} items available.` }, { status: 400 });
    }

    await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity: newQuantity },
    });
    
    const finalCart = await updateCartTotal(cartItem.cartId);
    return NextResponse.json({ cart: finalCart });
}


// --- DELETE /api/cart ---
// Removes an item from the cart
export async function DELETE(req: Request) {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cartItemId } = await req.json();

    const itemToRemove = await prisma.cartItem.findFirst({
        where: { id: cartItemId, cart: { userId } } // Security check: user owns this cart item
    });

    if (!itemToRemove) {
        return NextResponse.json({ error: "Item not found in your cart" }, { status: 404 });
    }

    await prisma.cartItem.delete({ where: { id: cartItemId } });

    const finalCart = await updateCartTotal(itemToRemove.cartId);
    return NextResponse.json({ cart: finalCart });
}

