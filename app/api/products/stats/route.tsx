import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/products/stats — Aggregate stats for social proof
export async function GET(req: NextRequest) {
  try {
    const productIds = req.nextUrl.searchParams.get('ids')?.split(',').filter(Boolean);

    // Global stats (for hero section)
    const totalOrders = await prisma.order.count({ where: { status: { in: ['DELIVERED', 'SHIPPED', 'PENDING'] } } });
    const globalRating = await prisma.review.aggregate({
      where: { isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // Per-product stats (if IDs provided)
    let productStats: Record<string, any> = {};

    if (productIds && productIds.length > 0) {
      const reviews = await prisma.review.groupBy({
        by: ['productId'],
        where: { productId: { in: productIds }, isApproved: true },
        _avg: { rating: true },
        _count: { rating: true },
      });

      const orderCounts = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: { productId: { in: productIds } },
        _sum: { quantity: true },
      });

      const wishlistCounts = await prisma.wishlistItem.groupBy({
        by: ['productId'],
        where: { productId: { in: productIds } },
        _count: { productId: true },
      });

      for (const id of productIds) {
        const review = reviews.find(r => r.productId === id);
        const orders = orderCounts.find(o => o.productId === id);
        const wishlists = wishlistCounts.find(w => w.productId === id);

        productStats[id] = {
          avgRating: review ? Math.round((review._avg.rating || 0) * 10) / 10 : 0,
          reviewCount: review?._count.rating || 0,
          orderCount: orders?._sum.quantity || 0,
          wishlistCount: wishlists?._count.productId || 0,
        };
      }
    }

    return NextResponse.json({
      global: {
        totalOrders,
        avgRating: globalRating._avg.rating ? Math.round(globalRating._avg.rating * 10) / 10 : 0,
        totalReviews: globalRating._count.rating,
      },
      products: productStats,
    });
  } catch (error) {
    console.error('[PRODUCT_STATS_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
