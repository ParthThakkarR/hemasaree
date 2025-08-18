import { PrismaClient } from "@/app/generated/prisma";
import { getUserFromToken } from "@/app/lib/getUserFromToken";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const tokenUser = getUserFromToken(req);

    if (!tokenUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenUser.id },
      select: { isAdmin: true }
    });

    if (!user || !user.isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, price, stock, categoryId, images } = body;

    // Basic validation
    if (
      !name ||
      !description ||
      !price ||
      !stock ||
      !categoryId ||
      !images ||
      !Array.isArray(images) ||
      images.length === 0
    ) {
      return NextResponse.json(
        { error: "All product fields including categoryId and at least one image are required" },
        { status: 400 }
      );
    }

    // Create product with categoryId
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        categoryId,  // Use categoryId here!
        images,
        userId: tokenUser.id,
      },
    });

    return NextResponse.json({ message: "Product Added", newProduct }, { status: 201 });
  } catch (err) {
    console.error("Error adding product:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
