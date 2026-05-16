// /app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { IdParamSchema } from '@lib/validators';

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
      include: {
        category: { select: { id: true, name: true } },
        reviews: {
          where: { isApproved: true },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, name: true, image: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: {
          select: {
            reviews: { where: { isApproved: true } },
            orderItems: true,
            wishlistItems: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Calculate avg rating
    const ratingStats = await prisma.review.aggregate({
      where: { productId: id, isApproved: true },
      _avg: { rating: true },
    });

    // Rating distribution
    const distribution = await Promise.all(
      [5, 4, 3, 2, 1].map(async (star) => {
        const count = await prisma.review.count({
          where: { productId: id, isApproved: true, rating: star },
        });
        return { stars: star, count };
      })
    );

    return NextResponse.json({
      ...product,
      reviewStats: {
        avgRating: ratingStats._avg.rating ? Math.round(ratingStats._avg.rating * 10) / 10 : 0,
        totalReviews: product._count.reviews,
        totalOrders: product._count.orderItems,
        totalWishlists: product._count.wishlistItems,
        distribution,
      },
    });
  } catch (error) {
    console.error('[PRODUCT_GET_BY_ID_PUBLIC_ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
