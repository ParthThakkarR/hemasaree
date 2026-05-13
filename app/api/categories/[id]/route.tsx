// /app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@lib/prisma'; // 1. Use Prisma singleton
import { IdParamSchema } from '@lib/validators'; // 2. Import Zod schema

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // 3. Validate the ID from the URL
    const validation = IdParamSchema.safeParse({ id: context.params.id });
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    const { id } = validation.data;

    // 4. Fetch the category using the singleton
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('[CATEGORY_GET_BY_ID_PUBLIC_ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
