import { NextResponse } from 'next/server';
import { OfferService } from '@/lib/services/offerService';
import { handleApiError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const offers = await OfferService.getActiveOffers();
    return NextResponse.json(offers);
  } catch (error) {
    console.error('[OFFERS_GET]', error);
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
