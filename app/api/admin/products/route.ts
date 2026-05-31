import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { verifyAdminToken } from '@utils/auth';
import { ProductSchema, UpdateProductSchema, DeleteProductSchema } from '@lib/validators';
import { cache } from '@/lib/cache';

export const dynamic = "force-dynamic";

/** Bust every cached product-list entry so the public API serves fresh data. */
async function invalidateProductCache() {
  await cache.clearPattern('products:*');
  console.log('[ADMIN] Product cache invalidated');
}

// GET all products (Public)
export async function GET(req: NextRequest) {
  try {
    const isDeletedParam = req.nextUrl.searchParams.get('isDeleted');
    const isDeleted = isDeletedParam === 'true';

    const products = await prisma.product.findMany({
      where: { isDeleted },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('[PRODUCTS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST a new product
export async function POST(req: NextRequest) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const validation = ProductSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { name, description, color, fabric, occasion, price, mrp, stock, categoryId, images } = validation.data;

    const newProduct = await prisma.product.create({
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
    });

    // ✅ Invalidate cache so public API serves fresh data
    await invalidateProductCache();

    return NextResponse.json({ message: 'Product added successfully', newProduct });
  } catch (err) {
    console.error('[PRODUCTS_POST_ERROR]', err);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}

// PUT update a product
export async function PUT(req: NextRequest) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const validation = UpdateProductSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { id, ...updateData } = validation.data;

    // ✅ Smart append handling
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        images: updateData.images || existing.images,
      },
    });

    // ✅ Invalidate cache so public API serves fresh data
    await invalidateProductCache();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PRODUCTS_PUT_ERROR]', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE a product
export async function DELETE(req: NextRequest) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const validation = DeleteProductSchema.safeParse({
      id: req.nextUrl.searchParams.get('id'),
    });
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { id } = validation.data;

    // Soft delete implementation
    await prisma.product.update({ 
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });

    // ✅ Invalidate cache so public API serves fresh data
    await invalidateProductCache();

    return NextResponse.json({ message: 'Product moved to recycle bin successfully' });
  } catch (error) {
    console.error('[PRODUCTS_DELETE_ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH restore a product
export async function PATCH(req: NextRequest) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const updated = await prisma.product.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null }
    });

    await invalidateProductCache();

    return NextResponse.json({ message: 'Product restored successfully', product: updated });
  } catch (error) {
    console.error('[PRODUCTS_RESTORE_ERROR]', error);
    return NextResponse.json({ error: 'Failed to restore product' }, { status: 500 });
  }
}


