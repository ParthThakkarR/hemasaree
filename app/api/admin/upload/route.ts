import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { verifyAdminToken } from '@utils/auth';
import { storeImage } from '@/lib/imageStorage';

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const fetchCache = 'force-no-store';

<<<<<<< HEAD
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
=======
// Allowed MIME types — includes HEIC/HEIF (iPhone default format)
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

// Allowed file extensions for fallback when MIME type is empty/unknown
const ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB to handle large phone camera photos

/**
 * Determine whether a file is an allowed image.
 * Some mobile browsers (especially older Android Chrome, Samsung Internet,
 * and in-app WebViews) send an empty string or "application/octet-stream"
 * as the MIME type. We fall back to checking the file extension.
 */
function isAllowedImage(file: File): boolean {
  const mime = file.type?.toLowerCase() || '';

  // 1. Check MIME type first
  if (mime && ALLOWED_MIME_TYPES.includes(mime)) return true;

  // 2. Fallback: check extension
  const ext = '.' + (file.name?.split('.').pop()?.toLowerCase() || '');
  if (ALLOWED_EXTENSIONS.includes(ext)) return true;

  // 3. Accept generic binary blobs that have a valid image extension
  if ((mime === '' || mime === 'application/octet-stream') && ALLOWED_EXTENSIONS.includes(ext)) {
    return true;
  }

  return false;
}
>>>>>>> 7bacb9b ( implement admin dashboard components for category management, product listing, and file upload API route)

async function processAndStore(buffer: Buffer, fileName: string): Promise<string> {
  // sharp() can handle JPEG, PNG, WebP, HEIF/HEIC, TIFF, AVIF, GIF
  const webpBuffer = await sharp(buffer, { failOn: 'none' })
    .rotate() // Auto-rotate based on EXIF (phones often store rotated)
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
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (parseError) {
      console.error('[UPLOAD] FormData parsing failed:', parseError);
      return NextResponse.json(
        { error: 'Upload too large or connection interrupted. Try smaller images or fewer files at once.' },
        { status: 413 }
      );
    }

    const files = formData.getAll('files') as File[];
    if (!files || files.length === 0) {
      return noCacheResponse({ error: 'No files provided.' }, { status: 400 });
    }

    // Validate all files upfront
    for (const file of files) {
<<<<<<< HEAD
      if (!ALLOWED_TYPES.includes(file.type)) {
        return noCacheResponse(
          { error: `Invalid file type for "${file.name}". Allowed: JPEG, PNG, WebP.` },
=======
      if (!isAllowedImage(file)) {
        const ext = file.name?.split('.').pop()?.toLowerCase() || 'unknown';
        return NextResponse.json(
          {
            error: `"${file.name}" has an unsupported format (${file.type || ext}). Allowed: JPEG, PNG, WebP, HEIC.`,
          },
>>>>>>> 7bacb9b ( implement admin dashboard components for category management, product listing, and file upload API route)
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
<<<<<<< HEAD
        return noCacheResponse(
          { error: `"${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 5MB per file.` },
=======
        return NextResponse.json(
          {
            error: `"${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 10MB per image.`,
          },
          { status: 400 }
        );
      }
      // Extra guard: some broken uploads report size 0
      if (file.size === 0) {
        return NextResponse.json(
          { error: `"${file.name}" appears to be empty. Please try selecting the image again.` },
>>>>>>> 7bacb9b ( implement admin dashboard components for category management, product listing, and file upload API route)
          { status: 400 }
        );
      }
    }

    const urls: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());

        try {
          const url = await processAndStore(buffer, file.name);
          urls.push(url);
        } catch (storeErr) {
          console.error(`[UPLOAD] Storage failed for "${file.name}":`, storeErr);
          // Fallback: write directly to disk
          const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const finalName = `${Date.now()}_${sanitizedName}`;
          const uploadDir = path.join(process.cwd(), 'public/uploads/products');
          await mkdir(uploadDir, { recursive: true });
          await writeFile(path.join(uploadDir, finalName), buffer);
          urls.push(`/uploads/products/${finalName}`);
        }
      } catch (fileErr) {
        console.error(`[UPLOAD] Failed to process "${file.name}":`, fileErr);
        errors.push(file.name);
      }
    }

<<<<<<< HEAD
    return noCacheResponse({ message: 'Files uploaded successfully', urls });
  } catch (error) {
    console.error('[FILE_UPLOAD_ERROR]', error);
    return noCacheResponse({ error: 'File upload failed. Please try again.' }, { status: 500 });
=======
    if (urls.length === 0) {
      return NextResponse.json(
        { error: 'All files failed to upload. Please try again with different images.' },
        { status: 500 }
      );
    }

    const response: Record<string, unknown> = {
      message: 'Files uploaded successfully',
      urls,
    };

    if (errors.length > 0) {
      response.warnings = `Some files failed: ${errors.join(', ')}`;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[FILE_UPLOAD_ERROR]', error);
    return NextResponse.json(
      { error: 'File upload failed. Please check your connection and try again.' },
      { status: 500 }
    );
>>>>>>> 7bacb9b ( implement admin dashboard components for category management, product listing, and file upload API route)
  }
}
