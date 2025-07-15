import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['toprisebucket.s3.eu-north-1.amazonaws.com', 'firebasestorage.googleapis.com'],
  },
  /* config options here */
};

export default nextConfig;
