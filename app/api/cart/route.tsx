// // app/api/cart/route.ts
// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import { ObjectId } from "bson"; // npm i bson
// import { PrismaClient } from "@/app/generated/prisma";

// const prisma = new PrismaClient();

// async function verifyToken(req: Request) {
//   const cookieHeader = req.headers.get("cookie") || "";
//   const cookies = Object.fromEntries(
//     cookieHeader
//       .split("; ")
//       .filter(Boolean)
//       .map((c) => {
//         const [key, ...v] = c.split("=");
//         return [key, decodeURIComponent(v.join("="))];
//       })
//   );

//   const token = cookies["token"];
//   if (!token) {
//     throw new Error("Unauthorized: No token provided");
//   }

//   try {
//     const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
//     if (!decoded?.id) throw new Error("Unauthorized: Invalid token data");
//     return decoded.id;
//   } catch {
//     throw new Error("Unauthorized: Invalid token");
//   }
// }

// export async function GET(req: Request) {
//   try {
//     const userId = await verifyToken(req);

//     // Fetch cart with items for this user
//     const cart = await prisma.cart.findFirst({
//       where: { userId },
//       include: { items: true },
//     });

//     return NextResponse.json({ cart });
//   } catch (error: any) {
//     return NextResponse.json(
//       { error: error.message || "Internal Server Error" },
//       { status: error.message?.startsWith("Unauthorized") ? 401 : 500 }
//     );
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const userId = await verifyToken(req);

//     const body = await req.json();
//     const { productId, productName, productImage, price, quantity } = body;

//     if (!productId || !productName || !price || !quantity) {
//       return NextResponse.json({ error: "Missing product data" }, { status: 400 });
//     }

//     // You can optionally convert IDs to ObjectId if your Prisma schema expects them
//     // const userObjectId = new ObjectId(userId);
//     // const productObjectId = new ObjectId(productId);

//     let cart = await prisma.cart.findFirst({
//       where: { userId },
//       include: { items: true },
//     });

//     if (!cart) {
//       cart = await prisma.cart.create({
//         data: {
//           userId,
//           totalPrice: 0,
//         },
//         include: { items: true },
//       });
//       // Ensure cart.items is always present (should be [] after creation)
//       if (!cart.items) {
//         cart.items = [];
//       }
//     }

//     const existingItem = cart.items.find((item) => item.productId === productId);

//     if (existingItem) {
//       const newQuantity = existingItem.quantity + quantity;

//       await prisma.cartItem.update({
//         where: { id: existingItem.id },
//         data: { quantity: newQuantity },
//       });

//       const newTotalPrice = cart.totalPrice + price * quantity;
//       await prisma.cart.update({
//         where: { id: cart.id },
//         data: { totalPrice: newTotalPrice },
//       });
//     } else {
//       await prisma.cartItem.create({
//         data: {
//           cartId: cart.id,
//           productId,
//           productName,
//           productImage: productImage || null,
//           price,
//           quantity,
//         },
//       });

//       const newTotalPrice = cart.totalPrice + price * quantity;
//       await prisma.cart.update({
//         where: { id: cart.id },
//         data: { totalPrice: newTotalPrice },
//       });
//     }

//     return NextResponse.json({ message: "Product added to cart" });
//   } catch (error: any) {
//     console.error("Add to Cart API error:", error);
//     return NextResponse.json(
//       { error: error.message || "Internal Server Error" },
//       { status: error.message?.startsWith("Unauthorized") ? 401 : 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// ✅ A more reliable function to verify the token from the request headers
async function verifyToken(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    
    // Manually parse the cookie string to find the token
    const token = cookieHeader
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      console.log("❌ No token found in request cookies");
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    
    console.log("✅ Token verified successfully via request headers:", decoded);
    return decoded.id; // Return only the user ID

  } catch (error) {
    console.error("❌ Token verification failed:", error);
    return null;
  }
}

