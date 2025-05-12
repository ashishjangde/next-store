import type { NextConfig } from "next";
import { tree } from "next/dist/build/templates/app-page";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/a/**',
      }
    ],
  },
  eslint :{
    ignoreDuringBuilds : true
  }
};

export default nextConfig;
