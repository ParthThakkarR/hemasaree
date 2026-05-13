import sharp from 'sharp';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

export const optimizeImage = async (buffer: Buffer, filename: string): Promise<string> => {
  const optimizedFilename = `${Date.now()}_${filename.split('.')[0]}.webp`;
  const uploadDir = path.join(process.cwd(), 'public/uploads/products');
  
  await mkdir(uploadDir, { recursive: true });
  const outputPath = path.join(uploadDir, optimizedFilename);

  await sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);

  return `/uploads/products/${optimizedFilename}`;
};

export const deleteImage = async (imagePath: string) => {
  // Logic to delete from local or S3
  console.log(`Deleting image: ${imagePath}`);
};
