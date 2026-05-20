// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  mockSharp: {
    resize: vi.fn().mockReturnThis(),
    webp: vi.fn().mockReturnThis(),
    toFile: vi.fn().mockResolvedValue(undefined),
  },
  mockSharpFn: vi.fn(() => mocks.mockSharp),
  mockFs: {
    writeFile: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
  },
  mockPath: {
    join: vi.fn((...args) => args.join('/')),
    cwd: vi.fn(() => '/test/project'),
  },
}));

vi.mock('sharp', () => ({ default: mocks.mockSharpFn }));
vi.mock('fs/promises', () => ({
  writeFile: mocks.mockFs.writeFile,
  mkdir: mocks.mockFs.mkdir,
  default: mocks.mockFs,
}));
vi.mock('path', () => ({
  default: mocks.mockPath,
  join: mocks.mockPath.join,
}));

const { optimizeImage, deleteImage } = await import('@/lib/imageService');

describe('optimizeImage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('creates upload directory', async () => {
    await optimizeImage(Buffer.from('test'), 'image.jpg');
    expect(mocks.mockFs.mkdir).toHaveBeenCalled();
  });

  it('creates directory with recursive option', async () => {
    await optimizeImage(Buffer.from('test'), 'image.jpg');
    expect(mocks.mockFs.mkdir).toHaveBeenCalledWith(
      expect.any(String),
      { recursive: true }
    );
  });

  it('calls sharp with buffer', async () => {
    const buffer = Buffer.from('test');
    await optimizeImage(buffer, 'image.jpg');
    expect(mocks.mockSharpFn).toHaveBeenCalledWith(buffer);
  });

  it('resizes image', async () => {
    await optimizeImage(Buffer.from('test'), 'image.jpg');
    expect(mocks.mockSharp.resize).toHaveBeenCalledWith(
      1200, 1200, { fit: 'inside', withoutEnlargement: true }
    );
  });

  it('converts to webp', async () => {
    await optimizeImage(Buffer.from('test'), 'image.jpg');
    expect(mocks.mockSharp.webp).toHaveBeenCalledWith({ quality: 80 });
  });

  it('saves to file', async () => {
    await optimizeImage(Buffer.from('test'), 'image.jpg');
    expect(mocks.mockSharp.toFile).toHaveBeenCalled();
  });

  it('returns upload path', async () => {
    const result = await optimizeImage(Buffer.from('test'), 'image.jpg');
    expect(result).toMatch(/^\/uploads\/products\/\d+_image\.webp$/);
  });

  it('includes timestamp in filename', async () => {
    const result = await optimizeImage(Buffer.from('test'), 'image.jpg');
    const filename = result.split('/').pop();
    expect(filename).toMatch(/^\d+_image\.webp$/);
  });

  it('removes original extension', async () => {
    const result = await optimizeImage(Buffer.from('test'), 'photo.png');
    expect(result).toMatch(/_photo\.webp$/);
  });

  it('handles jpeg extension', async () => {
    const result = await optimizeImage(Buffer.from('test'), 'photo.jpeg');
    expect(result).toMatch(/_photo\.webp$/);
  });

  it('handles gif extension', async () => {
    const result = await optimizeImage(Buffer.from('test'), 'photo.gif');
    expect(result).toMatch(/_photo\.webp$/);
  });

  it('handles filename without extension', async () => {
    const result = await optimizeImage(Buffer.from('test'), 'photo');
    expect(result).toMatch(/_photo\.webp$/);
  });

  it('uses correct upload directory path', async () => {
    await optimizeImage(Buffer.from('test'), 'image.jpg');
    expect(mocks.mockPath.join).toHaveBeenCalledWith(
      expect.any(String), 'public/uploads/products'
    );
  });

  it('chains sharp methods', async () => {
    await optimizeImage(Buffer.from('test'), 'image.jpg');
    expect(mocks.mockSharp.resize).toHaveBeenCalled();
    expect(mocks.mockSharp.webp).toHaveBeenCalled();
    expect(mocks.mockSharp.toFile).toHaveBeenCalled();
  });

  it('handles empty buffer', async () => {
    await expect(optimizeImage(Buffer.from(''), 'image.jpg')).resolves.toBeDefined();
  });

  it('handles large buffer', async () => {
    const largeBuffer = Buffer.alloc(1024 * 1024);
    await expect(optimizeImage(largeBuffer, 'large.jpg')).resolves.toBeDefined();
  });

  it('returns string path', async () => {
    const result = await optimizeImage(Buffer.from('test'), 'image.jpg');
    expect(typeof result).toBe('string');
  });

  it('path starts with /uploads/products/', async () => {
    const result = await optimizeImage(Buffer.from('test'), 'image.jpg');
    expect(result.startsWith('/uploads/products/')).toBe(true);
  });

  it('uses webp format', async () => {
    const result = await optimizeImage(Buffer.from('test'), 'image.jpg');
    expect(result.endsWith('.webp')).toBe(true);
  });

  it('handles special characters in filename', async () => {
    const result = await optimizeImage(Buffer.from('test'), 'my-image_01.jpg');
    expect(result).toMatch(/_my-image_01\.webp$/);
  });
});

describe('deleteImage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('logs delete message', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await deleteImage('/uploads/products/image.webp');
    expect(consoleSpy).toHaveBeenCalledWith('Deleting image: /uploads/products/image.webp');
    consoleSpy.mockRestore();
  });

  it('handles empty path', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await deleteImage('');
    expect(consoleSpy).toHaveBeenCalledWith('Deleting image: ');
    consoleSpy.mockRestore();
  });

  it('handles null path', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await deleteImage(null);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('handles undefined path', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await deleteImage(undefined);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('handles relative path', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await deleteImage('./uploads/image.webp');
    expect(consoleSpy).toHaveBeenCalledWith('Deleting image: ./uploads/image.webp');
    consoleSpy.mockRestore();
  });

  it('handles S3 URL', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await deleteImage('https://s3.amazonaws.com/bucket/image.webp');
    expect(consoleSpy).toHaveBeenCalledWith('Deleting image: https://s3.amazonaws.com/bucket/image.webp');
    consoleSpy.mockRestore();
  });

  it('returns undefined', async () => {
    const result = await deleteImage('/uploads/products/image.webp');
    expect(result).toBeUndefined();
  });

  it('handles path with query params', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await deleteImage('/uploads/products/image.webp?v=123');
    expect(consoleSpy).toHaveBeenCalledWith('Deleting image: /uploads/products/image.webp?v=123');
    consoleSpy.mockRestore();
  });
});
