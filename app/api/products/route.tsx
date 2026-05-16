// /app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ProductQuerySchema } from "@lib/validators";
import { ProductService } from "@/lib/services/productService";
import { cache } from "@/lib/cache";

// 🟢 Always serve fresh data
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

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

    const { page, limit } = validation.data;

    // Extract filters
    const filters = {
      categoryId: searchParams.get("category") || undefined,
      search: searchParams.get("search")?.trim() || undefined,
      maxPrice: parseFloat(searchParams.get("maxPrice") || "10000"),
    };

    const sortBy = searchParams.get("sortPrice")?.trim() || "createdAt";
    const sortOrder = sortBy === "asc" ? "asc" : "desc";

    const result = await ProductService.getProducts(filters, { page, limit, sortBy: 'price', sortOrder });

    const responseData = {
      products: result.products,
      pagination: {
        totalProducts: result.total,
        totalPages: result.pages,
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


