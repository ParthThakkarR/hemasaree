import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { verifyAdminToken } from '@utils/auth';
import { ProductSchema, UpdateProductSchema, DeleteProductSchema } from '@lib/validators';
import { cache } from '@/lib/cache';

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/** Bust every cached product-list entry so the public API serves fresh data. */
async function invalidateProductCache() {
  try {
    await cache.clearPattern('products:list:*');
    console.log('[ADMIN] Product list cache invalidated');
  } catch (err) {
    console.error('[ADMIN] Failed to invalidate product list cache:', err);
  }
}

/** Apply no-cache headers to prevent browser/CDN from caching responses. */
function noCacheResponse(data: any, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...init?.headers,
      'Cache-Control': 'no-cache, no-store, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

// GET all products (Admin)
export async function GET(req: NextRequest) {
  try {
    const isDeletedParam = req.nextUrl.searchParams.get('isDeleted');
    const isDeleted = isDeletedParam === 'true';

    const products = await prisma.product.findMany({
      where: { isDeleted },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return noCacheResponse(products);
  } catch (error) {
    console.error('[PRODUCTS_GET_ERROR]', error);
    return noCacheResponse({ error: 'Server error' }, { status: 500 });
  }
}

// POST a new product (Write-Through: DB + cache updated together)
export async function POST(req: NextRequest) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) return noCacheResponse({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const validation = ProductSchema.safeParse(body);
    if (!validation.success) {
      return noCacheResponse({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { name, description, color, fabric, occasion, price, mrp, stock, categoryId, images } = validation.data;

    // Write-Through: create in DB, then update product detail cache
    const newProduct = await cache.writeThrough(
      `products:detail:`,
      async () => {
        return prisma.product.create({
          data: {
            name,
            description: description || null,
            color,
            fabric: fabric || null,
            occasion,
            price,
            mrp: mrp || null,
            stock,
            categoryId,
            images,
            userId: adminId,
          },
          include: { category: { select: { id: true, name: true } } },
        });
      },
      600
    );

    // Invalidate all product list caches (list queries depend on filters/sorting)
    await invalidateProductCache();

    return noCacheResponse({ message: 'Product added successfully', newProduct }, { status: 201 });
  } catch (err) {
    console.error('[PRODUCTS_POST_ERROR]', err);
    return noCacheResponse({ error: 'Failed to add product' }, { status: 500 });
  }
}

// PUT update a product (Write-Through: DB + cache updated together)
export async function PUT(req: NextRequest) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) return noCacheResponse({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const validation = UpdateProductSchema.safeParse(body);
    if (!validation.success) {
      return noCacheResponse({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { id, ...updateData } = validation.data;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return noCacheResponse({ error: 'Product not found' }, { status: 404 });

    // Write-Through: update in DB, then update product detail cache
    const updated = await cache.writeThrough(
      `products:detail:${id}`,
      async () => {
        return prisma.product.update({
          where: { id },
          data: {
            ...updateData,
            images: updateData.images || existing.images,
          },
          include: { category: { select: { id: true, name: true } } },
        });
      },
      600
    );

    // Invalidate all product list caches
    await invalidateProductCache();

    return noCacheResponse(updated);
  } catch (error) {
    console.error('[PRODUCTS_PUT_ERROR]', error);
    return noCacheResponse({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE a product (soft delete - invalidate caches)
export async function DELETE(req: NextRequest) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) return noCacheResponse({ error: 'Unauthorized' }, { status: 401 });

  try {
    const validation = DeleteProductSchema.safeParse({
      id: req.nextUrl.searchParams.get('id'),
    });
    if (!validation.success) {
      return noCacheResponse({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { id } = validation.data;

    await prisma.product.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });

    // Invalidate both detail and list caches
    await cache.delete(`products:detail:${id}`);
    await invalidateProductCache();

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[PRODUCTS_DELETE_ERROR]', error);
    return noCacheResponse({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH restore a product (Write-Through: DB + cache updated together)
export async function PATCH(req: NextRequest) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) return noCacheResponse({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return noCacheResponse({ error: 'ID is required' }, { status: 400 });

    // Write-Through: restore in DB, then update product detail cache
    const updated = await cache.writeThrough(
      `products:detail:${id}`,
      async () => {
        return prisma.product.update({
          where: { id },
          data: { isDeleted: false, deletedAt: null },
          include: { category: { select: { id: true, name: true } } },
        });
      },
      600
    );

    await invalidateProductCache();

    return noCacheResponse({ message: 'Product restored successfully', product: updated });
  } catch (error) {
    console.error('[PRODUCTS_RESTORE_ERROR]', error);
    return noCacheResponse({ error: 'Failed to restore product' }, { status: 500 });
  }
}
