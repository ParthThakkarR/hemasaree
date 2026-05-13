import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { verifyAdminToken } from '@utils/auth';

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const logs = await prisma.emailLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


