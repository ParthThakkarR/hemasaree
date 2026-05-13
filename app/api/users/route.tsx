// /app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@lib/prisma'; // 1. Use Prisma singleton
import { verifyAdminToken } from '@/app/utils/auth';
import { PaginationSchema } from '@lib/validators'; // 2. Import pagination schema

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // 3. Use NextRequest
  // Only admins can access user data
  const adminId = await verifyAdminToken(req);
  if (!adminId) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin access required' },
      { status: 401 }
    );
  }

  try {
    // 4. Validate pagination query params
    const validation = PaginationSchema.safeParse({
      page: req.nextUrl.searchParams.get('page'),
      limit: req.nextUrl.searchParams.get('limit'),
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { page, limit } = validation.data;
    const skip = (page - 1) * limit;

    // 5. Fetch total count and paginated users (in parallel)
    const [totalUsers, users] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.findMany({
        skip: skip,
        take: limit,
        // 6. Your flawless 'select' logic
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          isAdmin: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    // 7. Return data + pagination info
    return NextResponse.json({
      users,
      pagination: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    // 8. Add specific logging
    console.error('[ADMIN_GET_USERS_ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
