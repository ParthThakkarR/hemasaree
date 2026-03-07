/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Allow your CDN or shop domain
      {
        protocol: 'https',
        hostname: 'kapaaskatha.in',
        pathname: '**',
      },
      // Optional: allow Shopify/CDNs etc if you use them
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '**',
      },
      // Allow any generic CDN
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
