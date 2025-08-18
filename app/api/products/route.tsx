// /api/products/route.ts
import { PrismaClient } from "@/app/generated/prisma";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {   // ✅ This makes category data available in the response
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return NextResponse.json(products);
  } catch (err) {
    console.error("Failed to fetch products", err);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