// ✅ POST /api/cart → Add item to cart
export async function POST(req: Request) {
  try {
    // Pass the 'req' object to the updated verifyToken function
    const userId = await verifyToken(req); 
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, productName, productImage, price, quantity } = body;

    if (!productId || !productName || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find cart by userId first
    let cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: true },
      });
    }

    // const existingItem = cart.items.find((item) => item.productId === productId);

    // if (existingItem) {
    //   await prisma.cartItem.update({
    //     where: { id: existingItem.id },
    //     data: { quantity: existingItem.quantity + (quantity || 1) },
    //   });
    // } else {
    //   await prisma.cartItem.create({
    //     data: {
    //       cartId: cart.id,
    //       productId,
    //       productName,
    //       productImage: productImage || null,
    //       price,
    //       quantity: quantity || 1,
    //     },
    //   });
    // }
    const existingItem = cart.items.find(
      (item) => item.productId === productId && item.price === price
    );

    if (existingItem) {
      // If item with the same price exists, update its quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + (quantity || 1) },
      });
    } else {
      // If it's a new variation (different price), create a new cart item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          productName,
          productImage: productImage || null,
          price,
          quantity: quantity || 1,
        },
      });
    }

    const updatedCartItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
    });

    const newTotalPrice = updatedCartItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    // const finalCart = await prisma.cart.update({
    //   where: { id: cart.id },
    //   data: { totalPrice: newTotalPrice },
    //   include: { items: true },
    // });
    const finalCart = await updateCartTotal(cart.id);
    return NextResponse.json({ message: "Cart updated", cart: finalCart });

  } catch (error) {
    console.error("❌ Error in POST /api/cart:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

    

//     return NextResponse.json({ message: "Cart updated", cart: finalCart });
//   } catch (error) {
//     console.error("❌ Error in POST /api/cart:", error);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

// ✅ GET /api/cart → Fetch cart for logged-in user
export async function GET(req: Request) {
  try {
    // Pass the 'req' object here as well
    const userId = await verifyToken(req); 
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });

    // Your frontend expects the cart object to be nested like { cart: ... } on GET
    // Or return an empty cart structure if none is found.
    if (!cart) {
        return NextResponse.json({ cart: { items: [], totalPrice: 0 } });
    }

    return NextResponse.json({ cart });
  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
async function updateCartTotal(cartId: string) {
    const cartItems = await prisma.cartItem.findMany({ where: { cartId } });
    const newTotalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    return prisma.cart.update({
        where: { id: cartId },
        data: { totalPrice: newTotalPrice },
        include: { items: true },
    });
}
export async function PUT(req: Request) {
  try {
    const userId = await verifyToken(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { cartItemId, quantity } = await req.json();
    if (!cartItemId || quantity === undefined) {
      return NextResponse.json({ error: "Missing cartItemId or quantity" }, { status: 400 });
    }
    
    // Ensure quantity is a positive number
    const newQuantity = Math.max(1, Number(quantity));

    const itemToUpdate = await prisma.cartItem.findFirst({
        where: { id: cartItemId, cart: { userId } }
    });

    if (!itemToUpdate) {
        return NextResponse.json({ error: "Item not found in user's cart" }, { status: 404 });
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: newQuantity },
    });

    const finalCart = await updateCartTotal(itemToUpdate.cartId);
    return NextResponse.json({ message: "Quantity updated", cart: finalCart });

  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
export async function DELETE(req: Request) {
  try {
    const userId = await verifyToken(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { cartItemId } = await req.json();
    if (!cartItemId) {
      return NextResponse.json({ error: "Missing cartItemId" }, { status: 400 });
    }

    const itemToRemove = await prisma.cartItem.findFirst({
        where: { id: cartItemId, cart: { userId } }
    });

    if (!itemToRemove) {
        return NextResponse.json({ error: "Item not found in user's cart" }, { status: 404 });
    }

    await prisma.cartItem.delete({ where: { id: cartItemId } });

    const finalCart = await updateCartTotal(itemToRemove.cartId);
    return NextResponse.json({ message: "Item removed", cart: finalCart });

  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
