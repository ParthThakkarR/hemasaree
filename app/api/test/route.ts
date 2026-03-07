import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  const user = await prisma.user.findFirst({
    include: { addresses: true },
  });
  return NextResponse.json(user);
}
