import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['toprisebucket.s3.eu-north-1.amazonaws.com', 'firebasestorage.googleapis.com', '193.203.161.146'],
  },
  /* config options here */
};

export default nextConfig;
