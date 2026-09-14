// /app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ProductQuerySchema } from "@lib/validators";
import { ProductService } from "@/lib/services/productService";

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

    // Extract filters — support comma-separated multi-category
    const categoryParam = searchParams.get("category") || "";
    const categoryList = categoryParam
      .split(",")
      .map(c => c.trim())
      .filter(Boolean);

    const filters = {
      categoryId: categoryList.length === 1 ? categoryList[0] : undefined,
      categoryIds: categoryList.length > 1 ? categoryList : undefined,
      search: searchParams.get("search")?.trim() || undefined,
      minPrice: searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined,
      maxPrice: searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined,
      color: searchParams.get("color")?.trim() || undefined,
      fabric: searchParams.get("fabric")?.trim() || undefined,
      occasion: searchParams.get("occasion")?.trim() || undefined,
    };

    const sortPrice = searchParams.get("sortPrice")?.trim();
    let sortBy: 'price' | 'createdAt' = 'createdAt';
    let sortOrder: 'asc' | 'desc' = 'desc';
    if (sortPrice === 'low') { sortBy = 'price'; sortOrder = 'asc'; }
    else if (sortPrice === 'high') { sortBy = 'price'; sortOrder = 'desc'; }
    else if (sortPrice === 'newest') { sortBy = 'createdAt'; sortOrder = 'desc'; }

    // ProductService.getProducts uses Read-Through cache internally (15 min TTL)
    const result = await ProductService.getProducts(filters, { page, limit, sortBy, sortOrder });

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

    // Return with CDN-friendly cache headers (stale-while-revalidate)
    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'Vary': 'Accept-Encoding',
      },
    });
  } catch (err: any) {
    console.error("[PRODUCTS_GET_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to fetch products. Check query parameters." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sections } = body as { sections: Array<{ key: string; limit: number; sortPrice?: string; category?: string }> };

    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const results: Record<string, any> = {};

    await Promise.all(
      sections.map(async (section) => {
        const filters = {
          categoryId: section.category || undefined,
          maxPrice: 10000,
        };
        const sortPrice = section.sortPrice;
        const sortOrder = sortPrice === 'asc' || sortPrice === 'low' ? 'asc' : 'desc';
        const sortBy = 'price';

        const result = await ProductService.getProducts(filters, {
          page: 1,
          limit: section.limit,
          sortBy,
          sortOrder,
        });

        results[section.key] = result.products;
      })
    );

    return NextResponse.json({ sections: results });
  } catch (err: any) {
    console.error("[PRODUCTS_BATCH_ERROR]", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}


