// /app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma'; // 1. Use Prisma singleton
import { verifyAdminToken } from '@/app/utils/auth';
import { IdParamSchema } from '@/app/lib/validators'; // 2. Import Zod schema

export async function GET(
  req: NextRequest, // 3. Use NextRequest
  { params }: { params: { id: string } }
) {
  // Only admins can access individual user data
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

    const user = await prisma.user.findUnique({
      where: { id },
      // 5. Your flawless 'select' logic
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
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    // 6. Add specific logging
    console.error('[ADMIN_GET_USER_BY_ID_ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}