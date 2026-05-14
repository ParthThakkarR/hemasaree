/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Enable standalone output only when explicitly requested (e.g. Docker build).
  // This avoids Vercel Next.js trace-copy failures with standalone output.
  output: process.env.NEXT_OUTPUT_STANDALONE === '1' ? 'standalone' : undefined,


  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: false, // Ensure image optimization is active
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
