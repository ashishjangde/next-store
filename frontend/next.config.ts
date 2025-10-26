import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/a/**',
      },
      {
        protocol: 'https',
        hostname: 'in-maa-1.linodeobjects.com',
        pathname: '/nextstorebucket/**',
      },
      {
        protocol: 'https',
        hostname: 's3.ap-south-1.amazonaws.com',
        pathname: '/nextstore-bucket/**',
      }
    ],
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
