import { NextRequest, NextResponse } from 'next/server';
import { OfferService, CartItemForOffer } from '@/lib/services/offerService';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { handleApiError } from '@/lib/errors';
import { z } from 'zod';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

const ValidateOfferSchema = z.object({
  code: z.string().min(1),
  items: z.array(z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
  })).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = ValidateOfferSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { code, items } = validation.data;
    
    // We need to fetch the category ID for each product to support category-specific offers
    const fullItems: CartItemForOffer[] = await Promise.all(items.map(async (item) => {
        const prod = await prisma.product.findUnique({ where: { id: item.productId }, select: { categoryId: true } });
        return {
            price: item.price,
            quantity: item.quantity,
            categoryId: prod?.categoryId || undefined,
        };
    }));

    // Check if user is logged in (optional for some offers, required for others)
    const user = await getUserFromToken(req);
    const userId = user ? user.id : null;

    const result = await OfferService.validateOffer(code, userId, fullItems);

    if (!result.valid) {
      return NextResponse.json({ error: result.message, valid: false }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      message: result.message,
      discount: result.discount,
      offerCode: result.offer?.code,
    });
  } catch (error) {
    console.error('[OFFER_VALIDATE_POST]', error);
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
