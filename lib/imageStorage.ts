import { MongoClient } from 'mongodb';
import sharp from 'sharp';

let client: MongoClient | null = null;
let dbPromise: Promise<any> | null = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const uri = process.env.DATABASE_URL || '';
      client = new MongoClient(uri);
      await client.connect();
      return client.db();
    })();
  }
  return dbPromise;
}

export async function storeImage(
  buffer: Buffer,
  originalName: string
): Promise<string> {
  const webpBuffer = await sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  try {
    const database = await getDb();
    const result = await database.collection('images').insertOne({
      data: webpBuffer.toString('base64'),
      mimeType: 'image/webp',
      originalName,
      createdAt: new Date(),
      size: webpBuffer.length,
    });
    return `/api/uploads/${result.insertedId.toString()}`;
  } catch (error) {
    console.warn('[IMG_STORAGE] MongoDB storage failed, using data URL fallback:', error);
    return `data:image/webp;base64,${webpBuffer.toString('base64')}`;
  }
}

export async function getImage(
  id: string
): Promise<{ data: string; mimeType: string } | null> {
  try {
    const database = await getDb();
    const { ObjectId } = await import('bson');
    let filter: any;
    try {
      filter = { _id: new ObjectId(id) };
    } catch {
      filter = { _id: id };
    }
    const doc = await database.collection('images').findOne(filter);
    if (!doc) return null;
    return { data: doc.data, mimeType: doc.mimeType || 'image/webp' };
  } catch (error) {
    console.error('[IMG_STORAGE] Failed to retrieve image:', error);
    return null;
  }
}
