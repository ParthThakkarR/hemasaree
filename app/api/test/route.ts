import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await prisma.user.findFirst({
    include: { addresses: true },
  });
  return NextResponse.json(user);
}
