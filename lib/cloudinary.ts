const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const isCloudinaryConfigured = !!(cloudName && uploadPreset);
const apiUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

export async function uploadToCloudinary(
  file: File,
  folder: string = 'products'
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset!);
  formData.append('folder', `hemasaree/${folder}`);

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
