import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/admin/reviews — Admin: list all reviews
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const status = req.nextUrl.searchParams.get('status'); // pending | approved | all
    const where: any = {};

    if (status === 'pending') where.isApproved = false;
    else if (status === 'approved') where.isApproved = true;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, name: true, email: true, image: true } },
        product: { select: { id: true, name: true, images: true, price: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const counts = {
      total: await prisma.review.count(),
      pending: await prisma.review.count({ where: { isApproved: false } }),
      approved: await prisma.review.count({ where: { isApproved: true } }),
    };

    return NextResponse.json({ reviews, counts });
  } catch (error) {
    console.error('[ADMIN_REVIEWS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// PUT /api/admin/reviews — Admin: approve/reject/delete a review
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { reviewId, action } = body; // action: 'approve' | 'reject' | 'delete'

    if (!reviewId || !action) {
      return NextResponse.json({ error: 'reviewId and action are required' }, { status: 400 });
    }

    if (action === 'delete') {
      await prisma.review.delete({ where: { id: reviewId } });
      return NextResponse.json({ message: 'Review deleted' });
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { isApproved: action === 'approve' },
    });

    return NextResponse.json({ review, message: `Review ${action}d` });
  } catch (error) {
    console.error('[ADMIN_REVIEWS_PUT_ERROR]', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}
