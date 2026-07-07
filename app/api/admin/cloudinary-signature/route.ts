import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@utils/auth';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const folder = body.folder || 'products';

    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!uploadPreset || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary is not fully configured on the server. Please set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.' },
        { status: 500 }
      );
    }

    const timestamp = Math.round(Date.now() / 1000);
    const cloudFolder = `hemasaree/${folder}`;

    const params: Record<string, string> = {
      timestamp: String(timestamp),
      folder: cloudFolder,
      upload_preset: uploadPreset,
    };

    const sortedKeys = Object.keys(params).sort();
    const toSign = sortedKeys.map(key => `${key}=${params[key]}`).join('&') + apiSecret;
    const signature = crypto.createHash('sha1').update(toSign).digest('hex');

    return NextResponse.json({
      signature,
      timestamp,
      api_key: apiKey,
      folder: cloudFolder,
      upload_preset: uploadPreset,
    });
  } catch (error) {
    console.error('[CLOUDINARY_SIGNATURE_ERROR]', error);
    return NextResponse.json({ error: 'Failed to generate upload signature' }, { status: 500 });
  }
}
