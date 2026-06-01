import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { verifyAdminToken } from '@utils/auth';
import { storeImage } from '@/lib/imageStorage';

export const dynamic = "force-dynamic";
export const maxDuration = 30;
export const fetchCache = 'force-no-store';

function noCacheResponse(data: any, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...init?.headers,
      'Cache-Control': 'no-cache, no-store, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

async function processAndStore(buffer: Buffer, fileName: string): Promise<string> {
  const webpBuffer = await sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const base64 = webpBuffer.toString('base64');
  return await storeImage(base64, 'image/webp', fileName);
}

export async function POST(req: NextRequest) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) {
    return noCacheResponse({ error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    if (!files || files.length === 0) {
      return noCacheResponse({ error: 'No files provided.' }, { status: 400 });
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return noCacheResponse(
          { error: `Invalid file type for "${file.name}". Allowed: JPEG, PNG, WebP.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return noCacheResponse(
          { error: `"${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 5MB per file.` },
          { status: 400 }
        );
      }
    }

    const urls: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      try {
        const url = await processAndStore(buffer, file.name);
        urls.push(url);
      } catch (storeErr) {
        console.error(`[UPLOAD] All storage methods failed for "${file.name}":`, storeErr);
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const finalName = `${Date.now()}_${sanitizedName}`;
        const uploadDir = path.join(process.cwd(), 'public/uploads/products');
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, finalName), buffer);
        urls.push(`/uploads/products/${finalName}`);
      }
    }

    return noCacheResponse({ message: 'Files uploaded successfully', urls });
  } catch (error) {
    console.error('[FILE_UPLOAD_ERROR]', error);
    return noCacheResponse({ error: 'File upload failed. Please try again.' }, { status: 500 });
  }
}
