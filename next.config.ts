import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.STATIC_EXPORT === 'true' ? 'export' : undefined,
  basePath: '/local-business-growth',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
