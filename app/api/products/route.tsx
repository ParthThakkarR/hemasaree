// /app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { ProductQuerySchema } from "@/app/lib/validators";

// 🟢 Always serve fresh data
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const searchParams = url.searchParams;

    // ✅ Validate pagination parameters with Zod
    const validation = ProductQuerySchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { page, limit } = validation.data;
    const skip = (page - 1) * limit;

    // ✅ Extract filters safely
    const rawCategory = searchParams.get("category");
    const category =
      rawCategory && rawCategory !== "undefined" ? rawCategory.trim() : "";

    const search = searchParams.get("search")?.trim() || "";
    const sortPrice = searchParams.get("sortPrice")?.trim() || "";
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "10000");

    // ✅ Filter products between ₹500 and selected max
    const where: any = {
      price: {
        gte: 500,          // ✅ lower bound (never below ₹500)
        lte: maxPrice,     // ✅ upper bound (slider-selected)
      },
      AND: [],
    };

    // ✅ Category filter
    if (category) {
      const isValidObjectId = /^[a-f\d]{24}$/i.test(category);
      if (isValidObjectId) {
        where.AND.push({ categoryId: category });
      } else {
        where.AND.push({
          category: { name: { equals: category, mode: "insensitive" } },
        });
      }
    }

    // ✅ Search filter (name, color, occasion)
    if (search) {
      where.AND.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { color: { contains: search, mode: "insensitive" } },
          { ocassion: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    // ✅ Sorting logic
    let orderBy: any = { createdAt: "desc" };
    if (sortPrice === "asc") orderBy = { price: "asc" };
    else if (sortPrice === "desc") orderBy = { price: "desc" };

    // ✅ Count total products
    const totalProducts = await prisma.product.count({ where });

    // ✅ Fetch paginated products
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    // ✅ Structured response
    return NextResponse.json({
      products,
      pagination: {
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
        limit,
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[PRODUCTS_GET_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to fetch products. Check query parameters." },
      { status: 500 }
    );
  }
}
