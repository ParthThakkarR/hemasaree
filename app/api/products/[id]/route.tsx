// /app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { IdParamSchema } from '@lib/validators';
import { ProductService } from '@/lib/services/productService';

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const validation = IdParamSchema.safeParse({ id: params.id });
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    const { id } = validation.data;

    const product = await ProductService.getProductById(id);
    return NextResponse.json(product);
  } catch (error: any) {
    console.error('[PRODUCT_GET_BY_ID_PUBLIC_ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
