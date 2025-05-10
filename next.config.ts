import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'localhost', 
      'streamo-backend.onrender.com',
      'promisedis-files.s3.us-east-1.amazonaws.com',
      'promisedis-files.s3.amazonaws.com',
      's3.us-east-1.amazonaws.com'
    ],
    unoptimized: true  // Add this for better S3 image handling
  },
};

export default nextConfig;
