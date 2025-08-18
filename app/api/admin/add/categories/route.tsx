import { PrismaClient } from "@/app/generated/prisma";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { categoryName, categoryImage } = body;

    if (!categoryName || !categoryImage) {
      return NextResponse.json({ error: "categoryName and categoryImage are required" }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: {
        name: categoryName,
        image: categoryImage,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("Error adding category:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
