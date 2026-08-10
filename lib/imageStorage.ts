import { prisma } from '@lib/prisma';

export async function storeImage(
  data: string,
  mimeType: string,
  originalName: string
): Promise<string> {
  try {
    const image = await prisma.image.create({
      data: {
        data,
        mimeType,
        originalName,
        size: Buffer.byteLength(data, 'base64'),
      },
    });
    return `/img/${image.id}`;
  } catch (error) {
    console.warn('[IMG_STORAGE] MongoDB upload failed, data URL fallback:', error);
    return `data:${mimeType};base64,${data}`;
  }
}

export async function getImage(
  id: string
): Promise<{ data: string; mimeType: string } | null> {
  try {
    const doc = await prisma.image.findUnique({
      where: { id },
      select: { data: true, mimeType: true },
    });

    if (!doc) return null;
    return { data: doc.data, mimeType: doc.mimeType || 'image/webp' };
  } catch (error) {
    console.error('[IMG_STORAGE] Failed to retrieve image:', error);
    return null;
  }
}
