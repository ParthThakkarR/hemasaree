// /app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { ProductQuerySchema } from "@lib/validators";

// 🟢 Always serve fresh data
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { cache } from "@/lib/cache";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const searchParams = url.searchParams;
    const cacheKey = `products:${url.search}`;

    // ✅ Try to get from cache
    const cachedData = await cache.get<any>(cacheKey);
    if (cachedData) {
      console.log(`[PRODUCTS] Cache HIT: ${cacheKey}`);
      return NextResponse.json(cachedData);
    }

    console.log(`[PRODUCTS] Cache MISS: ${cacheKey}`);

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
    // ... rest of query logic

    const { page, limit } = validation.data;
    const skip = (page - 1) * limit;

    // ... where, search, sort logic ...

    // ✅ Extract filters safely
    const rawCategory = searchParams.get("category");
    const category =
      rawCategory && rawCategory !== "undefined" ? rawCategory.trim() : "";

    const search = searchParams.get("search")?.trim() || "";
    const sortPrice = searchParams.get("sortPrice")?.trim() || "";
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "10000");

    const where: any = {
      price: {
        gte: 500,
        lte: maxPrice,
      },
      AND: [],
    };

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

    if (search) {
      where.AND.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { color: { contains: search, mode: "insensitive" } },
          { ocassion: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    let orderBy: any = { createdAt: "desc" };
    if (sortPrice === "asc") orderBy = { price: "asc" };
    else if (sortPrice === "desc") orderBy = { price: "desc" };

    const totalProducts = await prisma.product.count({ where });

    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: { select: { id: true, name: true } },
        _count: {
          select: { reviews: { where: { isApproved: true } } },
        },
      },
    });

    // Attach review stats to each product
    const productIds = products.map(p => p.id);
    const reviewStats = await prisma.review.groupBy({
      by: ['productId'],
      where: { productId: { in: productIds }, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const enrichedProducts = products.map(p => {
      const stats = reviewStats.find(r => r.productId === p.id);
      return {
        ...p,
        reviewStats: stats ? {
          avgRating: Math.round((stats._avg.rating || 0) * 10) / 10,
          totalReviews: stats._count.rating,
        } : undefined,
      };
    });

    const responseData = {
      products: enrichedProducts,
      pagination: {
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
        limit,
      },
      updatedAt: new Date().toISOString(),
    };

    // ✅ Set cache (15 minutes for product lists)
    await cache.set(cacheKey, responseData, 900);

    return NextResponse.json(responseData);
  } catch (err: any) {
    console.error("[PRODUCTS_GET_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to fetch products. Check query parameters." },
      { status: 500 }
    );
  }
}


