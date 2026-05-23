// Test the upload route logic directly
const { optimizeImage } = require('./lib/imageService');
const { writeFile, mkdir } = require('fs/promises');
const path = require('path');

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file

// Create a simple test image buffer using sharp itself
const createTestImage = async () => {
  const sharp = require('sharp');
  return await sharp({
    create: {
      width: 100,
      height: 100,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 255 }
    }
  }).png().toBuffer();
};

async function testUploadRoute() {
  try {
    console.log('Testing upload route logic...');
    
    // Create test file
    const testImageBuffer = await createTestImage();
    const testFile = {
      name: 'test.png',
      type: 'image/png',
      size: testImageBuffer.length,
      arrayBuffer: () => Promise.resolve(testImageBuffer)
    };
    
    // Validate files before processing
    const files = [testFile];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`Invalid file type for "${file.name}". Allowed: JPEG, PNG, WebP.`);
      }
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`"${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 5MB per file.`);
      }
    }
    
    const urls = [];
    
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      try {
        // Try optimized upload via sharp
        const optimizedUrl = await optimizeImage(buffer, file.name);
        urls.push(optimizedUrl);
        console.log(`Optimized upload successful: ${optimizedUrl}`);
      } catch (optimizeErr) {
        // Fallback: save the original file without sharp optimization
        console.warn(`Sharp optimization failed for "${file.name}", saving original:`, optimizeErr.message);
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const finalName = `${Date.now()}_${sanitizedName}`;
        const uploadDir = path.join(process.cwd(), 'public/uploads/products');
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, finalName), buffer);
        urls.push(`/uploads/products/${finalName}`);
        console.log(`Fallback upload successful: /uploads/products/${finalName}`);
      }
    }
    
    console.log('All uploads completed:', urls);
    
    // Verify files exist
    for (const url of urls) {
      const fs = require('fs');
      const filePath = path.join(process.cwd(), 'public', url);
      if (fs.existsSync(filePath)) {
        console.log(`Verified file exists: ${filePath}`);
      } else {
        console.log(`WARNING: File does not exist: ${filePath}`);
      }
    }
    
  } catch (error) {
    console.error('Error in upload route test:', error.message);
    console.error('Stack:', error.stack);
  }
}

testUploadRoute();