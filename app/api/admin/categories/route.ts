// app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma'; // 1. Use Prisma singleton
import { verifyAdminToken } from '@/app/utils/auth';
import {
  CategorySchema,
  UpdateCategorySchema,
  DeleteCategorySchema,
} from '@/app/lib/validators'; // 2. Import Zod schemas

export const dynamic = "force-dynamic";

// GET all categories (Public)
export async function GET(req: Request) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('[CATEGORIES_GET_ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST a new category (Admin Only)
export async function POST(req: NextRequest) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();

    // 3. Validate with Zod
    const validation = CategorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    const { name, image } = validation.data;

    const newCategory = await prisma.category.create({
      data: { name, image },
    });
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('[CATEGORIES_POST_ERROR]', error);
    // Handle specific error for unique constraint
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT to update a category (Admin Only)
export async function PUT(req: NextRequest) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();

    // 4. Validate with Zod (safer)
    const validation = UpdateCategorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    // 5. Explicitly destructure allowed fields
    const { id, name, image } = validation.data;

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name, // Prisma handles `undefined` - only updates if a value was passed
        image,
      },
    });
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('[CATEGORIES_PUT_ERROR]', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE a category (Admin Only)
export async function DELETE(req: NextRequest) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // 6. Validate search param with Zod
    const validation = DeleteCategorySchema.safeParse({
      id: req.nextUrl.searchParams.get('id'),
    });
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    const { id } = validation.data;

    // 7. Your excellent referential integrity check
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete. ${productCount} product(s) are still in this category.`,
        },
        { status: 409 } // 409 Conflict
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('[CATEGORIES_DELETE_ERROR]', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}