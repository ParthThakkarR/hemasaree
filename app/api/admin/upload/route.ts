import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { verifyAdminToken } from '@utils/auth';
import { storeImage } from '@/lib/imageStorage';

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const fetchCache = 'force-no-store';

/** Apply no-cache headers to prevent browser/CDN from caching responses. */
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

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB per image (Vercel Hobby limit: 4.5MB total request body)
const MAX_TOTAL_SIZE = 4 * 1024 * 1024; // 4MB combined (matches Vercel serverless function limit)

/**
 * Determine whether a file is an allowed image.
 * Some mobile browsers (especially older Android Chrome, Samsung Internet,
 * and in-app WebViews) send an empty string or "application/octet-stream"
 * as the MIME type. We fall back to checking the file extension.
 */
function isAllowedImage(file: File): boolean {
  const mime = file.type?.toLowerCase() || '';
  const fileName = file.name || '';
  const ext = '.' + (fileName.split('.').pop()?.toLowerCase() || '');

  // 1. Check MIME type first
  if (mime && ALLOWED_MIME_TYPES.includes(mime)) return true;

  // 2. Fallback: check extension
  if (ALLOWED_EXTENSIONS.includes(ext)) return true;

  // 3. Accept generic binary blobs that have a valid image extension
  if ((mime === '' || mime === 'application/octet-stream') && ALLOWED_EXTENSIONS.includes(ext)) {
    return true;
  }

  // 4. Some mobile browsers strip the filename entirely. Accept if MIME is
  //    a common image type or the file has reasonable size and no text content.
  if (!mime && !ext) return true;
  if (mime === 'application/octet-stream' && (!ext || ext === '.')) return true;

  return false;
}

async function processAndStore(buffer: Buffer, fileName: string): Promise<string> {
  try {
    // Primary conversion: WebP + MongoDB storage
    const webpBuffer = await sharp(buffer, { failOn: 'none' })
      .rotate() // Auto-rotate based on EXIF (phones often store rotated)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const base64 = webpBuffer.toString('base64');
    return await storeImage(base64, 'image/webp', fileName);
  } catch (primaryErr) {
    // Primary conversion failed (e.g., HEIC unsupported on this platform)
    console.warn(`[UPLOAD] Primary sharp conversion failed for "${fileName}":`, primaryErr);

    // Fallback: convert to JPEG (widely supported) and save to disk
    try {
      const jpegBuffer = await sharp(buffer, { failOn: 'none' })
        .rotate()
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const finalName = `${Date.now()}_${sanitizedName.split('.')[0]}.jpg`;
      const uploadDir = path.join(process.cwd(), 'public/uploads/products');
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, finalName), jpegBuffer);
      return `/uploads/products/${finalName}`;
    } catch (secondaryErr) {
      // Both conversions failed — caller will handle the error
      console.error(`[UPLOAD] Fallback JPEG conversion also failed for "${fileName}":`, secondaryErr);
      throw secondaryErr;
    }
  }
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
      return noCacheResponse(
        { error: 'The total size of your upload exceeds the server limit (4MB). Please upload one image at a time or use smaller images (under 4MB each).' },
        { status: 413 }
      );
    }

    const files = formData.getAll('files') as File[];
    if (!files || files.length === 0) {
      return noCacheResponse({ error: 'Please select at least one image to upload.' }, { status: 400 });
    }

    // Validate all files upfront
    let totalSize = 0;
    for (const file of files) {
      if (!isAllowedImage(file)) {
        const ext = file.name?.split('.').pop()?.toLowerCase() || 'unknown';
        return noCacheResponse(
          { error: `"${file.name}" could not be uploaded. This image format (${file.type || ext}) is not supported. Please use JPEG, PNG, WebP, or HEIC.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return noCacheResponse(
          { error: `"${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please choose a photo smaller than 4MB.` },
          { status: 400 }
        );
      }
      // Extra guard: some broken uploads report size 0
      if (file.size === 0) {
        return noCacheResponse(
          { error: `"${file.name}" appears to be empty or couldn't be read. Please try selecting the image again from your device.` },
          { status: 400 }
        );
      }
      totalSize += file.size;
    }

    if (totalSize > MAX_TOTAL_SIZE) {
      return noCacheResponse(
        { error: `The total size of all images (${(totalSize / 1024 / 1024).toFixed(1)}MB) exceeds the 4MB limit. Please upload one image at a time or use smaller images.` },
        { status: 400 }
      );
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

    if (urls.length === 0) {
      return noCacheResponse(
        { error: 'We couldn\'t upload your images right now. Please check your connection, make sure your images are in JPEG/PNG/WebP format, and try again.' },
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

    return noCacheResponse(response);
  } catch (error) {
    console.error('[FILE_UPLOAD_ERROR]', error);
    return noCacheResponse(
      { error: 'Something went wrong while uploading your image. Please check your internet connection and try again. If the issue persists, try using a smaller image.' },
      { status: 500 }
    );
  }
}
