// import { PrismaClient } from "@/app/generated/prisma";
// import { NextResponse } from "next/server";

// const Prisma = new PrismaClient

// export async function GET(){
//     const categories= await Prisma.categories.findMany();
//     return NextResponse.json(categories);
// }
// /app/api/categories/route.ts
import { PrismaClient } from "@/app/generated/prisma";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: true, // ✅ Include products if you need them on category
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
