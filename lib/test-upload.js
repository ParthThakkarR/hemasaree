const sharp = require('sharp');
const path = require('path');
const { writeFile, mkdir } = require('fs/promises');

const optimizeImage = async (buffer, filename) => {
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

// Create a simple test image buffer using sharp itself
const createTestImage = async () => {
  return await sharp({
    create: {
      width: 100,
      height: 100,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 255 }
    }
  }).png().toBuffer();
};

async function testUpload() {
  try {
    console.log('Creating test image...');
    const testImageBuffer = await createTestImage();
    console.log('Testing image optimization...');
    const result = await optimizeImage(testImageBuffer, 'test.png');
    console.log('Success! Optimized image URL:', result);
    
    // Check if file exists
    const fs = require('fs');
    const filePath = path.join(process.cwd(), 'public', result);
    if (fs.existsSync(filePath)) {
      console.log('File exists at:', filePath);
      const stats = fs.statSync(filePath);
      console.log('File size:', stats.size, 'bytes');
    } else {
      console.log('File does not exist at:', filePath);
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testUpload();