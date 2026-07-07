const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const isCloudinaryConfigured = !!(cloudName && uploadPreset);
const apiUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.85;

function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);

      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Browser does not support image compression'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Image compression failed'));
        },
        'image/jpeg',
        JPEG_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to read image. It may be corrupted or an unsupported format.'));
    };
    img.src = URL.createObjectURL(file);
  });
}

export async function uploadToCloudinary(
  file: File,
  folder: string = 'products'
): Promise<string> {
  const compressed = await compressImage(file);

  const signRes = await fetch('/api/admin/cloudinary-signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder }),
    credentials: 'include',
  });

  if (!signRes.ok) {
    const data = await signRes.json().catch(() => null);
    throw new Error(
      data?.error || 'Upload authorization failed. Please try again.'
    );
  }

  const { signature, timestamp, api_key, folder: cloudFolder, upload_preset: preset } = await signRes.json();

  const formData = new FormData();
  formData.append('file', compressed, file.name.replace(/\.[^.]+$/, '.jpg'));
  formData.append('api_key', api_key);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('folder', cloudFolder);
  formData.append('upload_preset', preset);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error?.message || 'Image upload failed. Please try again.'
      );
    }

    const data = await response.json();
    return data.secure_url as string;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error(
        'Upload is taking too long. Please check your internet connection or try with a smaller image.'
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function uploadMultipleToCloudinary(
  files: FileList,
  folder: string = 'products'
): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const url = await uploadToCloudinary(files[i], folder);
    urls.push(url);
  }
  return urls;
}
