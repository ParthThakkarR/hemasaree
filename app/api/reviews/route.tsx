import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/reviews?productId=X — Public: fetch approved reviews for a product
export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.searchParams.get('productId');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
    const sort = req.nextUrl.searchParams.get('sort') || 'newest'; // newest | highest

    if (!productId) {
      // Return latest approved reviews across all products (for homepage)
      const reviews = await prisma.review.findMany({
        where: { isApproved: true },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, name: true, image: true } },
          product: { select: { id: true, name: true, images: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return NextResponse.json({ reviews });
    }

    // Get reviews for specific product
    const orderBy: any = sort === 'highest' ? { rating: 'desc' } : { createdAt: 'desc' };

    const reviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, name: true, image: true } },
      },
      orderBy,
      take: limit,
    });

    // Calculate stats
    const stats = await prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // Rating distribution
    const distribution = await Promise.all(
      [5, 4, 3, 2, 1].map(async (star) => {
        const count = await prisma.review.count({
          where: { productId, isApproved: true, rating: star },
        });
        return { stars: star, count };
      })
    );

    return NextResponse.json({
      reviews,
      stats: {
        avgRating: Math.round((stats._avg.rating || 0) * 10) / 10,
        totalReviews: stats._count.rating,
        distribution,
      },
    });
  } catch (error) {
    console.error('[REVIEWS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST /api/reviews — Authenticated: submit a review
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Please login to write a review' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { productId, rating, title, text, images } = body;

    if (!productId || !rating || !text) {
      return NextResponse.json({ error: 'Product, rating, and review text are required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    if (text.length < 10) {
      return NextResponse.json({ error: 'Review must be at least 10 characters' }, { status: 400 });
    }

    // Check if user already reviewed this product
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 409 });
    }

    // Check if user has purchased this product (verified purchase)
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: { in: ['DELIVERED'] },
        },
      },
    });

    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        title: title || null,
        text,
        images: images || [],
        isApproved: false, // Requires admin approval
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, name: true } },
      },
    });

    return NextResponse.json({
      review,
      isVerifiedPurchase: !!hasPurchased,
      message: 'Review submitted! It will appear after admin approval.',
    }, { status: 201 });
  } catch (error) {
    console.error('[REVIEWS_POST_ERROR]', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
