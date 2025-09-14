// import { NextResponse } from "next/server";
// import { PrismaClient } from "@/app/generated/prisma";
// import jwt from "jsonwebtoken";

// const prisma = new PrismaClient();

// // --- Helper: Verify JWT token and get User ID ---
// async function getUserIdFromToken(req: Request): Promise<string | null> {
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

// // --- Helper: Recalculate and update the cart's total price ---
// async function updateCartTotal(cartId: string) {
//     const cartItems = await prisma.cartItem.findMany({ where: { cartId } });
//     const newTotalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
//     // Return the full cart object with all necessary details
//     return prisma.cart.update({
//         where: { id: cartId },
//         data: { totalPrice: newTotalPrice },
//         include: { 
//             items: { 
//                 include: { product: { select: { stock: true }}},
//                 // REMOVED: orderBy clause to fix the error
//             }
//         }
//     });
// }


// // --- GET /api/cart ---
// // Fetches the user's current cart with product stock and polish information
// export async function GET(req: Request) {
//     const userId = await getUserIdFromToken(req);
//     if (!userId) {
//         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const cart = await prisma.cart.findFirst({
//         where: { userId },
//         include: {
//             items: {
//                 include: { product: { select: { stock: true }}},
//                  // REMOVED: orderBy clause to fix the error
//             }
//         }
//     });

//     return NextResponse.json({ cart });
// }

// // --- POST /api/cart ---
// // Adds a new item or updates quantity, handling the 'withPolish' variant
// export async function POST(req: Request) {
//     const userId = await getUserIdFromToken(req);
//     if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//     try {
//         const { productId, quantity, productName, productImage, price, withPolish } = await req.json();

//         if (!productId || !quantity || !productName || typeof price === 'undefined' || typeof withPolish === 'undefined') {
//             return NextResponse.json({ error: 'Missing required product data' }, { status: 400 });
//         }

//         let userCart = await prisma.cart.findFirst({ where: { userId } });
//         if (!userCart) {
//             userCart = await prisma.cart.create({ data: { userId } });
//         }

//         const existingItem = await prisma.cartItem.findFirst({
//             where: { cartId: userCart.id, productId: productId, withPolish: withPolish },
//         });

//         if (existingItem) {
//             await prisma.cartItem.update({
//                 where: { id: existingItem.id },
//                 data: { quantity: existingItem.quantity + quantity },
//             });
//         } else {
//             await prisma.cartItem.create({
//                 data: { cartId: userCart.id, productId, productName, productImage, price, quantity, withPolish },
//             });
//         }
        
//         const updatedCart = await updateCartTotal(userCart.id);
//         return NextResponse.json({ message: 'Item added to cart', cart: updatedCart });
//     } catch (error) {
//         console.error('Add to cart error:', error);
//         return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 });
//     }
// }

// // --- PUT /api/cart ---
// // Updates the quantity of a specific item in the cart
// export async function PUT(req: Request) {
//     const userId = await getUserIdFromToken(req);
//     if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { cartItemId, quantity } = await req.json();
//     const newQuantity = Math.max(1, Number(quantity));

//     const cartItem = await prisma.cartItem.findFirst({
//         where: { id: cartItemId, cart: { userId } },
//         include: { product: true }
//     });

//     if (!cartItem) {
//         return NextResponse.json({ error: "Item not found in your cart" }, { status: 404 });
//     }
//     if (newQuantity > cartItem.product.stock) {
//         return NextResponse.json({ error: `Only ${cartItem.product.stock} items available.` }, { status: 400 });
//     }

//     await prisma.cartItem.update({
//         where: { id: cartItemId },
//         data: { quantity: newQuantity },
//     });
    
//     const finalCart = await updateCartTotal(cartItem.cartId);
//     return NextResponse.json({ cart: finalCart });
// }

// // --- DELETE /api/cart ---
// // Removes an item from the cart
// export async function DELETE(req: Request) {
//     const userId = await getUserIdFromToken(req);
//     if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { cartItemId } = await req.json();

//     const itemToRemove = await prisma.cartItem.findFirst({
//         where: { id: cartItemId, cart: { userId } }
//     });

//     if (!itemToRemove) {
//         return NextResponse.json({ error: "Item not found in your cart" }, { status: 404 });
//     }

//     await prisma.cartItem.delete({ where: { id: cartItemId } });

//     const finalCart = await updateCartTotal(itemToRemove.cartId);
//     return NextResponse.json({ cart: finalCart });
// }



import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

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

async function updateCartTotal(cartId: string) {
    const cartItems = await prisma.cartItem.findMany({ where: { cartId } });
    const newTotalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    return prisma.cart.update({
        where: { id: cartId },
        data: { totalPrice: newTotalPrice },
        include: { 
            items: { 
                include: { product: { select: { stock: true }}},
                orderBy: { createdAt: 'asc' }
            }
        }
    });
}

export async function GET(req: Request) {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
        return NextResponse.json({ cart: null });
    }
    const cart = await prisma.cart.findFirst({
        where: { userId },
        include: {
            items: {
                include: { product: { select: { stock: true }}},
                orderBy: { createdAt: 'asc' }
            }
        }
    });
    return NextResponse.json({ cart });
}

export async function POST(req: Request) {
    const userId = await getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { productId, quantity, productName, productImage, price, withPolish } = await req.json();

        if (!productId || !quantity || !productName || typeof price === 'undefined' || typeof withPolish === 'undefined') {
            return NextResponse.json({ error: 'Missing required product data' }, { status: 400 });
        }

        let userCart = await prisma.cart.findFirst({ where: { userId } });
        if (!userCart) {
            userCart = await prisma.cart.create({ data: { userId } });
        }

        const existingItem = await prisma.cartItem.findFirst({
            where: { cartId: userCart.id, productId: productId, withPolish: withPolish },
        });

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        } else {
            await prisma.cartItem.create({
                data: { cartId: userCart.id, productId, productName, productImage, price, quantity, withPolish },
            });
        }
        
        const updatedCart = await updateCartTotal(userCart.id);
        return NextResponse.json({ message: 'Item added to cart', cart: updatedCart });
    } catch (error) {
        console.error('Add to cart error:', error);
        return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const userId = await getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { cartItemId, quantity } = await req.json();
    const newQuantity = Math.max(1, Number(quantity));

    const cartItem = await prisma.cartItem.findFirst({
        where: { id: cartItemId, cart: { userId } },
        include: { product: true }
    });

    if (!cartItem) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    if (newQuantity > cartItem.product.stock) return NextResponse.json({ error: `Only ${cartItem.product.stock} items available.` }, { status: 400 });

    await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity: newQuantity },
    });
    
    const finalCart = await updateCartTotal(cartItem.cartId);
    return NextResponse.json({ cart: finalCart });
}

export async function DELETE(req: Request) {
    const userId = await getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { cartItemId } = await req.json();

    const itemToRemove = await prisma.cartItem.findFirst({
        where: { id: cartItemId, cart: { userId } }
    });

    if (!itemToRemove) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    await prisma.cartItem.delete({ where: { id: cartItemId } });

    const finalCart = await updateCartTotal(itemToRemove.cartId);
    return NextResponse.json({ cart: finalCart });
}