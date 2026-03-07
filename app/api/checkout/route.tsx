// /app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getUserFromToken } from '@/app/lib/getUserFromToken';
import { CheckoutSchema } from '@/app/lib/validators'; // We defined this before

// 1. --- NEW: Add your delivery logic to the backend ---
const getDeliveryCharge = (state: string): number => {
  if (state.toLowerCase() === 'gujarat') {
    return 80;
  }
  return 150;
};

export async function POST(req: NextRequest) {
  const decodedUser = await getUserFromToken(req);
  if (!decodedUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = await decodedUser.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    // 2. Validate the address (this is our existing CheckoutSchema)
    const validation = CheckoutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    const { address } = validation.data;

    // 3. Fetch the user's cart from the DB (our secure logic)
    const userCart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: true, // We need the *real* product data
          },
        },
      },
    });

    if (!userCart?.items?.length) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
    }

    // 4. --- SERVER-SIDE CALCULATION (UPDATED) ---
    let serverTotalAmount = 0;
    const stockUpdates = [];
    const orderItemsCreate = [];

    for (const item of userCart.items) {
      if (item.quantity > item.product.stock) {
        return NextResponse.json(
          {
            error: `Not enough stock for ${item.product.name}. Only ${item.product.stock} available.`,
          },
          { status: 409 }
        );
      }
      serverTotalAmount += item.product.price * item.quantity;
      stockUpdates.push(
        prisma.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        })
      );
      orderItemsCreate.push({
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.images[0],
        price: item.product.price,
        quantity: item.quantity,
        withPolish: !!item.withPolish,
        isReturnable: !item.withPolish,
      });
    }

    // 5. --- FIX: Use the dynamic delivery charge logic ---
    const deliveryCharge = getDeliveryCharge(address.state);
    const finalTotalAmount = serverTotalAmount + deliveryCharge;
    const formattedAddress = `${address.streetAddress}, ${address.city}, ${address.state} - ${address.zipCode}, ${
      address.country || 'India'
    }`;

    // 6. Prepare Order Creation with *server data*
    const orderCreation = prisma.order.create({
      data: {
        userId,
        totalAmount: finalTotalAmount,
        deliveryCharge: deliveryCharge, // Use the new dynamic charge
        shippingAddress: formattedAddress,
        status: 'PENDING',
        orderItems: { create: orderItemsCreate },
      },
      include: { orderItems: true },
    });

    // 7. Execute Transaction (your excellent logic)
    const [_, newOrder] = await prisma.$transaction([
      ...stockUpdates,
      orderCreation,
    ]);

    // 8. Clear User Cart (your excellent logic)
    await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
    await prisma.cart.update({
      where: { id: userCart.id },
      data: { totalPrice: 0 },
    });

    return NextResponse.json({
      message: 'Order placed successfully!',
      order: newOrder,
    });
  } catch (error: any) {
    console.error('Checkout API Error:', error);
    if (error.code === 'P2025' || error.code === 'P2034') {
      return NextResponse.json(
        { error: 'One or more items in your cart are out of stock.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Server error during checkout. Please try again later.' },
      { status: 500 }
    );
  }
}