// /app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@app/lib/prisma'; // 1. Use Prisma singleton

export const dynamic = "force-dynamic";

import { verifyAdminToken } from '@app/utils/auth';
import { IdParamSchema } from '@app/lib/validators'; // 2. Import Zod schema

export async function GET(
  req: NextRequest, // 3. Use NextRequest to be consistent
  { params }: { params: { id: string } }
) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin access required' },
      { status: 401 }
    );
  }

  try {
    // 4. Validate the ID from the URL
    const validation = IdParamSchema.safeParse({ id: params.id });
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    const { id } = validation.data;

    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCT_GET_BY_ID_ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
