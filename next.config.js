/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Vercel handles these automatically, so we'll simplify
  reactStrictMode: true,
  /* 
    We are removing manual headers and complex config to let 
    Vercel's default build pipeline handle the artifact collection.
  */
};

module.exports = nextConfig;
