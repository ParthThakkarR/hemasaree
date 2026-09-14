/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Enable standalone output only when explicitly requested (e.g. Docker build).
  // This avoids Vercel Next.js trace-copy failures with standalone output.
  output: process.env.NEXT_OUTPUT_STANDALONE === '1' ? 'standalone' : undefined,

  // Sharp is a native C++ addon — exclude it from webpack bundling
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },


  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    unoptimized: false,
    // Tuned for saree product photography — covers mobile (375–414px),
    // tablet (768–1024px), and desktop (1280–1920px) breakpoints
    deviceSizes: [375, 414, 640, 750, 828, 1080, 1200, 1440, 1920],
    imageSizes: [48, 64, 80, 96, 128, 256, 384],
    formats: ['image/webp'],
  },

  // Add performance and security headers
  async headers() {
    return [
      {
        // Cache static assets aggressively
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache optimized images
        source: '/_next/image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        // API routes — prevent caching of dynamic data unless route specifies otherwise
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },

  // Disable powered by header for security and to keep headers clean
  poweredByHeader: false,

  // Standardize build behavior
  reactStrictMode: true,

  // Enable full build checks for production stability
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  // Explicit webpack aliases to guarantee module resolution on all platforms.
  // This mirrors the tsconfig "paths" and fixes Vercel/CI builds where
  // Next.js's built-in tsconfig path support can silently fail.
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@contexts': path.resolve(__dirname, 'app/contexts'),
      '@components': path.resolve(__dirname, 'app/components'),
      '@lib': path.resolve(__dirname, 'app/lib'),
      '@utils': path.resolve(__dirname, 'app/utils'),
      '@': path.resolve(__dirname),
    };
    return config;
  },
};

module.exports = nextConfig;
