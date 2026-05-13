import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@app/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/wishlist - Fetch user's wishlist
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { wishlist: { select: { productId: true } } }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const productIds = user.wishlist.map(item => item.productId);
    return NextResponse.json(productIds);
  } catch (error) {
    console.error("[WISHLIST_GET_ERROR]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/wishlist - Toggle product in wishlist
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) return NextResponse.json({ error: "Product ID is required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId
        }
      }
    });

    if (existingItem) {
      await prisma.wishlistItem.delete({
        where: { id: existingItem.id }
      });
      return NextResponse.json({ message: "Removed from wishlist", action: "removed" });
    } else {
      await prisma.wishlistItem.create({
        data: {
          userId: user.id,
          productId: productId
        }
      });
      return NextResponse.json({ message: "Added to wishlist", action: "added" });
    }
  } catch (error) {
    console.error("[WISHLIST_POST_ERROR]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/wishlist - Clear user's wishlist
export async function DELETE() {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
  
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  
      await prisma.wishlistItem.deleteMany({
        where: { userId: user.id }
      });
  
      return NextResponse.json({ message: "Wishlist cleared" });
    } catch (error) {
      console.error("[WISHLIST_DELETE_ERROR]", error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }

