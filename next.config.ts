import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // This is the magic line
  images: {
    unoptimized: true, // Required for static exports if you ever use next/image
  }
};

export default nextConfig;