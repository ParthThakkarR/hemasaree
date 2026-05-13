import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/searchService';

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const results = await searchProducts({
      query: searchParams.get('q'),
      category: searchParams.get('category'),
      color: searchParams.get('color'),
      occasion: searchParams.get('occasion'),
      minPrice: parseFloat(searchParams.get('minPrice') || '0'),
      maxPrice: parseFloat(searchParams.get('maxPrice') || '0'),
      sort: searchParams.get('sort'),
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '12'),
    });

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

