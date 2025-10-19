
// /app/api/admin/categories/[id]/route.ts
import { PrismaClient } from "@/app/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: context.params.id },
    });

    if (!category) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Failed to fetch category", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
