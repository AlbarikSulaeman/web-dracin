/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Essential for App Router
  experimental: {
    appDir: true,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dramabox.sansekai.my.id',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.sansekai.my.id',
      },
    ],
  },
  
  // Add this for better App Router support
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;