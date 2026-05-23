import { NextRequest, NextResponse } from 'next/server';
import { getImage } from '@/lib/imageStorage';

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const image = await getImage(params.id);
    if (!image) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const buffer = Buffer.from(image.data, 'base64');
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': image.mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('[UPLOADS] Failed to serve image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
