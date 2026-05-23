import { MongoClient, ObjectId } from 'mongodb';

let client: MongoClient | null = null;
let dbPromise: Promise<any> | null = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const uri = process.env.DATABASE_URL || '';
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      await client.connect();
      return client.db();
    })();
  }
  return dbPromise;
}

export async function storeImage(
  data: string,
  mimeType: string,
  originalName: string
): Promise<string> {
  try {
    const database = await getDb();
    const result = await database.collection('images').insertOne({
      data,
      mimeType,
      originalName,
      createdAt: new Date(),
      size: Buffer.byteLength(data, 'base64'),
    });
    return `/img/${result.insertedId.toString()}`;
  } catch (error) {
    console.warn('[IMG_STORAGE] MongoDB upload failed, data URL fallback:', error);
    return `data:${mimeType};base64,${data}`;
  }
}

export async function getImage(
  id: string
): Promise<{ data: string; mimeType: string } | null> {
  try {
    const database = await getDb();

    let filter: any;
    try {
      filter = { _id: new ObjectId(id) };
    } catch {
      filter = { _id: id };
    }

    const doc = await database.collection('images').findOne(filter, {
      maxTimeMS: 5000,
    });

    if (!doc) return null;
    return { data: doc.data, mimeType: doc.mimeType || 'image/webp' };
  } catch (error) {
    console.error('[IMG_STORAGE] Failed to retrieve image:', error);
    return null;
  }
}
