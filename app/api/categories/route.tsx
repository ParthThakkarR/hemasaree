// /app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma'; // 1. Use Prisma singleton

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: true,
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    // 2. Add specific logging
    console.error('[CATEGORIES_GET_PUBLIC_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
