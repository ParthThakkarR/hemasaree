import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { verifyAdminToken } from '@utils/auth';
import { optimizeImage } from '@/lib/imageService';
import { storeImage } from '@/lib/imageStorage';

export const dynamic = "force-dynamic";
export const maxDuration = 30;
export const fetchCache = 'force-no-store';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const adminId = await verifyAdminToken(req);
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided.' }, { status: 400 });
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type for "${file.name}". Allowed: JPEG, PNG, WebP.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `"${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 5MB per file.` },
          { status: 400 }
        );
      }
    }

    const urls: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      try {
        const optimizedUrl = await optimizeImage(buffer, file.name);
        urls.push(optimizedUrl);
      } catch (optimizeErr) {
        try {
          const mongoUrl = await storeImage(buffer, file.name);
          urls.push(mongoUrl);
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
    }

    return NextResponse.json({ message: 'Files uploaded successfully', urls });
  } catch (error) {
    console.error('[FILE_UPLOAD_ERROR]', error);
    return NextResponse.json({ error: 'File upload failed. Please try again.' }, { status: 500 });
  }
}
