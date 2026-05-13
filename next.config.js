/** @type {import('next').NextConfig} */
const nextConfig = {
  // STANDALONE MODE is required for robust artifact collection on Vercel
  output: 'standalone',
  
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
};

module.exports = nextConfig;
