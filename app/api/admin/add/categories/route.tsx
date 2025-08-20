// import { PrismaClient } from "@/app/generated/prisma";
// import { NextResponse } from "next/server";

// const prisma = new PrismaClient();

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { categoryName, categoryImage } = body;

//     if (!categoryName || !categoryImage) {
//       return NextResponse.json({ error: "categoryName and categoryImage are required" }, { status: 400 });
//     }

//     const newCategory = await prisma.category.create({
//       data: {
//         name: categoryName,
//         image: categoryImage,
//       },
//     });

//     return NextResponse.json(newCategory, { status: 201 });
//   } catch (error) {
//     console.error("Error adding category:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

import { PrismaClient } from "@/app/generated/prisma";
import { getUserFromToken } from "@/app/lib/getUserFromToken"; // <-- IMPORT THIS
import { NextRequest, NextResponse } from "next/server"; // <-- USE NextRequest

const prisma = new PrismaClient();

export async function POST(req: NextRequest) { // <-- CHANGE to NextRequest
  try {
    // --- ADD THIS SECURITY BLOCK ---
    const tokenUser = getUserFromToken(req);
    if (!tokenUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: tokenUser.id },
      select: { isAdmin: true }
    });
    if (!user || !user.isAdmin) {
      return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
    }
    // --- END SECURITY BLOCK ---

    const body = await req.json();
    const { name, image } = body;

    if (!name || !image) {
      return NextResponse.json({ message: "Name and image are required" }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: { name, image },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("Error adding category:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}