import { NextResponse } from 'next/server';
import { getDashboardStats, getSalesReport, getTopProducts } from '@/lib/analyticsService';
import { verifyAdminToken } from '@/app/utils/auth';

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [stats, sales, topProducts] = await Promise.all([
      getDashboardStats(),
      getSalesReport(),
      getTopProducts(),
    ]);

    return NextResponse.json({ stats, sales, topProducts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
