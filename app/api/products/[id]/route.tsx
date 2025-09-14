import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

// GET /api/products/[id] -> Fetch a single product by its ID
export async function GET(
  req: Request,
  // This is the correct, modern way to access route parameters in Next.js
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
